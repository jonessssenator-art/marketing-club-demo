function defaultClubSettings(){return {dues:{amount:4000,months:6},banner:{label:'MARKETING CLUB / ДАГЕСТАН',title:'Здесь знают,\nс кем делать дело.',description:'Находите своих людей, обменивайтесь опытом\nи создавайте проекты вместе.',buttonText:'Познакомиться с участниками',url:'#members',date:'',place:''}}}
function monthLabel(n){const a=n%10,b=n%100;return b>=11&&b<=14?'месяцев':a===1?'месяц':a>=2&&a<=4?'месяца':'месяцев'}
function duesLabel(){const d=db.settings.dues;return `${money(d.amount)} за ${d.months} ${monthLabel(d.months)}`}
function settings(){
  if(mode!=='admin')return;
  const d=db.settings.dues;
  $('#app').innerHTML=head('АДМИНИСТРАТОР','Настройки клуба','Условия участия и информация на главной странице.')+`<section class="panel settings-panel"><div class="section-title"><h2>Членские взносы</h2><span class="badge active">${duesLabel()}</span></div><form id="dues-settings-form"><div class="form-grid"><label>Размер взноса, ₽<input name="amount" type="number" min="1" max="10000000" step="1" required value="${d.amount}"></label><label>Срок участия, месяцев<input name="months" type="number" min="1" max="60" step="1" required value="${d.months}"></label></div><p class="small-note">Новые условия появятся в обзоре, правилах вступления и форме записи взноса. Ранее записанные суммы и оплаченные периоды сохранятся.</p><button class="primary" type="submit">Сохранить условия взноса</button></form></section><section class="panel settings-panel"><h2>Главная плашка</h2><p>Анонс встречи, мероприятие или важная информация для участников.</p><div class="rule-actions">${button('Редактировать плашку','banner-edit')}</div></section>`;
  $('#dues-settings-form').onsubmit=e=>{
    e.preventDefault();if(mode!=='admin')return;
    const f=new FormData(e.target),amount=Number(f.get('amount')),months=Number(f.get('months'));
    if(!Number.isInteger(amount)||amount<1||amount>10000000||!Number.isInteger(months)||months<1||months>60)return toast('Укажите корректную сумму и срок от 1 до 60 месяцев');
    if(commitSettings(`Изменены условия взноса: ${money(amount)}, ${months} ${monthLabel(months)}`,()=>{db.settings.dues={amount,months}})){settings();toast('Новые условия взноса сохранены')}
  };bind();
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
