const iconPaths = {
  overview:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  members:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  profile:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  library:'<path d="M12 6v15m0-15C9 3 5 3 2 4v15c3-1 7-1 10 2m0-15c3-3 7-3 10-2v15c-3-1-7-1-10 2"/>',
  rules:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8m-8 4h5"/>',
  admin:'<path d="M4 7h6m4 0h6M4 17h10m4 0h2"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  payments:'<rect x="2" y="5" width="20" height="15" rx="3"/><path d="M2 10h20M6 15h3"/>',
  notices:'<path d="M12 3 2 20h20L12 3zM12 9v5m0 3v.01"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon:'<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14z"/>',
  video:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m10 8 6 4-6 4z"/>',
  course:'<path d="m2 9 10-5 10 5-10 5-10-5zm4 2v6c4 3 8 3 12 0v-6m4-2v7"/>',
  service:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4M3 8h18"/>',
  template:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  up:'<path d="m5 12 7-7 7 7m-7-7v15"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>'
};
function icon(name) {return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.library}</svg>`}
const themeControl=document.querySelector('#theme-switch');
themeControl.innerHTML=['light','dark'].map(t=>`<button type="button" data-theme-choice="${t}" aria-label="${t==='light'?'Светлая':'Тёмная'} тема" title="${t==='light'?'Светлая':'Тёмная'} тема">${icon(t==='light'?'sun':'moon')}<span>${t==='light'?'Светлая':'Тёмная'}</span></button>`).join('');
function setTheme(theme,persist=false){
  document.documentElement.dataset.theme=theme;
  themeControl.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));
  if(persist)try{localStorage.setItem('marketing-club-theme',theme)}catch{}
}
setTheme(document.documentElement.dataset.theme||'dark');
themeControl.onclick=e=>{const b=e.target.closest('[data-theme-choice]');if(b)setTheme(b.dataset.themeChoice,true)};
document.querySelector('#close-dialog').innerHTML=icon('close');
const topButton=document.querySelector('#back-top');topButton.innerHTML=icon('up');
topButton.onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
let scrollScheduled=false;
function updateScrollUI(){
  const max=document.documentElement.scrollHeight-innerHeight;
  document.querySelector('#scroll-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;
  topButton.classList.toggle('visible',scrollY>350);topButton.tabIndex=scrollY>350?0:-1;
  document.querySelector('.topbar').classList.toggle('is-scrolled',scrollY>15);
  scrollScheduled=false;
}
window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateScrollUI)}},{passive:true});
window.addEventListener('resize',updateScrollUI);
window.addEventListener('hashchange',()=>requestAnimationFrame(updateScrollUI));
window.addEventListener('load',updateScrollUI);
document.addEventListener('click',e=>{
  const control=e.target.closest('button,.primary,.light-button');
  if(!control||control.disabled||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  control.animate([{filter:'brightness(1)'},{filter:'brightness(1.17)'},{filter:'brightness(1)'}],{duration:230});
});
