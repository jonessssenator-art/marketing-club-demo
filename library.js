const resourceTypes = ['Книга', 'Видео', 'Статья', 'Курс', 'Сервис', 'Шаблон'];
const resourceTopics = ['Стратегия', 'Брендинг', 'Контент', 'Аналитика', 'Продажи', 'Управление'];
const resourceIcons = {Книга:'library', Видео:'video', Статья:'rules', Курс:'course', Сервис:'service', Шаблон:'template'};
let libraryQuery = '', libraryType = 'Все', libraryTopic = 'Все темы', favoritesOnly = false;
function resourceExamples() {
  return [
    ['Книга','Стратегия','Книжная полка маркетолога','Книги о позиционировании, клиентах и стратегии бренда.'],
    ['Видео','Брендинг','Разбор бренда: от идеи до запуска','Запись встречи или видеоразбор проекта с практическими выводами.'],
    ['Статья','Контент','Контент, который решает задачи','Полезная статья о планировании и оценке контента.'],
    ['Курс','Аналитика','Аналитика для маркетолога','Обучение работе с показателями и результатами продвижения.'],
    ['Сервис','Управление','Инструменты для команды','Сервисы для планирования задач и совместной работы.'],
    ['Шаблон','Продажи','Бриф на маркетинговую задачу','Шаблон для подготовки к разбору кейса с участниками клуба.']
  ].map(([type,topic,title,description],i)=>({id:'sample-'+i,type,topic,title,description,author:'Пример наполнения',url:'',example:true,createdAt:'2026-10-05'}));
}
function resourceById(id) { return db.resources.find(r=>String(r.id)===String(id)); }
function myFavorites() { return db.favorites[me] || []; }
function safeResourceURL(value) {
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null; }
  catch { return null; }
}
function library() {
  $('#app').innerHTML = head('ЗНАНИЯ, КОТОРЫМИ ДЕЛИМСЯ','Библиотека клуба','Книги, видео и инструменты — всё полезное в одном месте.',mode==='admin'?button('+ Добавить материал','resource-new'):'') + `
    <section class="library-intro"><div><span class="eyebrow">ОТ ЗНАНИЙ К ДЕЙСТВИЮ</span><h2>Наш общий запас идей.</h2><p>Возвращайтесь к полезному, находите новые подходы<br>и сохраняйте материалы для своих проектов.</p></div><div class="library-art" aria-hidden="true"><span>ЗНАТЬ</span><span>ПРОБОВАТЬ</span><span>ДЕЛИТЬСЯ ↗</span></div></section>
    <div class="toolbar library-toolbar"><input id="library-search" type="search" aria-label="Поиск материалов" placeholder="Название, автор или ключевое слово" value="${esc(libraryQuery)}"><select id="library-topic" aria-label="Тема материала">${['Все темы',...resourceTopics].map(t=>`<option ${libraryTopic===t?'selected':''}>${t}</option>`).join('')}</select></div>
    <div class="library-filters"><div class="resource-tabs" aria-label="Тип материала">${['Все',...resourceTypes].map(t=>`<button data-resource-type="${t}" class="resource-tab ${libraryType===t?'selected':''}" aria-pressed="${libraryType===t}">${t==='Все'?'Все материалы':t}</button>`).join('')}</div><button id="favorite-filter" class="resource-tab ${favoritesOnly?'selected':''}" aria-pressed="${favoritesOnly}">${icon('heart')} Избранное</button></div><div id="library-results"></div>`;
  $('#library-search').oninput=e=>{libraryQuery=e.target.value;libraryResults()};
  $('#library-topic').onchange=e=>{libraryTopic=e.target.value;libraryResults()};
  document.querySelectorAll('[data-resource-type]').forEach(b=>b.onclick=()=>{libraryType=b.dataset.resourceType;library()});
  $('#favorite-filter').onclick=()=>{favoritesOnly=!favoritesOnly;library()};
  libraryResults();bind();
}
function libraryResults() {
  const favorites=myFavorites();
  const list=db.resources.filter(r=>(libraryType==='Все'||r.type===libraryType)&&(libraryTopic==='Все темы'||r.topic===libraryTopic)&&(!favoritesOnly||favorites.includes(r.id))&&[r.title,r.author,r.description,r.topic].join(' ').toLocaleLowerCase('ru').includes(libraryQuery.trim().toLocaleLowerCase('ru')));
  $('#library-results').innerHTML=`<p class="result-count" aria-live="polite">Материалов: ${list.length}</p><div class="cards resource-grid">${list.map(r=>`<article class="card resource-card"><div class="resource-cover" data-kind="${esc(r.type)}"><span class="resource-format">${esc(r.type)} / ${esc(r.topic)}</span><span class="resource-glyph" aria-hidden="true">${icon(resourceIcons[r.type]||'library')}</span><button class="bookmark ${favorites.includes(r.id)?'saved':''}" data-action="favorite:${esc(r.id)}" aria-label="${favorites.includes(r.id)?'Убрать из избранного':'В избранное'}: ${esc(r.title)}" aria-pressed="${favorites.includes(r.id)}">${icon('heart')}</button></div><div class="resource-copy"><small>${esc(r.author||r.topic)}</small><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><div class="resource-bottom">${r.example?'<span class="sample-label">Пример карточки</span>':`<span class="sample-label">${esc(r.topic)}</span>`}${button('Подробнее ↗','resource-view:'+r.id,'text-button')}</div></div></article>`).join('')||`<div class="empty"><h3>${favoritesOnly?'Здесь будет ваше избранное':'Материалов не найдено'}</h3><p>${favoritesOnly?'Нажмите сердечко на карточке, чтобы сохранить материал.':'Измените запрос или сбросьте фильтры.'}</p><button class="text-button" id="reset-library">Показать все материалы</button></div>`}</div>`;
  if($('#reset-library'))$('#reset-library').onclick=()=>{libraryQuery='';libraryType='Все';libraryTopic='Все темы';favoritesOnly=false;library()};bind();
}
function commitLibrary(action,mutate) {
  const previous=JSON.parse(JSON.stringify(db));mutate();
  if(save(action))return true;
  db=previous;return false;
}
function toggleFavorite(id) {
  const r=resourceById(id);if(!r)return;
  const saved=myFavorites().includes(r.id);
  if(commitLibrary(`${saved?'Удалён из':'Добавлен в'} избранное материал: ${r.title}`,()=>{db.favorites[me]=saved?myFavorites().filter(x=>x!==r.id):[...myFavorites(),r.id]})){
    libraryResults();toast(saved?'Материал убран из избранного':'Материал сохранён в избранном');
  }
}
function resourceView(id) {
  const r=resourceById(id);if(!r)return;
  const url=safeResourceURL(r.url);
  modal(`<span class="eyebrow">${esc(r.type)} / ${esc(r.topic)}</span><h2>${esc(r.title)}</h2><p>${esc(r.author)}</p><div class="detail-section resource-description">${esc(r.description)}</div>${r.example?'<p class="info-strip">Это пример наполнения библиотеки. Администратор может заменить его настоящим материалом и добавить ссылку.</p>':''}${url?`<a class="primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Открыть ${r.type==='Видео'?'видео':'материал'} ↗</a><p class="small-note">Источник: ${esc(new URL(url).hostname)}</p>`:'<p class="small-note">Ссылка пока не добавлена.</p>'}${mode==='admin'?`<div class="resource-admin">${button('Редактировать','resource-edit:'+r.id,'text-button')}${button('Удалить материал','resource-delete:'+r.id,'text-button danger')}</div>`:''}`);bind();
}
function resourceEdit(id) {
  if(mode!=='admin')return;
  const r=id?resourceById(id):{type:'Книга',topic:'Стратегия',title:'',author:'',description:'',url:''};if(!r)return;
  modal(`<span class="eyebrow">БИБЛИОТЕКА КЛУБА</span><h2>${id?'Редактировать материал':'Новый материал'}</h2><form id="resource-form"><label>Название<input name="title" required maxlength="160" value="${esc(r.title)}"></label><div class="form-grid"><label>Формат<select name="type">${resourceTypes.map(t=>`<option ${t===r.type?'selected':''}>${t}</option>`).join('')}</select></label><label>Тема<select name="topic">${resourceTopics.map(t=>`<option ${t===r.topic?'selected':''}>${t}</option>`).join('')}</select></label></div><label>Автор / источник<input name="author" maxlength="160" value="${esc(r.author)}" placeholder="Автор книги, спикер или название сервиса"></label><label>Ссылка на материал<input name="url" type="url" required maxlength="2000" placeholder="https://…" value="${esc(r.url)}"></label><label>Описание<textarea name="description" required maxlength="2000" placeholder="О чём материал и чем он полезен">${esc(r.description)}</textarea></label><p class="small-note">Можно добавить ссылку на книгу, видео, статью, курс, сервис или файл с шаблоном.</p><button class="primary" type="submit">Сохранить материал</button></form>`);
  $('#resource-form').onsubmit=e=>{
    e.preventDefault();const data=Object.fromEntries(new FormData(e.target));for(const k in data)data[k]=data[k].trim();
    if(!data.title||!data.description)return toast('Укажите название и описание');
    if(!safeResourceURL(data.url))return toast('Укажите ссылку с https:// или http://');
    const next={...data,id:r.id||crypto.randomUUID(),example:false,createdAt:r.createdAt||today()};
    if(commitLibrary(`Сохранён материал: ${next.title}`,()=>{if(id)db.resources[db.resources.findIndex(x=>x.id===r.id)]=next;else db.resources.unshift(next)})){$('#dialog').close();library();toast('Материал сохранён в этом браузере')}
  };
}
function resourceDelete(id) {
  if(mode!=='admin')return;const r=resourceById(id);if(!r)return;
  modal(`<h2>Удалить материал?</h2><p>${esc(r.title)}</p><p class="detail-section">Карточка исчезнет из библиотеки и избранного. Сам материал по внешней ссылке останется доступен.</p><div class="actions"><button class="primary" id="confirm-resource-delete">Удалить из каталога</button><button class="text-button" id="cancel-resource-delete">Отмена</button></div>`);
  $('#cancel-resource-delete').onclick=()=>resourceView(id);
  $('#confirm-resource-delete').onclick=()=>{if(commitLibrary(`Удалён материал: ${r.title}`,()=>{db.resources=db.resources.filter(x=>x.id!==r.id);for(const key in db.favorites)db.favorites[key]=db.favorites[key].filter(x=>x!==r.id)})){$('#dialog').close();library();toast('Материал удалён')}};
}
