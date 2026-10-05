function defaultClubSettings(){return {dues:{amount:4000,months:6},banner:{label:'MARKETING CLUB / ДАГЕСТАН',title:'Здесь знают,\nс кем делать дело.',description:'Находите своих людей, обменивайтесь опытом\nи создавайте проекты вместе.',buttonText:'Познакомиться с участниками',url:'#members',date:'',place:''}}}
function profileContactPlaceholders(){
  const contacts=[
    ['WhatsApp','Написать в WhatsApp','<path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5z"/><path d="M8 7c0 5 4 9 9 9l1-3-3-1-1 2c-2-1-3-2-4-4l2-1-1-3z"/>'],
    ['Telegram','@username','<path d="m21 3-4 18-6-5-4 3 1-6L21 3 2 10l6 3m3 3 6-8"/>'],
    ['Телефон','+7 (___) ___-__-__','<path d="m7 3 3 5-2 2c1.5 3 3 4.5 6 6l2-2 5 3-1 4C10 22 2 14 3 4z"/>'],
    ['Instagram','@username','<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>']
  ];
  return `<section class="profile-contacts"><h3>Контакты</h3><div class="contact-grid">${contacts.map(([name,value,path])=>`<button type="button" class="contact-placeholder" data-contact-demo aria-label="${name}: демонстрационный контакт"><span class="contact-icon"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg></span><span><strong>${name}</strong><small>${value}</small></span><span class="contact-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><p class="small-note">Пример контактных данных. Номер и аккаунты пока не указаны.</p></section>`;
}
function monthLabel(n){const a=n%10,b=n%100;return b>=11&&b<=14?'месяцев':a===1?'месяц':a>=2&&a<=4?'месяца':'месяцев'}
function duesLabel(){const d=db.settings.dues;return `${money(d.amount)} за ${d.months} ${monthLabel(d.months)}`}
function settings(){
  if(mode!=='admin')return;
  $('#app').innerHTML=head('АДМИНИСТРАТОР','Настройки','Параметры клуба и пространства.')+`<section class="settings-coming-soon"><div class="settings-coming-icon">${icon('admin')}</div><span class="coming-badge">В разработке</span><h2>Данный раздел ещё в разработке</h2><p>Здесь появятся настройки клуба.</p><a class="primary" href="#overview">Вернуться к обзору</a></section>`;
}
function commitSettings(action,mutate){const previous=JSON.parse(JSON.stringify(db));mutate();if(save(action))return true;db=previous;return false}
function bannerURL(value){
  if(/^#(overview|members|library|rules|profile)$/.test(value))return value;
  try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}
}
function heroBanner(){
  const b=db.settings.banner,url=bannerURL(b.url),link=b.buttonText&&url?`<a class="light-button" href="${esc(url)}" ${url.startsWith('#')?'':'target="_blank" rel="noopener noreferrer"'}>${esc(b.buttonText)} ↗</a>`:'';
  return `<section class="hero"><div class="hero-copy"><span class="pill">${esc(b.label)}</span><h2>${esc(b.title).replace(/\n/g,'<br>')}</h2><p class="banner-description">${esc(b.description)}</p>${b.date||b.place?`<div class="banner-details">${b.date?`<span>${date(b.date)}</span>`:''}${b.place?`<span>${esc(b.place)}</span>`:''}</div>`:''}${link}</div><div class="hero-art" aria-hidden="true"><div class="original-logo"><img src="club-reference.png" alt=""></div><i>В ОДНОМ КРУГУ</i></div></section>`;
}
function editBanner(){
  if(mode!=='admin')return;
  const b=db.settings.banner;
  modal(`<span class="eyebrow">ОБЗОР КЛУБА</span><h2>Редактировать главную плашку</h2><form id="banner-form"><label>Подпись / тип анонса<input name="label" maxlength="100" value="${esc(b.label)}" placeholder="Например: Встреча клуба"></label><label>Заголовок<textarea name="title" required maxlength="180" rows="2">${esc(b.title)}</textarea></label><label>Описание<textarea name="description" maxlength="1000">${esc(b.description)}</textarea></label><div class="form-grid"><label>Дата мероприятия — необязательно<input name="date" type="date" value="${esc(b.date)}"></label><label>Место — необязательно<input name="place" maxlength="150" value="${esc(b.place)}" placeholder="Место встречи или Онлайн"></label></div><label>Текст кнопки — необязательно<input name="buttonText" maxlength="60" value="${esc(b.buttonText)}"></label><label>Ссылка кнопки<input name="url" maxlength="2000" value="${esc(b.url)}" placeholder="https://… или #members"></label><p class="small-note">Ссылка может вести на регистрацию или раздел клуба: #members, #library, #rules. Чтобы убрать кнопку, очистите её текст и ссылку.</p><button class="primary" type="submit">Сохранить плашку</button></form>`);
  $('#banner-form').onsubmit=e=>{
    e.preventDefault();if(mode!=='admin')return;
    const b=Object.fromEntries(new FormData(e.target));for(const k in b)b[k]=b[k].trim();
    if(!b.title)return toast('Введите заголовок');
    if((b.buttonText||b.url)&&(!b.buttonText||!bannerURL(b.url)))return toast('Укажите текст кнопки и корректную ссылку либо очистите оба поля');
    if(commitSettings('Обновлена главная плашка: '+b.title,()=>{db.settings.banner=b})){$('#dialog').close();render();toast('Главная плашка обновлена')}
  };
}
