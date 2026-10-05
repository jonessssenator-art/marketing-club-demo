import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const build=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(build,'../..');
const skill=process.env.PRESENTATIONS_SKILL_DIR;
const python=process.env.PYTHON_EXECUTABLE || 'python3';
if (!skill) throw new Error('Set PRESENTATIONS_SKILL_DIR to the Codex Presentations skill directory.');
const {resolvePresentationFont,finalizePresentation,applyPresentationChartFont}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const font=resolvePresentationFont({fontFamily:'Arial'});
const pres=Presentation.create({slideSize:{width:1600,height:900}});
const C={ink:'#282232',muted:'#756B81',purple:'#7140CC',lime:'#C0F52D',paper:'#FAF8FC'};
function text(s,str,x,y,w,h,size=24,color=C.ink,bold=false){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=str;a.text.style={typeface:font,fontSize:size,bold,color,autoFit:'none',verticalAlignment:'top'};return a;}
async function img(s,file,x,y,w,h,extra={}){return s.images.add({blob:new Uint8Array(await fs.readFile(path.join(build,'assets',file))),contentType:'image/png',position:{left:x,top:y,width:w,height:h},fit:'contain',...extra});}
function footer(s,dark=false){text(s,'подготовлено xxvii',65,857,350,28,17,dark?'#E9DDF9':C.muted);}
function base(n,title,sub){const s=pres.slides.add();s.background.fill=C.paper;text(s,'MARKETING CLUB',65,35,500,35,18,C.purple,true);text(s,String(n).padStart(2,'0'),1460,35,65,35,18,C.muted);text(s,title,65,99,1440,80,58);text(s,sub,65,181,1440,58,25,C.muted);footer(s);return s;}
function item(s,title,body,x,y,w=360){text(s,title,x,y,w,37,27,C.ink,true);text(s,body.replaceAll('\n',' '),x,y+42,w,145,23,C.muted);}
async function devices(s,desktop,mobile){
 text(s,'НА КОМПЬЮТЕРЕ',867,279,430,30,17,C.purple,true);
 await img(s,desktop,865,325,425,295,{geometry:'roundRect',borderRadius:10});
 text(s,'НА ТЕЛЕФОНЕ',1320,245,240,28,17,C.purple,true);
 // The screen is inset inside a separately generated transparent hardware frame.
 s.shapes.add({geometry:'roundRect',position:{left:1329,top:308,width:212,height:478},fill:'#211F2A',line:{fill:'none',width:0}});
 await img(s,mobile,1329,325,212,460,{geometry:'roundRect',borderRadius:15});
 await img(s,'phone-frame.png',1314,292,243,514);
 text(s,'Все основные разделы\nдоступны с любого экрана.',869,669,409,80,27,C.ink);
}
{
 const s=pres.slides.add();s.background.fill=C.purple;
 await img(s,'logo-final.png',1220,290,265,265,{geometry:'ellipse'});
 text(s,'КЛУБ МАРКЕТОЛОГОВ ДАГЕСТАНА',65,69,1100,42,23,'#E9DDF9');
 text(s,'MARKETING',59,221,1450,170,143,C.lime,true);text(s,'CLUB',59,376,1000,174,143,C.lime,true);
 text(s,'Платформа для участников\nи управления клубом',68,631,1190,112,48,'#FFFFFF');
 text(s,'Анкеты, материалы и дела клуба в одном месте',71,789,1200,42,26,'#E9DDF9');footer(s,true);
 s.speakerNotes.textFrame.setText('Marketing Club. Концепция платформы. Логотип из текущего проекта, сохранён без изменения.');
}

function detail(s,title,body,y,w=480){text(s,title,65,y,w,44,31,C.ink,true);text(s,body,65,y+53,w,133,27,C.muted);}
async function screen(s,file){await img(s,file,650,265,850,590,{geometry:'roundRect',borderRadius:14});}
async function phone(s,file,x,y,w){const h=w*1825/862; s.shapes.add({geometry:'roundRect',position:{left:x+w*.062,top:y+h*.033,width:w*.872,height:h*.93},fill:'#211F2A',line:{fill:'none',width:0}});await img(s,file,x+w*.062,y+h*.065,w*.872,h*.895,{geometry:'roundRect',borderRadius:15});await img(s,'phone-frame.png',x,y,w,h);}
{
 const s=base(2,'Участнику: обзор и личная анкета','Новости клуба и информация о себе всегда под рукой');
 detail(s,'Обзор клуба','Главная страница с новостями и анонсами. Здесь видно, что происходит в клубе и когда пройдёт ближайшая встреча.',290);
 detail(s,'Моя анкета','Участник сам обновляет фото, рассказывает о работе и проектах. Указывает, чем может помочь и с кем хочет познакомиться.',510);
 text(s,'Не нужно каждый раз отправлять новую анкету администратору.',65,743,480,84,26,C.purple);
 await screen(s,'overview-large.png');
}
{
 const s=base(3,'Участнику: люди и контакты','Каталог помогает найти специалиста, партнёра или подрядчика');
 detail(s,'Поиск по участникам','Найти человека можно по имени, городу или специализации. Фотографии помогают быстрее узнать знакомых.',290);
 detail(s,'Подробная анкета','Опыт, компания, проекты и запросы на сотрудничество. Для связи предусмотрены телефон, WhatsApp, Telegram и Instagram.',510);
 text(s,'В демонстрационных анкетах контакты пока заменены примерами.',65,752,480,77,24,C.muted);
 await screen(s,'member-desktop.png');
}
{
 const s=base(4,'Участнику: библиотека и правила','Полезные материалы и условия участия собраны в одном месте');
 detail(s,'Библиотека','Книги, видео, статьи и сервисы с описаниями и ссылками. Можно выбрать тему, найти материал и сохранить его в избранное.',290);
 detail(s,'Правила клуба','Все правила общения и условия вступления доступны в отдельном разделе. Не нужно искать старое сообщение в чате.',510);
 text(s,'Полезные ссылки остаются под рукой даже после активной переписки.',65,743,480,84,26,C.purple);
 await screen(s,'library-member.png');
}
{
 const s=base(5,'Клуб в телефоне','Те же разделы адаптированы под небольшой экран');
 await phone(s,'member-mobile.png',128,245,275);await phone(s,'admin-mobile.png',892,245,275);
 text(s,'Участник',445,290,350,45,33,C.purple,true);
 text(s,'Ищет людей и открывает анкеты.\n\nЧитает правила, находит материалы и обновляет информацию о себе.',445,363,335,260,28,C.muted);
 text(s,'Администратор',1200,290,335,45,32,C.purple,true);
 text(s,'Смотрит участников и проверяет оплаты.\n\nЗаписывает замечания и редактирует информацию клуба.',1200,363,335,260,28,C.muted);
 text(s,'Светлая и тёмная темы доступны и на телефоне.',445,735,370,89,25,C.ink);
}
{
 const s=base(6,'Администратору: участники','Работа с составом клуба вместо разрозненных таблиц и сообщений');
 detail(s,'Заявки на вступление','Посмотреть данные кандидата и принять решение. В анкете собрана информация, которую обычно присылают сообщением.',290);
 detail(s,'Управление составом','Добавлять людей, открывать и редактировать анкеты. Находить нужного участника и исключать его из клуба.',510);
 text(s,'Участникам и администратору доступны разные действия.',65,750,480,84,26,C.purple);
 await screen(s,'admin-desktop.png');
}
{
 const s=base(7,'Администратору: членские взносы','Понятно, кто оплатил участие и кому скоро нужно продление');
 detail(s,'Поиск и учёт оплат','Найти участника по имени, записать взнос и посмотреть, до какой даты оплачено членство.',290);
 detail(s,'Важные сроки сверху','Просрочки и взносы, которые заканчиваются в ближайшие 14 дней, поднимаются вверх и выделяются красным.',505);
 text(s,'Проще составить список тех, кому нужно напомнить о продлении.',65,734,480,94,26,C.purple);
 await screen(s,'payments-large.png');
}
{
 const s=base(8,'Администратору: замечания и штрафы','История нарушений по каждому участнику');
 detail(s,'Поиск и новые записи','Найти человека по имени и добавить замечание или штраф. Историю можно посмотреть в одном разделе.',290);
 detail(s,'Уведомление после трёх','Когда набирается три записи, система показывает, что участника пора удалить из группы.',505);
 text(s,'Удаление из WhatsApp пока выполняет администратор вручную.',65,737,480,85,25,C.muted);
 await screen(s,'notices-large.png');
}
{
 const s=base(9,'Администратору: содержание клуба','Информацию можно обновлять самостоятельно');
 detail(s,'Главная плашка','Менять заголовок и текст анонса, дату и место встречи. Добавлять кнопку со ссылкой на подробности.',280);
 detail(s,'Правила и библиотека','Добавлять, редактировать и удалять правила. Пополнять библиотеку книгами, видео и полезными ссылками.',490);
 text(s,'Настройки',65,719,470,42,30,C.ink,true);text(s,'Данный раздел ещё в разработке.',65,770,480,68,26,C.muted);
 await screen(s,'rules-large.png');
}
{
 const s=base(10,'Светлая и тёмная темы','Один и тот же сервис в двух вариантах оформления');
 text(s,'Светлая',65,257,690,48,32,C.purple,true);text(s,'Тёмная',835,257,690,48,32,C.purple,true);
 await img(s,'theme-light.png',65,319,700,486,{geometry:'roundRect',borderRadius:12});
 await img(s,'theme-dark.png',835,319,700,486,{geometry:'roundRect',borderRadius:12});
 text(s,'Тема меняется переключателем. Выбор сохраняется в браузере.',65,813,1470,35,25,C.ink);
}
{
 const s=base(11,'Возможности подключения WhatsApp','Пример будущего блока с перепиской и автоматическими напоминаниями');
 detail(s,'Сообщения в одном месте','Переписка с участниками и быстрые ответы на вопросы о клубе, взносах и встречах.',290);
 detail(s,'Напоминания об оплате','Сообщение о продлении может уходить автоматически. Участник получает понятную инструкцию и ссылку.',500);
 text(s,'Работу с существующим групповым чатом уточним при подключении.',65,740,480,95,25,C.muted);
 await img(s,'whatsapp-concept.png',625,265,910,607);
 s.shapes.add({geometry:'rect',position:{left:1216,top:265,width:319,height:59},fill:'#FFFFFF',line:{fill:'none',width:0}});
 await img(s,'logo-final.png',1230,271,44,44,{geometry:'ellipse'});text(s,'MARKETING CLUB',1293,284,230,28,18,C.purple,true);
 s.speakerNotes.textFrame.setText('Концепция, интеграция пока не подключена. Иллюстрация возможного интерфейса. Источник возможностей WhatsApp Business: https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api . Возможности существующей группы требуют отдельной проверки.');
}
{
 const s=base(12,'Администратору: Instagram клуба','Возможный раздел внутри платформы Marketing Club');
 detail(s,'Публикации аккаунта','Посты и рилсы @marketing.dagestan.ru собраны в одной ленте. Можно открыть публикацию и перейти к её статистике.',290,430);
 detail(s,'Управление контентом','Из этого же раздела администратор создаёт новые публикации и переходит к плану на месяц.',520,430);
 await img(s,'club-instagram-admin.png',600,247,950,604);
 s.speakerNotes.textFrame.setText('Концепция будущего раздела для администратора. Подлинные обложки публикаций аккаунта https://www.instagram.com/marketing.dagestan.ru/ от 04.10, 03.10 и 02.10.2026, просмотр 05.10.2026. Количество подписчиков 5658 на момент просмотра. Интерфейс демонстрационный, интеграция пока не подключена.');
}
{
 const s=base(13,'Администратору: статистика публикаций','Понятные показатели по каждому посту и рилсу');
 detail(s,'Что можно увидеть','Просмотры и охват, лайки и комментарии. Сохранения и репосты помогают понять, какой контент интересен аудитории.',290,430);
 detail(s,'Данные своего аккаунта','Статистика появится после подключения Instagram клуба и предоставления доступа. На макете значения пока не заполнены.',540,430);
 await img(s,'club-instagram-stats.png',600,247,950,604);
 s.speakerNotes.textFrame.setText('Демонстрация структуры аналитики. Обложка реальной публикации https://www.instagram.com/marketing.dagestan.ru/ . Числовые показатели не выдуманы: отображены прочерки, поскольку приватная статистика аккаунта не предоставлена. Доступность показателей зависит от разрешений Instagram.');
}
{
 const s=base(14,'Контент на месяц вперёд','Возможный контент-план и автопостинг для администратора');
 detail(s,'Подготовить заранее','Загрузить фото, видео и тексты на месяц. Добавить подписи и обложки, назначить день и время каждой публикации.',290,430);
 detail(s,'Автопостинг','После подключения аккаунта система сможет выпускать материалы по расписанию. Администратор видит план и статус публикаций.',530,430);
 await img(s,'club-instagram-plan.png',600,247,950,604);
 s.speakerNotes.textFrame.setText('Планируемая функция, расписание и темы являются примерами. Нужны профессиональный аккаунт, разрешение на публикацию и серверный планировщик. Источник: https://www.postman.com/meta/instagram/folder/y6xustx/reels-publishing .');
}
{
 const s=pres.slides.add();s.background.fill=C.paper;
 text(s,'MARKETING CLUB',65,35,500,35,18,C.purple,true);
 text(s,'15',1460,35,65,35,18,C.muted);
 text(s,'Презентация подготовлена\nи система разработана',65,212,1410,146,52,C.ink);
 text(s,'xxvii',60,386,1370,212,170,C.purple,true);
 text(s,'Telegram',72,701,500,40,26,C.muted);
 text(s,'t.me/xxvii',68,753,1100,67,43,C.ink);
}
await fs.mkdir(path.join(build,'generated'),{recursive:true});
const candidate=path.join(build,'generated','candidate.pptx');
await(await PresentationFile.exportPptx(pres)).save(candidate);
execFileSync(python,[path.join(build,'metadata.py'),candidate]);
for(let i=0;i<15;i++){const p=await pres.export({slide:pres.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(build,'generated',`slide-${i+1}.png`),new Uint8Array(await p.arrayBuffer()));}
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(build,'generated','Marketing_Club.pptx'),pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:15,fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,materializeLiteralChartWorkbooks:true,receiptPath:path.join(build,'generated','validation.json')});
console.log('FINAL V2');
