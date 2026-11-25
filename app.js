(()=>{'use strict';
/* ═══════════════ settings ═══════════════ */
const API_URL=String(window.AXJD_API||'').trim();   // set in config.js
const DEMO=!API_URL;
const SKINS=['void','aurora','kasavu'];
const SKIN_NAME={void:'Neon',aurora:'Aurora',kasavu:'Kasavu'};
const SKIN_NOTE={void:'Black sky, neon light, grid floor',aurora:'Drifting polar light, glass surfaces',kasavu:'Gold kasavu borders, lamp-green glow'};
const SKIN_BG={void:'#05060B',aurora:'#040B14',kasavu:'#080906'};
const HB_SDK='https://unpkg.com/@hyperbeam/web@latest/dist/index.js';

/* ═══════════════ helpers ═══════════════ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const mem={};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return mem[k]??null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}},del(k){try{localStorage.removeItem(k)}catch(e){delete mem[k]}}};
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstElementChild;};
const getC=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const parseHex=h=>{h=String(h).replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16)||0;return[(n>>16)&255,(n>>8)&255,n&255];};
function safeUrl(u){u=String(u||'').trim();if(!u||u==='#')return'#';if(/^https?:\/\//i.test(u))return u;if(/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(u))return'https://'+u;return'#';}
function domainOf(u){try{const s=safeUrl(u);return s==='#'?'':new URL(s).hostname.replace(/^www\./,'')}catch(e){return''}}
function toast(msg,kind){const t=el(`<div class="toast ${kind||''}" role="status">${esc(msg)}</div>`);$('#toasts').appendChild(t);requestAnimationFrame(()=>t.classList.add('on'));setTimeout(()=>{t.classList.remove('on');setTimeout(()=>t.remove(),450)},3000);}
async function copyText(t){try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(_){}a.remove();}}
const ico=(d,s=17)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={
  edit:ico('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  trash:ico('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  up:ico('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  down:ico('<path d="M12 5v14M5 12l7 7 7-7"/>'),
  copy:ico('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
  eye:ico('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  x:ico('<path d="M6 6l12 12M18 6 6 18"/>'),
  out:ico('<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>'),
  dice:ico('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/><circle cx="8.5" cy="15.5" r="1"/>'),
  shield:ico('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.500 7-10V6z"/><path d="m9 12 2 2 4-4"/>'),
  back:ico('<path d="M15 6l-6 6 6 6"/>'),
  fwd:ico('<path d="M9 6l6 6-6 6"/>'),
  reload:ico('<path d="M20 11a8 8 0 1 0-2.300 5.700M20 4v7h-7"/>'),
  min:ico('<path d="M5 18h14"/>'),
  max:ico('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  restore:ico('<rect x="5" y="5" width="14" height="14" rx="2"/>'),
  lock:ico('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  unlock:ico('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.500-2"/>'),
  ext:ico('<path d="M7 17 17 7M8 7h9v9"/>'),
  check:ico('<path d="m5 12 5 5 9-10"/>'),
  phone:ico('<rect x="7" y="3" width="10" height="18" rx="2.500"/><path d="M11 18h2"/>'),
  desk:ico('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  spark:ico('<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/>')
};

/* a small, safe Markdown renderer for chat and guides (escapes first) */
function md(src){
  const inline=s=>esc(s)
    .replace(/`([^`\n]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,'$1<em>$2</em>')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;!?])/g,'$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  const lines=String(src||'').replace(/\r/g,'').split('\n');
  let html='',list=null,para=[];
  const flushP=()=>{if(para.length){html+='<p>'+para.map(inline).join('<br>')+'</p>';para=[];}};
  const flushL=()=>{if(list){html+=`<${list.t}>`+list.i.map(x=>'<li>'+inline(x)+'</li>').join('')+`</${list.t}>`;list=null;}};
  for(let i=0;i<lines.length;i++){
    const ln=lines[i];let m;
    if(/^```/.test(ln)){flushP();flushL();const c=[];i++;while(i<lines.length&&!/^```/.test(lines[i])){c.push(lines[i]);i++;}html+='<pre><code>'+esc(c.join('\n'))+'</code></pre>';continue;}
    if(!ln.trim()){flushP();flushL();continue;}
    if((m=ln.match(/^\s*[-*•]\s+(.*)/))){flushP();if(!list||list.t!=='ul'){flushL();list={t:'ul',i:[]};}list.i.push(m[1]);continue;}
    if((m=ln.match(/^\s*\d+[.)]\s+(.*)/))){flushP();if(!list||list.t!=='ol'){flushL();list={t:'ol',i:[]};}list.i.push(m[1]);continue;}
    if((m=ln.match(/^#{1,4}\s+(.*)/))){flushP();flushL();html+='<h5>'+inline(m[1])+'</h5>';continue;}
    flushL();para.push(ln);
  }
  flushP();flushL();return html;
}
const plain=s=>String(s||'').replace(/```[\s\S]*?```/g,' ').replace(/[*_`#>]/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\s+/g,' ').trim();

/* ═══════════════ state ═══════════════ */
let S={profile:{},theme:{name:'void'},sites:[],locked:false,lockMsg:'',features:{ai:false,safe:false,scan:false,publish:false}};
let TOKEN='';
try{const t=JSON.parse(store.get('axjd_t')||'null');if(t&&t.exp>Date.now())TOKEN=t.v;else store.del('axjd_t');}catch(e){}
const COL={a1rgb:'25,227,255',a2rgb:'138,107,255'};
const ADM={dz:{brief:'',img:'',name:'',msg:'',cls:''},tab:'works',A:null,edit:null,theme:null,vq:'',vault:{key:null,items:[],show:{},timer:0,edit:null}};
function setToken(v){
  TOKEN=v||'';
  if(TOKEN)store.set('axjd_t',JSON.stringify({v:TOKEN,exp:Date.now()+5.5*3600*1000}));else store.del('axjd_t');
  document.body.classList.toggle('is-owner',!!TOKEN);
  if(typeof updateOwnerUI==='function')updateOwnerUI();
}

/* ═══════════════ talking to the server ═══════════════ */
async function api(action,body={}){
  if(DEMO)return demoApi(action,body);
  try{
    const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,token:TOKEN,...body})});
    const j=await r.json();
    if(j&&j.auth===false&&TOKEN){setToken('');ADM.A=null;}
    return j;
  }catch(e){return{error:'Could not reach the server. Check your connection and try again.'};}
}
async function loadPublic(){
  if(DEMO){demoLoad();return D.locked?{locked:true,message:D.lockMsg,theme:D.theme}:{locked:false,profile:D.profile,theme:D.theme,sites:sortSites(D.sites),features:D.features};}
  try{const r=await fetch(API_URL+'?t='+Date.now());return await r.json();}catch(e){return{error:'connect'};}
}

/* ═══════════════ reference pictures and custom look ═══════════════ */
function readImage(file){
  return new Promise((res,rej)=>{
    if(!file||!/^image\//.test(file.type)){rej(new Error('Please choose a picture file.'));return;}
    const fr=new FileReader();
    fr.onerror=()=>rej(new Error('Could not read that picture.'));
    fr.onload=()=>{
      const im=new Image();
      im.onerror=()=>rej(new Error('Could not open that picture.'));
      im.onload=()=>{
        const k=Math.min(1,1100/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*k)),h=Math.max(1,Math.round(im.height*k));
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);
        res(c.toDataURL('image/jpeg',.82));
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}
function cleanCssFront(c){
  c=String(c||'').slice(0,14000).replace(/<|>/g,' ');
  c=c.replace(/@import\s+url\(\s*['"]?(https:\/\/fonts\.googleapis\.com\/[^'")\s]+)['"]?\s*\)\s*;?/gi,'/*FONT:$1*/');
  c=c.replace(/@import[^;]*;?/gi,'').replace(/javascript:/gi,'');
  c=c.replace(/url\(\s*(['"]?)(?!data:image\/(?:svg\+xml|png|jpeg|webp)[;,])[^)]*\)/gi,'none');
  return c.replace(/\/\*FONT:([^*]+)\*\//g,'@import url("$1");').trim();
}
function applyCustomCss(css){
  let st=document.getElementById('customCss');
  css=cleanCssFront(css);
  if(!css){if(st)st.remove();return;}
  if(!st){st=document.createElement('style');st.id='customCss';document.head.appendChild(st);}
  st.textContent=css;
}

/* ═══════════════ preview data (only used while API_URL is empty) ═══════════════ */
const DKEY='axjd_demo_v5';
let D=null;
const SEED=()=>({
  profile:{
    fullName:'Asjad Farhan',role:'Creator & web builder',
    roles:'Web builder, Designer, Problem solver',
    tagline:'I build useful things for the web, and Pablo helps me do it.',
    bio:'This is my personal corner of the internet: the things I have built, who I am, and an assistant called Pablo who can chat, check suspicious links and even build websites.',
    orgs:'',location:'',phone:'+91 00000 00000',whatsapp:'910000000000',email:'hello@axjd.example',photo:'',extra:''
  },
  theme:{name:'void',accent:'',particles:true,grain:true,cursor:true},
  sites:[
    ['Salary System','salary'],['Assembly Attendance','attendance'],['Library','library'],['SADA','sada'],['Mehfil','mehfil'],['Photo Frame','frame'],['SANUSI AI','sanusi'],['Progress Report','report']
  ].map((n,i)=>({id:'s'+(i+1),name:n[0],logo:'',link:'https://'+n[1]+'.example.com',order:i+1})),
  locked:false,lockMsg:'',vault:[],builds:[],
  keys:{GEMINI_API_KEY:false,VT_API_KEY:false,URLSCAN_API_KEY:false,HYPERBEAM_API_KEY:false,GITHUB_TOKEN:false,GITHUB_REPO:'',GITHUB_BRANCH:'',GEMINI_CHAT_MODEL:'',GEMINI_BUILD_MODEL:'',HB_REGION:'AS',HB_MAX_MINUTES:'15'},
  features:{ai:true,safe:true,scan:true,publish:true}
});
function demoLoad(){try{D=JSON.parse(store.get(DKEY)||'null')}catch(e){D=null}if(!D)D=SEED();}
function demoSave(){store.set(DKEY,JSON.stringify(D));}
const sortSites=a=>a.slice().sort((x,y)=>Number(x.order)-Number(y.order));

function demoReply(t){
  const s=String(t).toLowerCase(),P=S.profile||{};
  if(/\b(hi|hello|hey|salam|namaste)\b/.test(s))return'Hi! I am Pablo. Ask me about the works here, paste a link and I will check it, or tell me about a website you want built.';
  if(/\bwho\b|\byour name\b/.test(s))return`${P.fullName||'The owner'}${P.role?` (${P.role})`:''} made this site. I am Pablo, the assistant who lives here. I do not drink tea, but questions are always welcome.`;
  if(/work|project|site|built|made/.test(s)){const n=S.sites.map(x=>x.name);return n.length?`There are ${n.length} works here: ${n.slice(0,6).join(', ')}${n.length>6?' and more':''}. Tap any card in the Works section to open it.`:'No works have been added yet.';}
  if(/contact|phone|email|reach|whatsapp/.test(s)){const a=[P.phone&&`phone ${P.phone}`,P.email&&`email ${P.email}`].filter(Boolean);return a.length?`You can reach ${P.fullName||'the owner'} by ${a.join(' or ')}. The Contact section has buttons for it too.`:'Contact details have not been added yet.';}
  if(/safe|link|scam|phish|virus/.test(s))return'Paste any suspicious link in this chat. I will check it without opening it on your device, then I can open it for you inside the Safe Window.';
  if(/thank/.test(s))return'Any time!';
  return'This is a preview, so my answers are limited. Once the site is live, my replies come from Google Gemini. Try pasting a link, or say: build me a website for a bakery.';
}
function demoCheck(url){
  const flags=localFlags(url),sc=flags.length;
  return{url,flags,hops:[],finalUrl:url,level:sc>=3?'danger':sc>=2?'suspicious':'looks-safe',demo:true,score:sc*2,summary:''};
}
function demoName(brief){
  const b=String(brief||'').trim();
  const m=b.match(/\b(?:for|called|named|about)\s+(?:my\s+|a\s+|an\s+|the\s+)?([A-Za-z0-9&' -]{3,38}?)(?=[,.;:!?]|\s+(?:with|that|in|where|using|and|which|featuring)\b|$)/i);
  let name=m?m[1].replace(/\b(website|site|page)\b/ig,'').trim():'';
  if(!name)name=(b.split(/[.,;:!?\n]/)[0]||'Your project').replace(/\b(build|make|create|design|me|a|an|the|website|site|for)\b/ig,' ').replace(/\s+/g,' ').trim().slice(0,34)||'Your project';
  return name.charAt(0).toUpperCase()+name.slice(1);
}
function demoSite(brief,style){
  const b=String(brief||'').trim();
  const name=demoName(b);
  const k=(style+' '+b).toLowerCase();
  const p=/kasavu|gold|luxur|royal/.test(k)?{bg:'#0B0A07',fg:'#F3EBD3',mu:'#A39C80',a:'#E8BE5C',b:'#1DB88C',card:'#16130B'}
    :/light|minimal|clean|white|pastel/.test(k)?{bg:'#F6F4EF',fg:'#1A1A1A',mu:'#6A675F',a:'#E4572E',b:'#2E6F73',card:'#FFFFFF'}
    :/colou?rful|playful|fun|kid|bakery|cake/.test(k)?{bg:'#FFF6E5',fg:'#2B1B17',mu:'#7A5F55',a:'#E4572E',b:'#F2A93B',card:'#FFFFFF'}
    :{bg:'#06070D',fg:'#E6EBFF',mu:'#8890B5',a:'#19E3FF',b:'#8A6BFF',card:'#0E1120'};
  const hero=b.length>140?b.slice(0,137)+'…':b;
  return`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)}</title><meta name="description" content="${esc(hero)}"><meta name="theme-color" content="${p.bg}">
<style>:root{--bg:${p.bg};--fg:${p.fg};--mu:${p.mu};--a:${p.a};--b:${p.b};--card:${p.card}}*{box-sizing:border-box;margin:0}body{background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,sans-serif}
header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 18px;padding:18px clamp(18px,5vw,56px)}header b{font-size:20px;letter-spacing:.02em}nav{display:flex;gap:18px;color:var(--mu);font-size:15px}
.hero{padding:clamp(48px,10vw,120px) clamp(18px,5vw,56px);max-width:980px}.hero h1{font-size:clamp(40px,8vw,88px);line-height:1;letter-spacing:-.03em;background:linear-gradient(100deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent;animation:in .9s both}
.hero p{max-width:52ch;color:var(--mu);margin:18px 0 28px;animation:in .9s .15s both}.btn{display:inline-block;padding:13px 26px;border-radius:99px;background:var(--a);color:var(--bg);font-weight:700;text-decoration:none;animation:in .9s .3s both}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:0 clamp(18px,5vw,56px) 56px}.c{background:var(--card);border:1px solid color-mix(in srgb,var(--fg) 14%,transparent);border-radius:18px;padding:24px}.c h3{margin-bottom:6px;color:var(--a)}.c p{color:var(--mu);font-size:15px}
footer{padding:26px clamp(18px,5vw,56px);color:var(--mu);border-top:1px solid color-mix(in srgb,var(--fg) 12%,transparent);font-size:14px}@keyframes in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style></head>
<body><header><b>${esc(name)}</b><nav><span>About</span><span>Services</span><span>Contact</span></nav></header>
<section class="hero"><h1>${esc(name)}</h1><p>${esc(hero)}</p><a class="btn" href="#contact">Get in touch</a></section>
<section class="grid"><div class="c"><h3>What we do</h3><p>A short, honest description of the main thing you offer goes here.</p></div><div class="c"><h3>Why people like it</h3><p>Three reasons, in plain words, that make you different.</p></div><div class="c"><h3>How to start</h3><p>Tell people the one simple step to take next.</p></div></section>
<footer id="contact">© ${new Date().getFullYear()} ${esc(name)} · Draft made by Pablo</footer></body></html>`;
}
function demoGuide(brief){
  const n=demoName(brief),b=esc(n.charAt(0).toLowerCase()+n.slice(1));
  return`**What we are building**
A simple, good-looking website for: ${b}.

**Plan**
- Pages: one scrolling page is enough to start (Home, About, What you offer, Contact).
- Collect: a short description, 3 to 5 photos or logos, your phone or WhatsApp number, and 3 sentences about you.

**Look and feel**
- Palette: deep blue #0B1020, cream #F6F1E7, one bright accent such as #19E3FF.
- Fonts: one bold display font and one calm reading font.
- Layout ideas: big headline with one photo; or cards for each offer.

**Build it (pick one path)**
Path A. With Pablo: say "Build me a website for ${b.slice(0,60)}" and Pablo builds it and gives you the link.
Path B. Google Sites (no code):
1. Open sites.google.com and sign in.
2. Tap the plus under "Start a new site".
3. Click "Untitled site" and type your site name.
4. Use the right-hand "Insert" tab to add text, images and buttons.
5. Press "Publish" at the top, choose a web address, then "Publish" again.
Path C. GitHub Pages:
1. Open github.com and tap "New" to create a repository named my-site (Public).
2. Tap "Add file", then "Create new file", name it index.html and paste the page Pablo built.
3. Tap "Commit changes".
4. Open Settings, then Pages, choose "Deploy from a branch", pick main and Save.

**Publish and share**
- Open the link on your phone and on a computer.
- Check every button and your phone number.
- Share the link on WhatsApp.

**Ready-to-paste prompt**
Build me a website for ${b}. Use a clean modern look, a short About section, a list of what I offer, and a contact button.`;
}
async function demoApi(a,b){
  await wait(a==='check'?2800:a==='chat'?900:a==='build'?3600:a==='guide'?1900:a==='refine'?2200:a==='publish'?1300:a==='safeOpen'?900:220);
  const strip=x=>{const{html,...r}=x;return r;};
  switch(a){
    case'login':return b.password==='demo'?{ok:true,token:'demo',usingStarterPassword:false}:{error:'Wrong password'};
    case'adminAll':return{sites:sortSites(D.sites),profile:D.profile,theme:D.theme,locked:D.locked,lockMsg:D.lockMsg,vault:D.vault,builds:D.builds.map(strip).reverse(),keys:D.keys,features:D.features,usingStarterPassword:false};
    case'saveSite':{const s=b.site;if(!s.id)s.id='s'+Date.now().toString(36);const i=D.sites.findIndex(x=>x.id===s.id);if(i<0)D.sites.push(s);else D.sites[i]=s;demoSave();return{ok:true};}
    case'deleteSite':D.sites=D.sites.filter(x=>x.id!==b.id);demoSave();return{ok:true};
    case'saveProfile':D.profile=b.profile;demoSave();return{ok:true};
    case'designSite':{
      if(String(b.brief||'').trim().length<4&&!b.image)return{error:'Describe the look you want, or add a picture.'};
      return{ok:true,css:'html[data-skin]{color-scheme:light;--bg:#F6F1E7;--ink:#1F2A22;--mute:#5E6B60;--a1:#1F7A4D;--a1-rgb:31,122,77;--a2:#C9822B;--a3:#E4572E;--line:rgba(31,42,34,.18);--line-hi:rgba(31,122,77,.7);--card:rgba(255,255,255,.75);--card-hi:#fff;--on-a:#fff;--r:20px;--r-btn:999px;--cut:0px;--blur:0px;--clip:none}html[data-skin] .bg{display:none}html[data-skin] body{background:var(--bg)}html[data-skin] .h-name{-webkit-text-fill-color:currentColor;background:none;color:var(--a1)}'};
    }
    case'saveTheme':D.theme=b.theme;demoSave();return{ok:true};
    case'setLock':D.locked=!!b.locked;D.lockMsg=b.message||'';demoSave();return{ok:true};
    case'vaultSave':{const it=b.item;if(!it.id)it.id='v'+Date.now().toString(36);const i=D.vault.findIndex(x=>x.id===it.id);if(i<0)D.vault.push(it);else D.vault[i]=it;demoSave();return{ok:true};}
    case'vaultDelete':D.vault=D.vault.filter(x=>x.id!==b.id);demoSave();return{ok:true};
    case'changePassword':return{ok:true};
    case'saveKeys':{(b.clear||[]).forEach(k=>{delete D.keys[k];});Object.entries(b.keys||{}).forEach(([k,v])=>{if(!String(v).trim())return;D.keys[k]=['GITHUB_REPO','GITHUB_BRANCH','GEMINI_CHAT_MODEL','GEMINI_BUILD_MODEL','HB_REGION','HB_MAX_MINUTES'].includes(k)?String(v):true;});demoSave();return{ok:true,keys:D.keys,features:D.features};}
    case'testKey':return{ok:true,note:'Preview only: nothing is really connected here.'};
    case'chat':{const m=(b.messages||[]).filter(x=>x.role==='user').pop();return{reply:demoReply(m?m.text:'')};}
    case'check':return demoCheck(b.url);
    case'scanResult':return{done:true,malicious:false};
    case'safeOpen':return{ok:true,demo:true,minutes:15,expiresAt:Date.now()+15*60000,w:b.w,h:b.h};
    case'safeClose':return{ok:true};
    case'build':{
      if(String(b.brief||'').trim().length<8)return{error:'Tell me a little more about the website.'};
      const html=demoSite(b.brief,b.style||'');const t=(html.match(/<title>(.*?)<\/title>/)||[])[1]||'My website';
      const r={id:'b'+Date.now().toString(36),title:t,brief:b.brief,html,url:'',status:'draft',created:new Date().toISOString(),updated:new Date().toISOString()};
      D.builds.push(r);demoSave();return{ok:true,id:r.id,title:r.title,html};
    }
    case'refine':{
      const r=D.builds.find(x=>x.id===b.id);if(!r)return{error:'That build was not found.'};
      const map={blue:'#3B82F6',red:'#EF4444',green:'#22C55E',purple:'#A855F7',pink:'#EC4899',orange:'#F97316',gold:'#E8BE5C',teal:'#14B8A6',yellow:'#FACC15'};
      const c=Object.keys(map).find(k=>new RegExp('\\b'+k+'\\b','i').test(b.instruction||''));
      let h=r.html;if(c)h=h.replace(/--a:#[0-9a-fA-F]{3,6}/,'--a:'+map[c]);
      h=h.replace('</footer>',' · Updated: '+esc(String(b.instruction||'').slice(0,60))+'</footer>');
      r.html=h;r.updated=new Date().toISOString();demoSave();return{ok:true,id:r.id,title:r.title,html:h,url:r.url};
    }
    case'publish':{
      const r=D.builds.find(x=>x.id===b.id);if(!r)return{error:'That build was not found.'};
      const slug=(r.url.match(/\/sites\/([^/]+)\//)||[])[1]||(String(r.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,28)+'-'+Math.random().toString(36).slice(2,6));
      r.url='https://asjadfarhan996-svg.github.io/axjd/sites/'+slug+'/';r.status='published';demoSave();return{ok:true,url:r.url,demo:true};
    }
    case'guide':return{ok:true,guide:demoGuide(b.brief)};
    case'getBuild':{const r=D.builds.find(x=>x.id===b.id);return r?{ok:true,...r}:{error:'That build was not found.'};}
    case'deleteBuild':D.builds=D.builds.filter(x=>x.id!==b.id);demoSave();return{ok:true};
  }
  return{error:'Unknown action'};
}

/* ═══════════════ Pablo's letter sphere ═══════════════ */
const GLYPHS=Array.from('ASJDFRHNPBLOX01{}<>/*+#=');
const AT={G:96,cols:8,rows:Math.ceil(GLYPHS.length/8),steps:[],hot:null};
function buildAtlas(){
  const c1=parseHex(getC('--a1')||'#19E3FF'),c2=parseHex(getC('--a2')||'#8A6BFF'),c3=parseHex(getC('--a3')||'#FF3D8B');
  const mk=rgb=>{
    const c=document.createElement('canvas');c.width=AT.cols*AT.G;c.height=AT.rows*AT.G;
    const x=c.getContext('2d');
    x.font='700 58px "Oxanium","Share Tech Mono",ui-monospace,monospace';
    x.textAlign='center';x.textBaseline='middle';x.fillStyle=`rgb(${rgb.join(',')})`;
    GLYPHS.forEach((ch,i)=>x.fillText(ch,(i%AT.cols)*AT.G+AT.G/2,((i/AT.cols)|0)*AT.G+AT.G/2));
    return c;
  };
  AT.steps=[];
  for(let d=0;d<5;d++){const t=d/4;AT.steps.push(mk(c2.map((v,k)=>Math.round(lerp(v,c1[k],t)))));}
  AT.hot=mk(c3);
}
function refreshColors(){
  COL.a1rgb=getC('--a1-rgb')||'25,227,255';
  COL.a2rgb=parseHex(getC('--a2')||'#8A6BFF').join(',');
  buildAtlas();
}

class LetterOrb{
  constructor(cv,{n=340,interactive=false}={}){
    this.cv=cv;this.cx=cv.getContext('2d');this.n=n;this.P=[];
    const ga=Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<n;i++){
      const y=1-(i+.5)/n*2,r=Math.sqrt(1-y*y),a=ga*i;
      this.P.push({x:Math.cos(a)*r,y,z:Math.sin(a)*r,g:(Math.random()*GLYPHS.length)|0,ph:Math.random()*6.283,
        sx:(Math.random()-.5)*6,sy:(Math.random()-.5)*6,sz:(Math.random()-.5)*6,dl:Math.random()*.7});
    }
    this.state='idle';this.e=0;this.eT=0;this.kickV=0;this.spin=Math.random()*6;this.t=0;
    this.born=REDUCE?9:0;this.mx=0;this.my=0;this.px=-999;this.py=-999;this.vis=true;
    this.cur={spin:.2,k:1,noise:.03};this.W=0;this.H=0;this.d=1;
    new ResizeObserver(()=>this.resize()).observe(cv);
    new IntersectionObserver(en=>{this.vis=en[en.length-1].isIntersecting;},{rootMargin:'240px 0px'}).observe(cv);
    if(interactive){
      cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();this.px=e.clientX-r.left;this.py=e.clientY-r.top;this.mx=(this.px/r.width-.5)*2;this.my=(this.py/r.height-.5)*2;});
      cv.addEventListener('pointerleave',()=>{this.px=this.py=-999;this.mx=this.my=0;});
    }
    this.resize();
  }
  resize(){const r=this.cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.W=r.width;this.H=r.height;this.d=d;this.cv.width=Math.max(1,Math.round(r.width*d));this.cv.height=Math.max(1,Math.round(r.height*d));}
  set(s){this.state=s;}
  kick(v=.6){this.kickV=Math.max(this.kickV,v);}
  frame(dt){
    const{cx,W,H,d}=this;if(!W||!H)return;
    this.t+=dt;this.born+=dt;
    const TG={idle:{spin:.2,k:1,noise:.03},listening:{spin:.12,k:1.03,noise:.05},thinking:{spin:1.9,k:.9,noise:.09},speaking:{spin:.34,k:1.02,noise:.05}}[this.state]||{spin:.2,k:1,noise:.03};
    for(const k in TG)this.cur[k]=lerp(this.cur[k],TG[k],Math.min(1,dt*3));
    this.kickV=Math.max(0,this.kickV-dt*1.6);
    if(this.state==='speaking')this.eT=.3+.45*Math.abs(Math.sin(this.t*5.3)*Math.sin(this.t*2.1+1))+this.kickV*.3;
    else if(this.state==='listening')this.eT=.12+.08*Math.sin(this.t*3)+this.kickV;
    else if(this.state==='thinking')this.eT=.18;
    else this.eT=0;
    this.e=lerp(this.e,this.eT,Math.min(1,dt*9));
    this.spin+=dt*this.cur.spin*(REDUCE?.25:1);
    if(this.state==='thinking'&&Math.random()<.5){for(let i=0;i<10;i++)this.P[(Math.random()*this.n)|0].g=(Math.random()*GLYPHS.length)|0;}
    cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);
    const R=Math.min(W,H)*.365*this.cur.k*(1+Math.sin(this.t*1.5)*.012+this.e*.06),mx0=W/2,my0=H/2;
    const g=cx.createRadialGradient(mx0,my0,R*.05,mx0,my0,R*1.55);
    g.addColorStop(0,`rgba(${COL.a1rgb},${.17+this.e*.22})`);g.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=g;cx.fillRect(0,0,W,H);
    const ry=this.spin+this.mx*.55,rx=-.38+this.my*.3,cy=Math.cos(ry),sy=Math.sin(ry),cxr=Math.cos(rx),sxr=Math.sin(rx);
    const out=[];
    for(let i=0;i<this.n;i++){
      const p=this.P[i];
      let k=clamp((this.born-p.dl)/1.5,0,1);k=1-Math.pow(1-k,3);
      const rad=1+this.cur.noise*Math.sin(this.t*2.4+p.ph*3)+this.e*.17*Math.sin(p.y*7-this.t*7);
      const x=lerp(p.sx,p.x*rad,k),y=lerp(p.sy,p.y*rad,k),z=lerp(p.sz,p.z*rad,k);
      const x1=x*cy+z*sy,z1=-x*sy+z*cy,y1=y*cxr-z1*sxr,z2=y*sxr+z1*cxr;
      const f=1/(1-z2*.22);
      let X=mx0+x1*R*f,Y=my0+y1*R*f;
      if(this.px>-900){const dx=X-this.px,dy=Y-this.py,dd=Math.hypot(dx,dy)||1;if(dd<86){const q=Math.pow(1-dd/86,2)*26;X+=dx/dd*q;Y+=dy/dd*q;}}
      out.push({x:X,y:Y,z:z2,g:p.g,ph:p.ph,k});
    }
    out.sort((a,b)=>a.z-b.z);
    const base=R*.17;
    for(const o of out){
      const dep=clamp((o.z+1)/2,0,1),s=base*(.55+.85*dep);
      const hot=this.e>.14&&(((o.ph*997+this.t*5)|0)%9===0);
      const at=hot?AT.hot:AT.steps[Math.min(AT.steps.length-1,(dep*AT.steps.length)|0)];
      if(!at)continue;
      cx.globalAlpha=(.2+.8*dep)*o.k;
      cx.drawImage(at,(o.g%AT.cols)*AT.G,((o.g/AT.cols)|0)*AT.G,AT.G,AT.G,o.x-s/2,o.y-s/2,s,s);
    }
    cx.globalAlpha=1;
  }
}
const ORBS=[];let orbH=null,orbV=null;

/* ═══════════════ background particles ═══════════════ */
const fx={cv:null,x:null,P:[],w:0,h:0,d:1,skin:'void',
  init(){this.cv=$('#fx');this.x=this.cv.getContext('2d');this.resize();addEventListener('resize',()=>this.resize());},
  resize(){const d=Math.min(devicePixelRatio||1,1.5);this.d=d;this.w=innerWidth;this.h=innerHeight;this.cv.width=Math.round(this.w*d);this.cv.height=Math.round(this.h*d);const n=Math.round(clamp(this.w*this.h/20000,26,78));this.P=Array.from({length:n},()=>this.mk(true));},
  mk(rand){return{x:Math.random()*this.w,y:rand?Math.random()*this.h:this.h+8,r:Math.random()*1.5+.5,v:Math.random()*.22+.05,ph:Math.random()*6.3,dx:(Math.random()-.5)*.1,c:Math.random()};},
  frame(dt,t){
    const x=this.x,{w,h,d}=this,sk=this.skin;
    x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
    const a1=COL.a1rgb,a2=COL.a2rgb,pace=REDUCE?.2:1;
    for(const p of this.P){
      p.y-=p.v*dt*60*pace*(sk==='aurora'?.35:1);p.x+=p.dx*dt*60*pace;
      if(p.y<-8)Object.assign(p,this.mk(false));
      if(p.x<-8)p.x=w+8;if(p.x>w+8)p.x=-8;
      const tw=.5+.5*Math.sin(t*(sk==='aurora'?1.5:2.2)+p.ph);
      if(sk==='void'){x.fillStyle=`rgba(${p.c>.5?a1:a2},${.15+.45*tw})`;x.fillRect(p.x,p.y,p.r*1.6,p.r*1.6);}
      else if(sk==='aurora'){x.fillStyle=`rgba(233,245,242,${.1+.5*tw*tw})`;x.beginPath();x.arc(p.x,p.y,p.r*.8,0,6.283);x.fill();}
      else{x.fillStyle=`rgba(${a1},${.15+.55*tw})`;x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fill();}
    }
    if(sk==='kasavu'){
      x.lineWidth=.6;
      const P=this.P;
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
        const a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,dd=dx*dx+dy*dy;
        if(dd<9000){x.strokeStyle=`rgba(${a1},${(1-dd/9000)*.22})`;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}
      }
    }
  }
};

/* ═══════════════ main loop + cursor ═══════════════ */
const cursor={on:false,tx:0,ty:0,gx:0,gy:0,rx:0,ry:0};
let lastT=performance.now(),glowEl=null,ringEl=null;
function loop(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  if(!document.hidden){
    if(!document.body.classList.contains('no-fx'))fx.frame(dt,now/1000);
    for(const o of ORBS)if(o.vis)o.frame(dt);
    if(cursor.on&&FINE){
      cursor.gx=lerp(cursor.gx,cursor.tx,.08);cursor.gy=lerp(cursor.gy,cursor.ty,.08);
      cursor.rx=lerp(cursor.rx,cursor.tx,.26);cursor.ry=lerp(cursor.ry,cursor.ty,.26);
      glowEl.style.transform=`translate(${cursor.gx}px,${cursor.gy}px)`;
      ringEl.style.transform=`translate(${cursor.rx}px,${cursor.ry}px)`;
    }
  }
  requestAnimationFrame(loop);
}

/* ═══════════════ applying a design ═══════════════ */
function applyTheme(t){
  t=t||{};const sk=SKINS.includes(t.name)?t.name:'void',root=document.documentElement;
  root.dataset.skin=sk;
  if(/^#[0-9a-f]{6}$/i.test(t.accent||'')){root.style.setProperty('--a1',t.accent);root.style.setProperty('--a1-rgb',parseHex(t.accent).join(','));}
  else{root.style.removeProperty('--a1');root.style.removeProperty('--a1-rgb');}
  document.body.classList.toggle('no-fx',t.particles===false);
  document.body.classList.toggle('no-grain',t.grain===false);
  document.body.classList.toggle('no-cursor',t.cursor===false);
  fx.skin=sk;applyCustomCss(t.css||'');
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=SKIN_BG[sk];
  refreshColors();
  $$('.demo [data-skin]').forEach(b=>b.classList.toggle('on',b.dataset.skin===sk));
  requestAnimationFrame(gradientLetters);
}
function buildName(){
  $('#hName').innerHTML=Array.from('Axjd').map((c,i)=>`<span class="ch" style="--i:${i}">${c}</span>`).join('');
  gradientLetters();
}
function gradientLetters(){
  const h=$('#hName');if(!h)return;
  const w=h.getBoundingClientRect().width||1;
  $$('.ch',h).forEach(s=>{s.style.backgroundSize=`${w}px 100%`;s.style.backgroundPosition=`${-s.offsetLeft}px 0`;});
}

/* ═══════════════ typed role line ═══════════════ */
const seg=window.Intl&&Intl.Segmenter?new Intl.Segmenter('en',{granularity:'grapheme'}):null;
const graphemes=s=>seg?Array.from(seg.segment(s),x=>x.segment):Array.from(s);
let typedT=0;
function startTyped(list){
  clearTimeout(typedT);const out=$('#role');if(!out)return;
  if(REDUCE||!list.length||!list[0]){out.textContent=list[0]||'';return;}
  let i=0,g=graphemes(list[0]),n=0,del=false;
  const tick=()=>{
    if(!del){n++;out.textContent=g.slice(0,n).join('');if(n>=g.length){del=true;typedT=setTimeout(tick,list.length>1?1900:999999);return;}typedT=setTimeout(tick,70);}
    else{n--;out.textContent=g.slice(0,n).join('');if(n<=0){del=false;i=(i+1)%list.length;g=graphemes(list[i]);typedT=setTimeout(tick,350);return;}typedT=setTimeout(tick,32);}
  };
  tick();
}

/* ═══════════════ drawing the page ═══════════════ */
function listOf(v,sep){return(Array.isArray(v)?v:String(v||'').split(sep)).map(s=>String(s).trim()).filter(Boolean);}
function renderHero(){
  const P=S.profile||{};
  $('#hFull').textContent=P.fullName||'';
  $('#hTag').textContent=P.tagline||'';
  startTyped(listOf(P.roles||P.role,/[,\n]/));
  const n=S.sites.length;
  $('#hudWorks').textContent=n+(n===1?' work':' works');
}
function logoHTML(s){
  const ini=esc(Array.from(s.name||'?')[0]);
  return`<span class="logo"><b>${ini}</b>${s.logo?`<img src="${esc(s.logo)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}</span>`;
}
function tileHTML(s,i){
  const href=safeUrl(s.link),dom=domainOf(s.link);
  const ghost=i===0?`<span class="ghost" aria-hidden="true">${esc(Array.from(s.name||'')[0]||'')}</span>`:'';
  return`<a class="tile card" style="--i:${i}" href="${esc(href)}"${href==='#'?'':' target="_blank" rel="noopener noreferrer"'}>
    <span class="spot"></span><span class="edge"></span>${ghost}
    <div class="t-top">${logoHTML(s)}<span class="t-go" aria-hidden="true">${ico('<path d="M7 17 17 7M8 7h9v9"/>',16)}</span></div>
    <div class="t-bot"><h3>${esc(s.name)}</h3><p>${esc(dom||'No link added')}</p></div></a>`;
}
function renderWorks(){
  const n=S.sites.length;
  $('#worksSub').textContent=n?`${n} site${n===1?'':'s'} built so far. Tap any card to open it.`:'Nothing here yet. Add your works in the Admin panel: a name, a logo link and a site link.';
  $('#bento').innerHTML=n?S.sites.map(tileHTML).join(''):'<div class="empty card">Your works will appear here.</div>';
}
function renderAbout(){
  const P=S.profile||{},initial=esc(Array.from(P.fullName||'A')[0]);
  const info=[];
  if(P.location)info.push(['Location',P.location]);
  if(P.phone)info.push(['Phone',P.phone]);
  if(P.whatsapp)info.push(['WhatsApp',P.whatsapp]);
  if(P.email)info.push(['Email',P.email]);
  String(P.extra||'').split('\n').forEach(l=>{const m=l.split(':');if(m.length>1&&m[0].trim())info.push([m[0].trim(),m.slice(1).join(':').trim()]);});
  const orgs=listOf(P.orgs,'\n');
  $('#aboutBox').innerHTML=`
    <div class="a-id card"><div class="avatar"><div class="face">${P.photo?`<img src="${esc(P.photo)}" alt="" referrerpolicy="no-referrer">`:initial}</div></div>
      <div><h3 class="a-name">${esc(P.fullName||'')}</h3><p class="a-role">${esc(P.role||'')}</p></div></div>
    <div class="a-bio card">${P.bio?`<p class="bio">${esc(P.bio)}</p>`:''}
      ${orgs.length?`<div class="orgs"><h4>Organisations</h4><ul>${orgs.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>`:''}
      ${info.length?`<dl class="info">${info.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:''}</div>`;
}
function renderContact(){
  const P=S.profile||{},out=[];
  const btn=(href,k,v)=>`<a class="c-btn card" href="${esc(href)}"><small>${esc(k)}</small><b>${esc(v)}</b></a>`;
  if(P.phone)out.push(btn('tel:'+String(P.phone).replace(/[^\d+]/g,''),'Call',P.phone));
  if(P.whatsapp)out.push(btn('https://wa.me/'+String(P.whatsapp).replace(/\D/g,''),'WhatsApp',P.whatsapp));
  if(P.email)out.push(btn('mailto:'+P.email,'Email',P.email));
  $('#contactBox').innerHTML=out.join('')||'<p class="muted">Contact details can be added in Admin, under Profile.</p>';
}
function renderMarquee(){
  const names=S.sites.map(s=>s.name),items=names.length?names:['Axjd','Pablo'];
  const grp=`<span>${items.map(n=>`<b>${esc(n)}</b><i></i>`).join('')}</span>`;
  const half=grp.repeat(items.length>=6?1:3);
  $('#track').innerHTML=half+half;
}
function renderAll(){renderHero();renderWorks();renderAbout();renderContact();renderMarquee();if(chat.suggDef||!chat.sugg.length)renderSuggDefault();}
function applyLock(){
  document.body.classList.toggle('is-locked',!!S.locked);
  $('#lock').hidden=!S.locked;
  $('#lockMsg').textContent=S.lockMsg||'The site is temporarily closed.';
}
function hydrate(d){
  if(!d||d.error){toast('Could not reach the server','bad');d={};}
  S.profile=d.profile||{};S.theme=d.theme||{};S.sites=d.sites||[];S.locked=!!d.locked;S.lockMsg=d.message||'';
  S.features=d.features||{ai:false,safe:false,scan:false,publish:false};
  applyTheme(S.theme);renderAll();applyLock();
}
async function refreshPublic(){hydrate(await loadPublic());}

/* what changes when the owner logs in or out */
function updateOwnerUI(){
  const o=!!TOKEN;
  document.body.classList.toggle('is-owner',o);
  const c=$('#ownChip');if(c)c.hidden=!o;
  if(!o&&swIsOpen())swClose();
  studioOwnerChanged();
  guardOwnerChanged();
}

/* ═══════════════ Pablo: chat, actions and voice ═══════════════ */
const chat={msgs:[],busy:false,working:false,lastUrl:'',tts:false,sugg:[]};
const VS={idle:'Tap the mic and start talking',listening:'Listening',thinking:'Thinking',speaking:'Speaking'};
const PS={idle:'Ready',listening:'Listening',thinking:'Thinking',speaking:'Speaking'};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const voice={on:false,rec:null,lang:'en-IN',state:'idle',final:'',err:'',noSpeech:0};
const pick=a=>a[(Math.random()*a.length)|0];

function fmt(t){return esc(t).replace(/(https?:\/\/[^\s<]+)/g,u=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);}
function logEl(){return $('#chatlog');}
function toBottom(){const l=logEl();l.scrollTop=l.scrollHeight;}
function userSay(text){
  logEl().appendChild(el(`<div class="msg user"><div class="bub">${fmt(text)}</div></div>`));
  chat.msgs.push({role:'user',text});toBottom();
}
async function botSay(text,opt={}){
  const d=el('<div class="msg bot"><div class="bub"></div></div>'),b=d.firstElementChild;
  logEl().appendChild(d);
  if(REDUCE||text.length>420||opt.instant){b.innerHTML=md(text);}
  else{
    b.classList.add('typing-now');
    const step=Math.max(1,Math.ceil(text.length/80));
    for(let i=0;i<text.length;i+=step){b.textContent=text.slice(0,i+step);toBottom();await wait(15);}
    b.classList.remove('typing-now');b.innerHTML=md(text);
  }
  toBottom();
  if(!opt.seed)chat.msgs.push({role:'bot',text});else chat.msgs.push({role:'bot',text,seed:true});
  return d;
}
function note(text){chat.msgs.push({role:'bot',text});}   // for the model only (not shown)
function addTyping(){const d=el('<div class="msg bot typing" aria-label="Pablo is typing"><div class="bub"><i></i><i></i><i></i></div></div>');logEl().appendChild(d);toBottom();return d;}

/* on small screens only one pane shows at a time: make sure the chat is the visible one when a card or typed reply arrives */
function ensureChatVisible(){
  try{if(window.matchMedia('(max-width:980px)').matches&&$('#pcard').dataset.mode==='voice')setMode('text');}catch(e){}
}
/* a visual "action card" inside the chat */
function addCard(kind,title,icon){
  ensureChatVisible();
  const d=el(`<div class="msg bot card-msg"><div class="acard" data-k="${kind}"><div class="ac-h"><span class="ac-ic">${icon||''}</span><b>${esc(title)}</b><span class="ac-s"></span></div><div class="ac-b"></div><div class="ac-f"></div></div></div>`);
  logEl().appendChild(d);toBottom();
  const c=d.firstElementChild;
  return{
    root:c,
    status(t,cls){const s=$('.ac-s',c);s.textContent=t;s.className='ac-s'+(cls?' '+cls:'');},
    body(h){$('.ac-b',c).innerHTML=h;toBottom();},
    foot(h){$('.ac-f',c).innerHTML=h;toBottom();},
    level(lv){c.classList.remove('lv-safe','lv-sus','lv-bad');if(lv&&LV[lv])c.classList.add(LV[lv].c);}
  };
}

/* quick-reply chips */
function setSugg(list,def){
  chat.sugg=list||[];chat.suggDef=!!def;
  $('#sugg').innerHTML=chat.sugg.map((s,i)=>`<button type="button" data-i="${i}">${esc(s.t)}</button>`).join('');
}
function renderSuggDefault(){
  const first=String((S.profile&&S.profile.fullName)||'').split(' ')[0]||'the owner';
  setSugg([
    {t:`Who is ${first}?`,send:`Who is ${first}?`},
    {t:'Show me the works',send:'What has been built here?'},
    {t:'Check a link',fill:'Is this link safe? '},
    {t:'Build a website',fill:'Build me a website for '},
    {t:'Website instructions',fill:'Give me step-by-step instructions to build a website for '}
  ],true);
}
function setPS(s){
  voice.state=s;
  if(orbV)orbV.set(s);if(orbH)orbH.set(s);
  $('#vStatus').textContent=VS[s];$('#pState').textContent=PS[s];
  $('#mic').classList.toggle('on',voice.on);
  $('#mic').setAttribute('aria-label',voice.on?'Stop listening':'Start talking');
  $('#pcard').dataset.state=s;
}
function findUrl(t){
  const m=String(t).match(/https?:\/\/[^\s]+|\bwww\.[^\s]+|\b(?:[a-z0-9-]+\.)+(?:com|in|net|org|io|co|app|me|xyz|top|link|info|site|online|ly|gl|to|cc|ru|cn|tk|ml|ga|cf|gq|click|live|shop|store|icu|buzz|club|vip|work|zip|bit|page|dev)\b(?:\/[^\s]*)?/i);
  return m?m[0]:'';
}

/* ─── intent router: obvious requests are handled without waiting for the AI ─── */
const R_SITE=/\b(web ?sites?|web ?pages?|landing ?pages?|home ?pages?|portfolio|online (?:store|shop)|web ?app)\b|വെബ്\s?സൈറ്റ്/i;
const R_SITE_WEAK=/\bsite\b|സൈറ്റ്/i;
const R_GUIDE=/\b(instructions?|guide|steps?|tutorial|how (?:do|can|should|would|could) i|how to|teach me|walk me through|explain how)\b|ഇൻസ്ട്രക്ഷൻ|എങ്ങനെ/i;
const R_BUILD=/\b(build|make|create|design|generate|develop|code|set ?up)\b|ഉണ്ടാക്ക|നിർമ്മി|നിർമി/i;
const R_BUILD_STRONG=/\b(build|create|design|generate|develop)\b|make (?:me )?(?:a|an|my)\b|ഉണ്ടാക്ക/i;
const R_SAFETY=/\b(safe|secure|legit|scam|phish\w*|virus|malware|trust\w*|check|suspicious|fake|danger\w*|verify|real|genuine)\b/i;
const R_OPEN=/\b(open|use|visit|browse|launch|run|load|view|go to)\b|തുറക്ക/i;
const R_CHANGE=/^(?:please |pls |can you |could you |now )?(make|change|add|remove|replace|update|use|turn|move|swap|put|increase|decrease|rename|fix|shorten|lengthen|bigger|smaller|darker|lighter)\b/i;
function sniff(t){
  const s=String(t||'').trim(),u=findUrl(s);
  const siteWord=R_SITE.test(s);
  if(u&&R_SAFETY.test(s)&&!(siteWord&&R_BUILD_STRONG.test(s)))return{type:'check_link',url:u};
  if(siteWord&&R_GUIDE.test(s))return{type:'site_guide',brief:s};
  if((siteWord&&R_BUILD.test(s))||(R_SITE_WEAK.test(s)&&R_BUILD_STRONG.test(s)&&!u))return{type:'build_site',brief:s};
  if(studio.cur&&Date.now()-studio.at<20*60000&&R_CHANGE.test(s)&&!u)return{type:'refine_site',instruction:s};
  if(u)return R_OPEN.test(s)?{type:'open_safe',url:u}:{type:'check_link',url:u};
  if(chat.lastUrl&&/\b(open|use|visit|launch|browse|load)\b/i.test(s)&&/\b(it|that|this|the link|the site|the page)\b/i.test(s))return{type:'open_safe',url:chat.lastUrl};
  const g=s.match(/\b(?:show|take|go|scroll|jump)\b.*\b(works|about|contact|studio|link guard|guard)\b/i);
  if(g){const k=g[1].toLowerCase();return{type:'goto',section:k==='link guard'?'guard':k};}
  return null;
}
function leadIn(a){
  switch(a.type){
    case'check_link':return pick(['On it. I will check that link without opening it on your device.','Let me look at that link for you. Nothing gets opened on your device.']);
    case'open_safe':return'Checking it first, then I will open it in the Safe Window.';
    case'build_site':return pick(['Love it. Designing that now. It takes about half a minute.','Got it. I am designing and writing your site now.']);
    case'site_guide':return'Sure. Writing a step-by-step guide for that.';
    case'refine_site':return'Making that change now.';
    case'goto':return'Taking you there.';
  }
  return'On it.';
}

async function askPablo(text,viaVoice){
  text=String(text||'').trim();if(!text)return;
  if(chat.busy||chat.working){toast('One moment, I am still on your last request.');return;}
  chat.busy=true;setSugg([]);if(!viaVoice)ensureChatVisible();userSay(text);setPS('thinking');
  let reply='',act=null;
  try{
    act=sniff(text);
    if(act)reply=leadIn(act);
    else{
      const ty=addTyping();
      const r=await api('chat',{messages:chat.msgs.filter(m=>!m.seed).slice(-12).map(m=>({role:m.role,text:m.text}))});
      ty.remove();
      reply=r.reply||('Sorry, '+(r.error||'I could not answer that')+'.');
      act=r.action||null;
    }
  }catch(e){reply='Something went wrong on my side. Could you ask again?';act=null;}
  chat.busy=false;
  const talk=!!(viaVoice&&voice.on);
  let said=Promise.resolve();
  if(talk){setPS('speaking');said=speak(reply);}
  else if(chat.tts)said=speak(reply,true);
  await botSay(reply);
  $('#vText').textContent=plain(reply);
  let res=null;
  if(act){
    chat.working=true;if(!talk)setPS('thinking');
    try{res=await doAction(act);}catch(e){await botSay('That did not work: '+String((e&&e.message)||e)+'. Please try again.');}
    chat.working=false;
  }
  await said;
  if(talk&&voice.on){
    if(res&&res.say){setPS('speaking');$('#vText').textContent=res.say;await speak(res.say);}
    if(voice.on)listen();else setPS('idle');
  }else{
    if(res&&res.say&&chat.tts)speak(res.say,true);
    setPS('idle');
  }
  if(!chat.sugg.length)renderSuggDefault();
}

/* ─── actions ─── */
async function doAction(a){
  switch(a.type){
    case'goto':goTo(a.section);return null;
    case'check_link':return linkFlow(a.url,{open:null});
    case'open_safe':return linkFlow(a.url,{open:true});
    case'build_site':return buildFlow(a.brief);
    case'site_guide':return guideFlow(a.brief);
    case'refine_site':return refineFlow(a.instruction);
  }
  return null;
}
const firstSentence=s=>{const m=String(s||'').match(/^[^.!?]+[.!?]/);return m?m[0]:String(s||'').slice(0,140);};

async function linkFlow(url,{open}={}){
  const host=domainOf(url)||url;
  if(open===true&&!TOKEN){
    const ok=await ensureOwner('Opening a link in the Safe Window is an owner tool. Log in to continue, or close this and I will only check it.');
    if(!ok)open=null;
  }
  const c=addCard('check','Link check',IC.shield);
  c.status('Checking','busy');
  c.body(`<p class="ac-line"><i class="spin-s"></i>Checking <b>${esc(host)}</b>. It is not being opened on your device.</p>`);
  const r=await runCheck(url,{quiet:true});
  if(!r){
    c.status('Failed','bad');c.body('<p class="ac-line">I could not check that link. Make sure it is complete and try again.</p>');
    note('(The link check failed.)');setSugg([{t:'Try another link',fill:'Is this link safe? '}]);
    return{say:'I could not check that link.'};
  }
  chat.lastUrl=r.url;
  const{lv}=riskOf(r),L=LV[lv],sum=r.summary||localSummary(r);
  c.level(lv);c.status(L.t,lv);
  c.body(`<p class="ac-line"><b>${esc(host)}</b></p><p class="ac-line">${esc(sum)}</p>`);
  const auto=open===true||(open===null&&gAuto());
  let opened=false;
  if(TOKEN&&auto&&lv!=='danger'){
    opened=await SW.open(r.url,{verdict:lv});
  }
  const btnOpen=lv==='danger'
    ?`<button class="btn btn-ghost sm" data-ca="open-safe" data-url="${esc(r.url)}">Open anyway (isolated)</button>`
    :`<button class="btn btn-main sm" data-ca="open-safe" data-url="${esc(r.url)}">${TOKEN?'Open in Safe Window':'Open in Safe Window (owner)'}</button>`;
  c.foot(`<button class="btn btn-ghost sm" data-ca="report">Full report</button>${btnOpen}`);
  if(lv==='danger'&&TOKEN)c.body(`<p class="ac-line"><b>${esc(host)}</b></p><p class="ac-line">${esc(sum)}</p><p class="ac-line ac-warn">I will not open this one on my own. Even in the Safe Window, never type a password, OTP or any personal detail into it.</p>`);
  note(`(I checked ${r.url}: ${L.t}. ${sum}${opened?' It was opened in the Safe Window.':''})`);
  setSugg(opened||!TOKEN?[{t:'Check another link',fill:'Is this link safe? '},{t:'Build a website',fill:'Build me a website for '}]:[{t:'Open it in the Safe Window',send:'Open it in the Safe Window'},{t:'Check another link',fill:'Is this link safe? '}]);
  return{say:`${L.t}. ${firstSentence(sum)}${opened?' I opened it in the Safe Window.':''}`};
}

async function buildFlow(brief){
  const ok=await ensureOwner('Building and publishing websites is an owner tool. Log in to continue.');
  if(!ok){
    await botSay('Website building is for the owner. Log in with the lock icon at the bottom of the page, then ask me again.');
    return null;
  }
  const c=addCard('build','Website build',IC.spark);
  c.status('Working','busy');
  const res=await studioRun('build',brief,{auto:true,onStep:(list,i)=>c.body(stepsHTML(list,i))});
  if(!res.ok){
    c.status(res.refused?'Declined':'Failed','bad');
    c.body(`<p class="ac-line">${esc(res.error)}</p>`);
    note(`(The website build did not work: ${res.error})`);
    setSugg([{t:'Try a different idea',fill:'Build me a website for '}]);
    return{say:res.refused?'I cannot build that one.':'The build did not work. '+res.error};
  }
  renderBuildCard(c,res);
  note(`(I built the website "${res.cur.title}"${res.cur.url?' and published it at '+res.cur.url:' (not published yet)'}. I can change it if asked.)`);
  setSugg([{t:'Make the colours warmer',send:'Make the colours warmer'},{t:'Add a contact section',send:'Add a contact section'},{t:'Open in Studio',go:'studio'}]);
  return{say:res.cur.url?`Your website is ready and published. The link is in the chat.`:`Your website is ready. ${res.publishNote||''}`};
}
function renderBuildCard(c,res){
  const cur=res.cur;
  c.status(cur.url?'Published':'Ready','ok');
  let body=`<p class="ac-line"><b>${esc(cur.title)}</b></p>`;
  if(cur.url){
    body+=cur.demo
      ?`<p class="ac-link mono">${esc(cur.url)}</p><p class="ac-line ac-warn">Preview only: nothing was really published. On your live site this becomes a real, working link.</p>`
      :`<p class="ac-link mono"><a href="${esc(cur.url)}" target="_blank" rel="noopener noreferrer">${esc(cur.url)}</a></p><p class="ac-line muted" data-live>It can take a minute or two to go live.</p>`;
  }else{
    body+=`<p class="ac-line">${esc(res.publishNote||'Preview is ready in Studio.')}</p>`;
  }
  c.body(body);
  c.foot((cur.url&&!cur.demo?`<button class="btn btn-main sm" data-ca="copy" data-t="${esc(cur.url)}">Copy link</button><a class="btn btn-ghost sm" href="${esc(cur.url)}" target="_blank" rel="noopener noreferrer">Open site</a>`:'')
    +`<button class="btn btn-ghost sm" data-ca="goto" data-s="studio">Preview and edit</button>`);
  if(cur.url&&!cur.demo){
    waitLive(cur.url).then(st=>{
      const l=$('[data-live]',c.root);if(!l)return;
      l.textContent=st==='live'?'Live now.':'Still going live. Give it another minute, then refresh the link.';
      if(st==='live')l.classList.add('ok');
    });
  }
}

async function guideFlow(brief){
  const ok=await ensureOwner('Website instructions are an owner tool. Log in to continue.');
  if(!ok){await botSay('Website instructions are for the owner. Log in with the lock icon at the bottom of the page, then ask me again.');return null;}
  const c=addCard('guide','Website guide',IC.spark);
  c.status('Writing','busy');
  c.body('<p class="ac-line"><i class="spin-s"></i>Writing your step-by-step guide…</p>');
  const r=await api('guide',{brief});
  if(r.error||!r.guide){
    c.status('Failed','bad');c.body(`<p class="ac-line">${esc(r.error||'I could not write the guide.')}</p>`);
    note('(The guide could not be written.)');return{say:'I could not write the guide.'};
  }
  c.status('Ready','ok');
  c.body(`<div class="ac-md md">${md(r.guide)}</div>`);
  c.foot(`<button class="btn btn-main sm" data-ca="copy-guide">Copy guide</button><button class="btn btn-ghost sm" data-ca="build-it" data-brief="${esc(brief)}">Build it for me instead</button>`);
  chat.guide=r.guide;
  studioShowGuide(r.guide);
  note('(I wrote a step-by-step guide for the website.)');
  setSugg([{t:'Build it for me',send:'Build me that website'},{t:'Another idea',fill:'Give me step-by-step instructions to build a website for '}]);
  return{say:'The guide is ready in the chat. You can also build the site with me in one go.'};
}

async function refineFlow(ins){
  if(!studio.cur){await botSay('There is no website to change yet. Describe one and I will build it first.');return null;}
  const ok=await ensureOwner('Changing a website is an owner tool. Log in to continue.');
  if(!ok)return null;
  const c=addCard('build','Website update',IC.spark);
  c.status('Working','busy');
  const res=await studioRun('refine',ins,{id:studio.cur.id,auto:!!studio.cur.url,onStep:(list,i)=>c.body(stepsHTML(list,i))});
  if(!res.ok){c.status('Failed','bad');c.body(`<p class="ac-line">${esc(res.error)}</p>`);note('(The change did not work.)');return{say:'That change did not work.'};}
  renderBuildCard(c,res);
  note(`(I updated the website "${res.cur.title}" as asked.)`);
  setSugg([{t:'Another change',fill:'Make '},{t:'Open in Studio',go:'studio'}]);
  return{say:'Done. The page is updated.'};
}

/* clicks on buttons inside action cards */
async function onChatClick(e){
  const b=e.target.closest('[data-ca]');if(!b)return;
  const a=b.dataset.ca;
  if(a==='report'){goTo('guard');}
  else if(a==='open-safe'){await SW.open(b.dataset.url,{verdict:'manual'});}
  else if(a==='copy'){await copyText(b.dataset.t||'');toast('Copied');}
  else if(a==='copy-guide'){await copyText(chat.guide||'');toast('Guide copied');}
  else if(a==='goto'){goTo(b.dataset.s);}
  else if(a==='build-it'){askPablo('Build me a website for '+b.dataset.brief,false);}
}

/* ─── voice ─── */
function speak(text,force){
  return new Promise(res=>{
    if(!('speechSynthesis' in window))return res();
    const clean=String(text).replace(/https?:\/\/\S+/g,'link').replace(/[*_`#>]/g,' ').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}️]/gu,'').trim();
    if(!clean)return res();
    const parts=(clean.match(/[^.!?।\n]+[.!?।]?/g)||[clean]).map(s=>s.trim()).filter(Boolean);
    let vs=[];try{vs=speechSynthesis.getVoices();}catch(e){}
    const L=voice.lang.toLowerCase();
    const v=vs.find(x=>x.lang.replace('_','-').toLowerCase()===L)||vs.find(x=>x.lang.toLowerCase().startsWith(L.slice(0,2)));
    try{speechSynthesis.cancel();}catch(e){}
    let i=0;
    const next=()=>{
      if(i>=parts.length||(!voice.on&&!force)){res();return;}
      const u=new SpeechSynthesisUtterance(parts[i++]);
      if(v)u.voice=v;u.lang=voice.lang;u.onend=next;u.onerror=()=>res();u.onboundary=()=>{if(orbV)orbV.kick(.5);};
      try{speechSynthesis.speak(u);}catch(e){res();}
    };
    next();
    setTimeout(res,Math.min(90000,clean.length*90+5000));
  });
}
function demoVoice(msg){
  voice.on=true;setPS('listening');
  const q='Is this link safe?';let k=0;$('#vText').textContent='';
  const typeIt=setInterval(()=>{k++;$('#vText').textContent=q.slice(0,k);if(orbV)orbV.kick(.7);if(k>=q.length)clearInterval(typeIt);},90);
  setTimeout(()=>{setPS('thinking');},2000);
  setTimeout(()=>{
    $('#vText').textContent='Paste a suspicious link and I will check it without opening it on your device.';setPS('speaking');
  },3000);
  setTimeout(()=>{voice.on=false;setPS('idle');},7000);
  if(msg)toast(msg);
}
function listen(){
  if(!SR)return DEMO?demoVoice('This browser has no speech recognition. Chrome has it. What you see is a demonstration.'):(voice.on=false,setPS('idle'),toast('This browser cannot recognise speech. Try Chrome, or type instead.','bad'));
  let r;try{r=new SR();}catch(e){return DEMO?demoVoice('Speech recognition could not start. This is a demonstration.'):(voice.on=false,setPS('idle'),toast('Speech recognition could not start.','bad'));}
  voice.rec=r;voice.final='';voice.err='';
  r.lang=voice.lang;r.interimResults=true;r.continuous=false;
  r.onstart=()=>{setPS('listening');$('#vText').textContent='';};
  r.onresult=e=>{let t='',fin=false;for(let i=0;i<e.results.length;i++){t+=e.results[i][0].transcript;if(e.results[i].isFinal)fin=true;}$('#vText').textContent=t;if(orbV)orbV.kick();if(orbH)orbH.kick(.4);if(fin)voice.final=t;};
  r.onerror=e=>{voice.err=e.error;};
  r.onend=()=>{
    if(!voice.on)return;
    const t=voice.final.trim();
    if(t){voice.noSpeech=0;askPablo(t,true);return;}
    if(voice.err==='not-allowed'||voice.err==='service-not-allowed'||voice.err==='audio-capture'){
      voice.on=false;setPS('idle');
      if(DEMO)demoVoice('The microphone is not available on this preview page. On your own site it works. What you see is a demonstration.');
      else toast('The microphone is blocked. Allow it in your browser settings and try again.','bad');
      return;
    }
    if(voice.err==='network'){voiceStop();toast('Speech recognition needs an internet connection.','bad');return;}
    if(!voice.err||voice.err==='no-speech'){voice.noSpeech++;if(voice.noSpeech>=3){voiceStop();toast('I did not hear anything. Tap the mic to try again.');return;}listen();return;}
    voiceStop();toast('I could not make that out. Please try again.','bad');
  };
  try{r.start();}catch(e){voiceStop();}
}
function voiceStop(){
  voice.on=false;try{voice.rec&&voice.rec.abort();}catch(e){}
  try{speechSynthesis.cancel();}catch(e){}
  setPS('idle');
}
function micToggle(){if(voice.on){voiceStop();return;}voice.on=true;voice.noSpeech=0;setPS('listening');listen();}
function setMode(m){
  $('#pcard').dataset.mode=m;
  $$('.seg button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===m)));
}
function setTts(on){
  chat.tts=on;
  const b=$('#ttsBtn');b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));
  b.setAttribute('aria-label',on?'Read replies aloud: on':'Read replies aloud: off');
  if(!on){try{speechSynthesis.cancel();}catch(e){}}
}
function initChat(){
  renderSuggDefault();
  botSay('Hi, I am Pablo. Ask me about this site, paste a link and I will check it, or tell me about a website you want and I will build it.',{instant:true,seed:true});
  $('#sugg').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const s=chat.sugg[+b.dataset.i];if(!s)return;
    if(s.go){goTo(s.go);return;}
    if(s.fill){const c=$('#chatIn');c.value=s.fill;c.focus();return;}
    askPablo(s.send,false);
  });
  $('#composer').addEventListener('submit',e=>{e.preventDefault();const c=$('#chatIn'),v=c.value;c.value='';askPablo(v,false);});
  $('#chatlog').addEventListener('click',onChatClick);
  $('#mic').addEventListener('click',micToggle);
  $('#ttsBtn').addEventListener('click',()=>setTts(!chat.tts));
  $('#langBtn').addEventListener('click',()=>{voice.lang=voice.lang==='en-IN'?'ml-IN':'en-IN';$('#langBtn').textContent=voice.lang==='en-IN'?'English':'Malayalam';if(voice.on)voiceStop();toast('Voice language: '+(voice.lang==='en-IN'?'English':'Malayalam'));});
  $$('.seg button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
}

/* ═══════════════ owner login (small pop-up used by every owner tool) ═══════════════ */
let ownResolve=null;
function ensureOwner(msg){
  if(TOKEN)return Promise.resolve(true);
  return new Promise(res=>{
    if(ownResolve)ownResolve(false);
    ownResolve=res;
    $('#ownMsg').textContent=msg||'This is an owner tool. Log in to continue.';
    $('#ownDemo').hidden=!DEMO;
    $('#own').hidden=false;document.body.classList.add('own-open');
    const i=$('#ownPw');i.value=DEMO?'demo':'';setTimeout(()=>{i.focus();i.select();},60);
  });
}
function ownClose(ok){
  $('#own').hidden=true;document.body.classList.remove('own-open');
  const r=ownResolve;ownResolve=null;if(r)r(!!ok);
}
async function ownSubmit(e){
  e.preventDefault();const b=$('#ownGo');b.disabled=true;
  const r=await api('login',{password:$('#ownPw').value});
  b.disabled=false;
  if(!r||!r.token){toast((r&&r.error)||'Could not log in','bad');return;}
  setToken(r.token);
  if(r.usingStarterPassword)toast('You are still on the starter password. Change it in Admin, under Lock.','warn');
  ownClose(true);
}

/* ═══════════════ Link Guard ═══════════════ */
const PIPE=['Reading the link','Following redirects','Checking safety databases','Taking a snapshot of the page'];
let gTick=0,gTimer=0,gBusy=false,gLast=null;
const gAuto=()=>store.get('axjd_gauto')!=='0';
function normUrl(raw){
  let u=String(raw||'').trim().replace(/[)\].,;!?]+$/,'');if(!u)return'';
  if(!/^https?:\/\//i.test(u)){if(/\s/.test(u)||!/\./.test(u))return'';u='https://'+u;}
  try{const x=new URL(u);if(!x.hostname.includes('.'))return'';return x.href;}catch(e){return'';}
}
function localFlags(u){
  const f=[];let x;try{x=new URL(u);}catch(e){return['The link is not written correctly'];}
  const h=x.hostname.toLowerCase();
  if(x.username||x.password)f.push('Contains an @ sign, a trick used to hide the real site');
  if(/^\d+\.\d+\.\d+\.\d+$/.test(h))f.push('Uses a number (IP address) instead of a name');
  if(h.indexOf('xn--')>-1)f.push('Disguised letters in the site name (xn--)');
  if(h.split('.').length>4)f.push('Unusually many sub-names in the address');
  if(/\.(zip|xyz|top|click|work|gq|tk|ml|cf|ga|icu|cyou|rest|country)$/.test(h))f.push('Suspicious ending (.'+h.split('.').pop()+')');
  if(/^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|rb\.gy|shorturl\.at|wa\.link)$/.test(h))f.push('Shortened link: the real destination is hidden');
  if(/^http:\/\//i.test(u))f.push('Not encrypted (http, not https)');
  if(/(login|verify|update|secure|account|bank|otp|kyc|gift|prize|apk)/i.test(u))f.push('Words often used in scams appear in the link');
  return f;
}
const LV={
  'looks-safe':{c:'lv-safe',t:'Looks safe',a:'No big problems found. Still, never type a password or OTP on a page you did not expect.'},
  suspicious:{c:'lv-sus',t:'Suspicious',a:'Think twice before opening it. Do not enter personal details or money. Ask the sender to confirm.'},
  danger:{c:'lv-bad',t:'High risk',a:'Do not open it on your own device. Call the person who sent it to confirm.'}
};
function riskOf(r){
  const vt=r.vt&&!r.vt.error?r.vt:null;
  const raw=typeof r.score==='number'?r.score:((r.flags||[]).length*1.5+(vt?(vt.malicious||0)*3+(vt.suspicious||0):0));
  let s=raw<2?8+raw*14:raw<6?36+(raw-2)*9:72+Math.min(raw-6,6)*4;
  s=clamp(Math.round(s),4,98);
  const lv=r.level||(s>=72?'danger':s>=36?'suspicious':'looks-safe');
  if(lv==='danger')s=Math.max(s,72);else if(lv==='suspicious')s=clamp(s,36,68);else s=Math.min(s,30);
  return{s,lv};
}
function localNarrative(r){
  const f=r.flags||[];
  if(!f.length)return'Nothing about the link itself looks suspicious.';
  const shown=f.slice(0,2).map(x=>x.replace(/\s*\(.*\)\s*$/,'')).join('; ');
  return`I found ${f.length} warning sign${f.length===1?'':'s'}: ${shown}${f.length>2?' and more':''}.`;
}
function localSummary(r){const{lv}=riskOf(r),L=LV[lv]||LV.suspicious;return`${L.t}. ${localNarrative(r)} ${L.a}`;}
function gIdle(){
  $('#gStage').innerHTML=`<ol class="g-steps">
    <li><b>1</b><strong>Paste the link</strong><span>Copy the suspicious link from your message and paste it above.</span></li>
    <li><b>2</b><strong>Pablo checks it</strong><span>It is looked at on a safe server, never on your device, and compared with safety databases.</span></li>
    <li><b>3</b><strong>Read the report</strong><span>See the risk score and a snapshot of the page. The owner can then open it in the Safe Window.</span></li></ol>`;
}
function setPipe(n){$$('.pipe li').forEach((li,i)=>{li.classList.toggle('done',i<n);li.classList.toggle('act',i===n);});}
function gScan(url){
  $('#gStage').innerHTML=`<div class="scan"><div class="radar" aria-hidden="true"><i></i></div><div><p class="scan-url">${esc(url)}</p><ol class="pipe">${PIPE.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div></div>`;
  gTick=0;setPipe(0);clearInterval(gTimer);gTimer=setInterval(()=>setPipe(Math.min(3,++gTick)),DEMO?700:4500);
  $('#gGo').disabled=true;
}
function gEnd(){clearInterval(gTimer);$('#gGo').disabled=false;}
function gError(msg){gEnd();gLast=null;$('#gStage').innerHTML=`<p class="g-err">${esc(msg)}</p>`;}
const stClass=st=>{const n=parseInt(st,10);return n>=200&&n<300?'s2':n>=300&&n<400?'s3':n>=400?'s4':'';};
function gaugeSVG(score){
  const L=Math.PI*80;
  return`<svg class="gauge" viewBox="0 0 200 122" role="img" aria-label="Risk ${score} out of 100"><path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke="var(--line)" stroke-width="12" stroke-linecap="round"/><path class="g-fill" d="M20 100A80 80 0 0 1 180 100" fill="none" stroke="var(--lv)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${L.toFixed(1)}" style="--to:${(L*(1-score/100)).toFixed(1)}"/><text x="100" y="92" text-anchor="middle" class="g-num">${score}</text><text x="100" y="114" text-anchor="middle" class="g-lab">risk score (out of 100)</text></svg>`;
}
function vtBox(vt){
  if(!vt)return`<div class="rbox"><h4>Safety databases</h4><p class="muted">This check is switched off. The owner can add a VirusTotal key in Admin, under Connections.</p></div>`;
  if(vt.error)return`<div class="rbox"><h4>Safety databases</h4><p class="muted">${esc(vt.error)}</p></div>`;
  const tot=(vt.malicious||0)+(vt.suspicious||0)+(vt.harmless||0)+(vt.undetected||0)||1;
  const row=(l,n,c)=>`<div><span>${l}</span><span class="bar"><i style="width:${(n/tot*100).toFixed(1)}%;--c:${c}"></i></span><b>${n}</b></div>`;
  return`<div class="rbox"><h4>Safety databases (${tot} engines)</h4><div class="vt">${row('Harmful',vt.malicious||0,'var(--bad)')}${row('Suspicious',vt.suspicious||0,'var(--warn)')}${row('Clean',vt.harmless||0,'var(--ok)')}${row('Unrated',vt.undetected||0,'var(--mute)')}</div></div>`;
}
function loadShot(img,url,n){
  img.onload=()=>img.closest('.shot').classList.add('ok');
  img.onerror=()=>{if(n<10&&img.isConnected)setTimeout(()=>{if(img.isConnected)loadShot(img,url,n+1);},5000);};
  img.src=url+(n?`?r=${n}`:'');
}
function ageText(d){
  if(d==null)return'';
  if(d<60)return`${d} day${d===1?'':'s'} old`;
  if(d<730)return`about ${Math.round(d/30)} months old`;
  return`about ${Math.round(d/365)} years old`;
}
function guardActions(r){
  if(!r)return'';
  const{lv}=riskOf(r),owner=!!TOKEN;
  const open=lv==='danger'
    ?`<button class="btn btn-ghost" data-g="open" data-url="${esc(r.url)}">${IC.shield}Open anyway (isolated)</button>`
    :`<button class="btn btn-main" data-g="open" data-url="${esc(r.url)}">${IC.shield}${owner?'Open in Safe Window':'Open in Safe Window (owner)'}</button>`;
  return`<div class="res-act">${open}<button class="btn btn-ghost" data-g="copy">${IC.copy}Copy summary</button></div>
    ${owner?(lv==='danger'?'<p class="note ac-warn">Even inside the Safe Window, never type a password, OTP or personal detail into this page.</p>':''):'<p class="note">Only the owner can open links in the Safe Window. Log in with the lock icon at the bottom of the page.</p>'}`;
}
function gResult(r){
  gEnd();gLast=r;
  const{s,lv}=riskOf(r),L=LV[lv];
  const flags=(r.flags||[]).length?`<ul class="flags">${r.flags.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:'<p class="okline">Nothing suspicious found in the link itself.</p>';
  const age=r.age!=null?`<p class="muted">The site name is ${esc(ageText(r.age))}.</p>`:'';
  let boxes=`<div class="rbox"><h4>Warning signs</h4>${flags}${age}</div>`;
  if(r.demo){
    boxes+=`<div class="rbox"><h4>Preview mode</h4><p class="note">This preview has no server, so only the shape of the link was checked. On the live site the link is opened on a safe server, compared with safety databases, and photographed for this report.</p></div>`;
  }else{
    if((r.hops||[]).length)boxes+=`<div class="rbox"><h4>Redirects (${r.hops.length})</h4><ol class="hops">${r.hops.map(h=>`<li><span class="st ${stClass(h.status)}">${esc(h.status)}</span><span class="hu">${esc(h.url)}</span></li>`).join('')}</ol>${r.title?`<p class="muted">Page title: ${esc(r.title)}</p>`:''}</div>`;
    boxes+=vtBox(r.vt);
    if(r.scan&&r.scan.screenshot)boxes+=`<div class="rbox"><h4>What the page looks like</h4><div class="shot" id="shot"><span>Taking a snapshot, a few seconds…</span><img alt="Snapshot of the page" referrerpolicy="no-referrer"></div><p class="muted" id="scanNote"></p>${r.scan.report?`<a class="muted" href="${esc(r.scan.report)}" target="_blank" rel="noopener noreferrer">Open the full urlscan report</a>`:''}</div>`;
    else if(r.scan&&r.scan.error)boxes+=`<div class="rbox"><h4>Page snapshot</h4><p class="muted">${esc(r.scan.error)}</p></div>`;
  }
  $('#gStage').innerHTML=`<div class="res ${L.c}">
    <div class="res-top">${gaugeSVG(s)}<div><h3 class="verdict">${esc(L.t)}</h3><p class="v-adv">${esc(L.a)}</p><p class="v-url">${esc(r.finalUrl&&r.finalUrl!==r.url?r.url+'  →  '+r.finalUrl:r.url)}</p></div></div>
    <div class="pab"><span class="pab-av" aria-hidden="true">P</span><p>${esc(r.summary||localNarrative(r))}</p></div>
    <div id="gActs">${guardActions(r)}</div>
    <div class="res-grid">${boxes}</div>
    <p class="note">No check can give a 100% guarantee. If you are still unsure, do not open the link.</p></div>`;
  const img=$('#shot img');if(img&&r.scan)loadShot(img,r.scan.screenshot,0);
  if(r.scan&&r.scan.uuid===undefined&&r.scan.report){const m=String(r.scan.report).match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);if(m)r.scan.uuid=m[0];}
  if(r.scan&&r.scan.uuid)pollScan(r.scan.uuid);
}
async function pollScan(uuid){
  for(let i=0;i<4;i++){
    await wait(i?12000:20000);
    const n=$('#scanNote');if(!n)return;
    const r=await api('scanResult',{uuid});
    if(r&&r.done){
      const b=(r.brands||[]).length?` It imitates: ${r.brands.join(', ')}.`:'';
      n.textContent=r.malicious?'urlscan.io judged this page malicious.'+b:'urlscan.io found no threats on this page.'+b;
      n.classList.toggle('bad',!!r.malicious);
      return;
    }
  }
}
function guardOwnerChanged(){const a=$('#gActs');if(a&&gLast)a.innerHTML=guardActions(gLast);}
async function runCheck(raw,opt={}){
  const url=normUrl(raw);
  if(!url){if(!opt.quiet)toast('Enter a complete link, like https://example.com','bad');return null;}
  if(gBusy){toast('A check is already running. Please wait a moment.');return null;}
  gBusy=true;$('#gUrl').value=url;gScan(url);
  let r;
  try{r=await api('check',{url});}catch(e){r={error:'Could not reach the server.'};}
  gBusy=false;
  if(!r||r.error){gError((r&&r.error)||'The check did not work.');return null;}
  if(!Array.isArray(r.flags))r.flags=localFlags(url);
  r.url=r.url||url;
  gResult(r);return r;
}
async function guardSubmit(){
  const r=await runCheck($('#gUrl').value);
  if(!r)return;
  const{lv}=riskOf(r);
  if(TOKEN&&gAuto()&&lv!=='danger')SW.open(r.url,{verdict:lv});
}
function guardClick(e){
  const b=e.target.closest('[data-g]');if(!b)return;
  if(b.dataset.g==='open')SW.open(b.dataset.url,{verdict:'manual'});
  else if(b.dataset.g==='copy'&&gLast){const t=`${LV[riskOf(gLast).lv].t}: ${gLast.url}\n${gLast.summary||localSummary(gLast)}`;copyText(t).then(()=>toast('Copied'));}
}

/* ═══════════════ Safe Window: a remote browser in a small window ═══════════════
   Real mode : a Hyperbeam cloud browser. Your device only receives a video stream.
   Basic mode: a locked iframe (weaker). Used only after you confirm, when Hyperbeam is not connected.
   Demo mode : an honest simulation, used in the preview page. */
const SW={mode:'',hb:null,session:'',expires:0,timer:0,url:'',busy:false,min:false,max:false,mobile:false,gen:0,
  open:(u,o)=>swOpen(u,o),close:()=>swClose()};
function swIsOpen(){const w=$('#swin');return!!w&&!w.hidden;}
const swStage=()=>$('#swinStage');
function swSetUrl(u){
  let t=u;try{const x=new URL(u);t=x.hostname.replace(/^www\./,'')+(x.pathname!=='/'?x.pathname:'');}catch(e){}
  const s=$('#swinUrl');s.textContent=t;s.title=u;
}
function swFoot(t){$('#swinFoot').textContent=t||'';}
function swLoading(url){
  swStage().innerHTML=`<div class="swin-msg"><div class="radar sm" aria-hidden="true"><i></i></div><p><b>Starting a clean remote browser…</b></p><p class="mono muted">${esc(domainOf(url)||url)}</p></div>`;
  swFoot('Checking is done. Now the page opens on a remote computer, not on your device.');
}
function swTimerStart(){
  clearInterval(SW.timer);
  const tick=()=>{
    const left=Math.max(0,Math.round((SW.expires-Date.now())/1000));
    const t=$('#swinTime');t.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');t.classList.toggle('low',left<=45);
    if(left<=0){clearInterval(SW.timer);swEnded('The session time is over.');}
  };
  tick();SW.timer=setInterval(tick,1000);
}
async function swEnd(){
  clearInterval(SW.timer);
  const id=SW.session,hb=SW.hb;
  SW.session='';SW.hb=null;SW.mode='';
  try{if(hb&&hb.destroy)hb.destroy();}catch(e){}
  const st=swStage();if(st)st.innerHTML='';
  $('#swin').classList.remove('ready','sim','basic','frame');
  $('#swinTime').textContent='';
  if(id)api('safeClose',{session_id:id});
}
function swEnded(msg){
  if(!swIsOpen())return;
  swEnd();
  swStage().innerHTML=`<div class="swin-msg"><p><b>${esc(msg||'The session ended.')}</b></p><p class="muted">The remote browser was erased. Nothing was kept.</p><div class="btns"><button class="btn btn-main sm" data-sw="again">Open it again</button><button class="btn btn-ghost sm" data-sw="close">Close</button></div></div>`;
  swFoot('');
}
function swFail(msg){
  swStage().innerHTML=`<div class="swin-msg"><p><b>The Safe Window could not start.</b></p><p class="muted">${esc(msg)}</p><div class="btns"><button class="btn btn-main sm" data-sw="again">Try again</button><button class="btn btn-ghost sm" data-sw="close">Close</button></div></div>`;
  swFoot('');
}
async function swClose(){
  SW.gen++;SW.busy=false;
  if(swIsOpen()){await swEnd();}
  const w=$('#swin');w.hidden=true;document.body.classList.remove('swin-on');
  SW.min=false;SW.max=false;w.classList.remove('min','max');
}
function swMin(on){
  SW.min=on;$('#swin').classList.toggle('min',on);
  const b=$('[data-sw=min]');b.innerHTML=on?IC.restore:IC.min;b.setAttribute('aria-label',on?'Restore':'Minimise');
}
function swMax(on){
  SW.max=on;$('#swin').classList.toggle('max',on);
  if(on)swMin(false);
  const b=$('[data-sw=max]');b.innerHTML=on?IC.restore:IC.max;b.setAttribute('aria-label',on?'Make smaller':'Make bigger');
  setTimeout(swResizeVM,320);
}
function swResizeVM(){
  if(!SW.hb)return;
  const r=swStage().getBoundingClientRect(),k=SW.mobile?1:1.25;
  try{SW.hb.resize(Math.round(clamp(r.width*k,360,1920)),Math.round(clamp(r.height*k,360,1080)));}catch(e){}
}
async function swOpen(url,o={}){
  if(SW.busy)return false;
  if(!TOKEN){const ok=await ensureOwner('The Safe Window is an owner tool. Log in to open links in it.');if(!ok)return false;}
  url=normUrl(url);
  if(!url){toast('That link looks incomplete','bad');return false;}
  SW.busy=true;const gen=++SW.gen;
  await swEnd();
  const w=$('#swin');w.hidden=false;document.body.classList.add('swin-on');
  swMin(false);
  SW.url=url;swSetUrl(url);swLoading(url);
  const rect=swStage().getBoundingClientRect();
  SW.mobile=innerWidth<760;
  const k=SW.mobile?1:1.25;
  const W=Math.round(clamp(rect.width*k,360,1920)),H=Math.round(clamp(rect.height*k,360,1080));
  const r=await api('safeOpen',{url,w:W,h:H,mobile:SW.mobile});
  if(gen!==SW.gen){if(r&&r.session_id)api('safeClose',{session_id:r.session_id});return false;}
  SW.busy=false;
  if(r.error==='not_configured')return swNotConnected(url,o);
  if(r.error){swFail(r.error);return false;}
  if(r.demo)return swDemo(url,r);
  return swHyper(url,r);
}
async function swHyper(url,r){
  SW.session=r.session_id;SW.expires=r.expiresAt;SW.mode='hyper';
  swStage().innerHTML='<div class="swin-hb" id="swinHb"></div>';
  const host=$('#swinHb');
  swTimerStart();
  swFoot('Running on a remote computer. Nothing from this page reaches your device. Still, type no passwords or personal details unless you must.');
  $('#swin').classList.add('ready');
  try{
    const m=await import(HB_SDK);
    const HBc=m.default||m.Hyperbeam||m;
    const hb=await HBc(host,r.embed_url,{
      adminToken:r.admin_token,timeout:25000,delegateKeyboard:true,
      onDisconnect:()=>swEnded('The session ended.'),
      onCloseWarning:()=>toast('The Safe Window closes in about 30 seconds.','warn')
    });
    SW.hb=hb;
    try{hb.tabs.onUpdated.addListener((id,ch)=>{if(ch&&ch.url)swSetUrl(ch.url);});}catch(e){}
  }catch(e){
    host.innerHTML='';
    const f=document.createElement('iframe');
    f.className='swin-frame';f.title='Safe Window';f.src=r.embed_url;
    f.setAttribute('allow','autoplay; clipboard-read; clipboard-write; fullscreen');
    host.appendChild(f);SW.hb=null;SW.mode='hyper-frame';$('#swin').classList.add('frame');
  }
  return true;
}
function swNotConnected(url,o){
  const danger=o.verdict==='danger';
  swStage().innerHTML=`<div class="swin-msg"><p><b>The remote browser is not connected yet.</b></p>
    <p class="muted">${danger?'This link looks dangerous, so I will not open it any other way.':'The owner needs to add a Hyperbeam key (free) in Admin, under Connections. Until then you can use a weaker, basic frame.'}</p>
    <div class="btns">${danger?'':`<button class="btn btn-ghost sm" data-sw="basic" data-url="${esc(url)}">Open in a basic frame</button>`}<button class="btn btn-main sm" data-sw="conn">Connect it</button></div></div>`;
  swFoot('');
  return false;
}
function swBasic(url){
  SW.mode='basic';SW.expires=Date.now()+15*60000;swTimerStart();
  const f=document.createElement('iframe');
  f.className='swin-frame';f.title='Safe Window (basic frame)';
  f.setAttribute('sandbox','allow-scripts allow-forms allow-popups');f.setAttribute('referrerpolicy','no-referrer');f.src=url;
  const st=swStage();st.innerHTML='';st.appendChild(f);
  $('#swin').classList.add('ready','basic');
  swFoot('Basic frame: locked down, but the page still runs on your device and many sites refuse to load. Connect Hyperbeam for a real remote browser.');
}
function swDemo(url,r){
  SW.mode='demo';SW.expires=r.expiresAt;swTimerStart();
  swStage().innerHTML=`<div class="swin-demo"><div class="sd-top"><i></i><i></i><i></i><span class="mono">${esc(url)}</span></div><div class="sd-body"><div class="sd-pulse" aria-hidden="true"></div><h4>Remote browser (preview)</h4><p>On the live site this window shows a real browser running on a remote computer. You click and type here as usual, while only a video stream reaches your device. Viruses, pop-ups and trackers stay on that machine, which is erased when you close the window.</p><p class="muted">Nothing was really opened in this preview.</p></div></div>`;
  swFoot('Preview only. On the live site this is a real, isolated browser.');
  $('#swin').classList.add('ready','sim');
  return true;
}
function swClick(e){
  const b=e.target.closest('[data-sw]');if(!b)return;
  const a=b.dataset.sw;
  if(a==='close')swClose();
  else if(a==='min')swMin(!SW.min);
  else if(a==='max')swMax(!SW.max);
  else if(a==='back'){try{SW.hb&&SW.hb.tabs.goBack();}catch(x){}}
  else if(a==='fwd'){try{SW.hb&&SW.hb.tabs.goForward();}catch(x){}}
  else if(a==='reload'){try{SW.hb&&SW.hb.tabs.reload();}catch(x){}}
  else if(a==='again')swOpen(SW.url,{verdict:'manual'});
  else if(a==='conn'){swClose();openAdminTab('conn');}
  else if(a==='basic')swBasic(b.dataset.url);
}
function swDragInit(){
  const bar=$('#swinBar'),w=$('#swin');let d=null;
  bar.addEventListener('pointerdown',e=>{
    if(e.target.closest('button')||SW.max||innerWidth<760)return;
    const r=w.getBoundingClientRect();
    d={dx:e.clientX-r.left,dy:e.clientY-r.top};
    w.style.left=r.left+'px';w.style.top=r.top+'px';w.style.right='auto';w.style.bottom='auto';
    w.classList.add('moving');try{bar.setPointerCapture(e.pointerId);}catch(x){}
  });
  bar.addEventListener('pointermove',e=>{
    if(!d)return;
    w.style.left=clamp(e.clientX-d.dx,-w.offsetWidth+140,innerWidth-140)+'px';
    w.style.top=clamp(e.clientY-d.dy,0,innerHeight-52)+'px';
  });
  const end=()=>{d=null;w.classList.remove('moving');};
  bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
  bar.addEventListener('dblclick',e=>{if(!e.target.closest('button')&&innerWidth>=760)swMax(!SW.max);});
}

/* ═══════════════ Studio: describe a website, get a published link ═══════════════ */
const studio={cur:null,at:0,busy:false,view:'phone',style:'',shown:'',list:[]};
const BSTEPS=['Reading your brief','Designing the look','Writing the code','Checking the result','Publishing the page'];
const RSTEPS=['Reading your change','Rewriting the page','Checking the result','Publishing the update'];
const STYLES=['Futuristic','Minimal','Playful','Luxury','Kasavu gold','Dark','Light'];
const EXAMPLES=[
  'A one-page site for a home bakery, warm and playful, with a menu and an order button',
  'A futuristic portfolio for a photographer',
  'A landing page for a school annual day with the schedule',
  'A simple menu page for a small tea shop'
];
function stepsHTML(list,i,all){
  return`<ol class="st-steps">${list.map((t,k)=>`<li class="${all||k<i?'done':k===i?'act':''}">${esc(t)}</li>`).join('')}</ol>`;
}
const fmtDate=iso=>{try{return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}catch(e){return'';}};

/* ── live check: GitHub Pages needs a minute or two before a new page opens ── */
async function waitLive(url,tick){
  if(DEMO)return'demo';
  const t0=Date.now();
  while(Date.now()-t0<160000){
    try{const r=await fetch(url+(url.includes('?')?'&':'?')+'_='+Date.now(),{cache:'no-store'});if(r.ok)return'live';}catch(e){}
    if(tick)tick(Math.round((Date.now()-t0)/1000));
    await wait(6000);
  }
  return'pending';
}

/* ── build / refine (shared by the Studio form and by Pablo's chat) ── */
async function studioRun(kind,arg,{style='',auto=true,id,extra={},onStep=()=>{}}={}){
  if(studio.busy)return{ok:false,error:'Another build is running. Please wait a moment.'};
  studio.busy=true;
  const wantPub=auto&&(DEMO||!!(S.features&&S.features.publish));
  const base=kind==='build'?BSTEPS:RSTEPS;
  const list=wantPub?base:base.slice(0,-1);
  const chk=kind==='build'?3:2;
  let i=0;onStep(list,0);
  const t1=setTimeout(()=>{if(i<1){i=1;onStep(list,1);}},kind==='build'?1800:1200);
  const t2=setTimeout(()=>{if(i<2){i=2;onStep(list,2);}},kind==='build'?6000:4500);
  let r;
  try{r=await api(kind,kind==='build'?{brief:arg,style,...extra}:{id,instruction:arg});}catch(e){r={error:'Could not reach the server.'};}
  clearTimeout(t1);clearTimeout(t2);
  if(!r||r.error||!r.html){studio.busy=false;return{ok:false,refused:!!(r&&r.refused),error:(r&&r.error)||'No page came back. Please try again.'};}
  const prev=kind==='refine'?studio.cur:null;
  const url=r.url||(prev&&prev.url)||'';
  studio.cur={id:r.id,title:r.title||'My website',html:r.html,url,status:url?'published':'draft',brief:kind==='build'?arg:(prev?prev.brief:''),demo:prev?!!prev.demo:false};
  studio.at=Date.now();
  onStep(list,chk);await wait(DEMO?500:700);
  let publishNote='';
  if(wantPub){
    onStep(list,list.length-1);
    const p=await studioPublishCur();
    if(!p.ok)publishNote=p.error;
  }else if(auto){
    publishNote='Publishing is not connected yet. Add a GitHub token in Admin, under Connections, to get a public link. You can still preview and copy the page.';
  }
  studio.busy=false;
  studioRender();studioLoadList();
  return{ok:true,cur:studio.cur,publishNote,cut:!!r.cut};
}
async function studioPublishCur(){
  const c=studio.cur;if(!c)return{ok:false,error:'Nothing to publish yet.'};
  const r=await api('publish',{id:c.id});
  if(!r||r.error){
    const nc=r&&r.error==='not_configured';
    return{ok:false,error:nc?'Publishing is not connected yet. Add a GitHub token in Admin, under Connections, to get a public link.':(r&&r.error)||'Publishing did not work.'};
  }
  c.url=r.url;c.status='published';c.demo=!!r.demo;
  return{ok:true,url:r.url};
}

/* ── drawing the Studio section ── */
function studioOwnerChanged(){
  if(TOKEN){studioLoadList();}
  else{studio.cur=null;studio.list=[];studio.shown='';studioRender();studioRenderList();}
}
function studioRender(){
  const c=studio.cur,out=$('#stOut');
  if(!c){out.hidden=true;return;}
  out.hidden=false;
  $('#stTitle').textContent=c.title;
  $('#stStatus').textContent=c.url?(c.demo?'Preview link, not a real page':'Published'):'Draft, not published yet';
  $('#stStatus').className='st-chip '+(c.url?(c.demo?'warn':'ok'):'');
  const acts=[];
  if(c.url&&!c.demo)acts.push(`<button class="btn btn-main sm" data-st="copy-link">Copy link</button><a class="btn btn-ghost sm" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Open site</a>`);
  else if(!c.url)acts.push('<button class="btn btn-main sm" data-st="publish">Publish and get the link</button>');
  else acts.push('<button class="btn btn-ghost sm" data-st="publish">Publish again</button>');
  acts.push('<button class="btn btn-ghost sm" data-st="copy-html">Copy HTML</button><button class="btn btn-ghost sm" data-st="download">Download</button>');
  $('#stActions').innerHTML=acts.join('');
  $('#stLinkRow').innerHTML=c.url?`<span class="muted">${c.demo?'Example link':'Link'}</span><code>${esc(c.url)}</code><span class="st-live" id="stLive"></span>`:'<span class="muted">No link yet. Tap “Publish and get the link”.</span>';
  if(studio.shown!==c.html){studio.shown=c.html;$('#stFrame').srcdoc=c.html;}
  $('#stDev').className='st-dev '+studio.view;
  $$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===studio.view)));
}
function studioShowGuide(text){
  $('#stGuide').hidden=false;$('#stGuideBody').innerHTML=md(text);studio.guideText=text;
}
async function studioLoadList(){
  if(!TOKEN)return;
  try{await admLoad();studio.list=(ADM.A&&ADM.A.builds)||[];}catch(e){studio.list=[];}
  studioRenderList();
}
function studioRenderList(){
  const l=$('#stList');if(!l)return;
  const box=$('#stRecent');
  box.hidden=!studio.list.length;
  l.innerHTML=studio.list.slice(0,12).map(b=>`<div class="li"><div class="grow"><b>${esc(b.title||'Untitled')}</b><small>${esc(fmtDate(b.updated||b.created))} · ${b.url?'published':'draft'}</small></div>
    <button class="btn btn-ghost sm" data-st="load" data-id="${esc(b.id)}">Open</button>
    ${b.url&&!DEMO?`<a class="ib" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open the published site">${IC.ext}</a>`:''}
    <button class="ib bad" data-st="del" data-id="${esc(b.id)}" aria-label="Delete">${IC.trash}</button></div>`).join('');
}

async function studioLoadBuild(id){
  const r=await api('getBuild',{id});
  if(!r||r.error){toast((r&&r.error)||'Could not open that build','bad');return false;}
  studio.cur={id:r.id,title:r.title,html:r.html,url:r.url||'',status:r.status,brief:r.brief||'',demo:DEMO&&!!r.url};
  studio.at=Date.now();studio.shown='';studioRender();
  $('#stOut').scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'start'});
  return true;
}

/* ── events ── */
function studioWatchLive(url){
  const l=$('#stLive');if(!l)return;
  l.textContent='Going live, this takes a minute or two…';l.className='st-live';
  waitLive(url).then(st=>{
    const n=$('#stLive');if(!n||!studio.cur||studio.cur.url!==url)return;
    if(st==='live'){n.textContent='Live now';n.className='st-live ok';}
    else if(st==='pending'){n.textContent='Still going live. Refresh the link in a minute.';}
  });
}
async function studioBuildClick(){
  if(studio.busy||chat.working){toast('Pablo is busy with another request.');return;}
  const brief=$('#stBrief').value.trim();
  if(brief.length<8){toast('Describe the website in a little more detail','bad');return;}
  if(!await ensureOwner('Studio is an owner tool. Log in to continue.'))return;
  const prog=$('#stProg');$('#stBuild').disabled=true;$('#stGuideBtn').disabled=true;
  const res=await studioRun('build',brief,{style:studio.style,auto:$('#stAuto').checked,extra:{image:studio.img||'',refUrl:($('#stRef').value||'').trim()},onStep:(list,i)=>{prog.hidden=false;prog.innerHTML=stepsHTML(list,i);}});
  $('#stBuild').disabled=false;$('#stGuideBtn').disabled=false;
  if(!res.ok){prog.hidden=false;prog.innerHTML=`<p class="g-err">${esc(res.error)}</p>`;return;}
  prog.hidden=true;
  toast(res.cur.url?'Website published':'Website ready');
  if(res.publishNote)toast(res.publishNote,'warn');
  if(res.cur.url&&!res.cur.demo)studioWatchLive(res.cur.url);
  $('#stOut').scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'start'});
}
async function studioGuideClick(){
  const brief=$('#stBrief').value.trim();
  if(brief.length<5){toast('Tell me what the website is about first','bad');return;}
  if(!await ensureOwner('Studio is an owner tool. Log in to continue.'))return;
  $('#stGuide').hidden=false;$('#stGuideBody').innerHTML='<p><i class="spin-s"></i> Writing your step-by-step guide…</p>';
  $('#stBuild').disabled=true;$('#stGuideBtn').disabled=true;
  const r=await api('guide',{brief});
  $('#stBuild').disabled=false;$('#stGuideBtn').disabled=false;
  if(!r||r.error||!r.guide){$('#stGuideBody').innerHTML=`<p class="g-err">${esc((r&&r.error)||'I could not write the guide.')}</p>`;return;}
  chat.guide=r.guide;studioShowGuide(r.guide);
  $('#stGuide').scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'start'});
}
async function studioRefineSubmit(e){
  e.preventDefault();
  const v=$('#stChange').value.trim();
  if(v.length<3||!studio.cur)return;
  if(studio.busy||chat.working){toast('Pablo is busy with another request.');return;}
  $('#stChange').value='';
  const prog=$('#stProg');
  const res=await studioRun('refine',v,{id:studio.cur.id,auto:!!studio.cur.url,onStep:(list,i)=>{prog.hidden=false;prog.innerHTML=stepsHTML(list,i);}});
  if(!res.ok){prog.hidden=false;prog.innerHTML=`<p class="g-err">${esc(res.error)}</p>`;return;}
  prog.hidden=true;toast('Updated');
  if(res.cur.url&&!res.cur.demo)studioWatchLive(res.cur.url);
}
async function studioClick(e){
  const b=e.target.closest('[data-st],[data-view],[data-style],[data-ex]');if(!b)return;
  if(b.dataset.ex!==undefined){$('#stBrief').value=EXAMPLES[+b.dataset.ex];$('#stBrief').focus();return;}
  if(b.dataset.style!==undefined){
    const s=b.dataset.style;studio.style=studio.style===s?'':s;
    $$('[data-style]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.style===studio.style)));return;
  }
  if(b.dataset.view){studio.view=b.dataset.view;studioRender();return;}
  const a=b.dataset.st,c=studio.cur;
  if(a==='publish'){
    if(studio.busy)return;studio.busy=true;b.disabled=true;
    const p=await studioPublishCur();studio.busy=false;
    if(!p.ok){b.disabled=false;toast(p.error,'bad');return;}
    studioRender();toast('Published');studioLoadList();
    if(!studio.cur.demo)studioWatchLive(studio.cur.url);
  }
  else if(a==='copy-link'&&c){await copyText(c.url);toast('Link copied');}
  else if(a==='copy-html'&&c){await copyText(c.html);toast('HTML copied');}
  else if(a==='download'&&c){
    const u=URL.createObjectURL(new Blob([c.html],{type:'text/html'})),a2=document.createElement('a');
    a2.href=u;a2.download=(c.title||'website').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.html';
    document.body.appendChild(a2);a2.click();a2.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
    toast('Download started. If nothing was saved, use Copy HTML instead.');
  }
  else if(a==='load'){b.disabled=true;await studioLoadBuild(b.dataset.id);b.disabled=false;}
  else if(a==='del'){
    if(!sure(b,IC.trash))return;
    const r=await api('deleteBuild',{id:b.dataset.id});
    if(r&&r.error){toast(r.error,'bad');return;}
    if(studio.cur&&studio.cur.id===b.dataset.id){studio.cur=null;studio.shown='';studioRender();}
    toast(r&&r.unpublished?'Deleted and unpublished':'Deleted');await studioLoadList();
  }
  else if(a==='login'){ensureOwner('Studio is an owner tool. Log in to continue.');}
  else if(a==='copy-guide'){await copyText(studio.guideText||chat.guide||'');toast('Guide copied');}
}
function studioInit(){
  $('#stChips').innerHTML=STYLES.map(s=>`<button type="button" class="chip" data-style="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join('');
  $('#stEx').innerHTML=EXAMPLES.map((t,i)=>`<button type="button" class="chip ghost" data-ex="${i}">${esc(t)}</button>`).join('');
  $('#studio').addEventListener('click',studioClick);
  $('#stBuild').addEventListener('click',studioBuildClick);
  $('#stImg').addEventListener('change',async e=>{
    const f=e.target.files&&e.target.files[0];if(!f)return;
    try{studio.img=await readImage(f);$('#stImgName').textContent=f.name;$('#stImgX').hidden=false;}
    catch(er){toast(er.message,'bad');}e.target.value='';
  });
  $('#stImgX').addEventListener('click',()=>{studio.img='';$('#stImgName').textContent='';$('#stImgX').hidden=true;});
  $('#stGuideBtn').addEventListener('click',studioGuideClick);
  $('#stRefine').addEventListener('submit',studioRefineSubmit);
}

/* ═══════════════ Admin ═══════════════ */
const TABS=[['works','Works'],['profile','Profile'],['design','Design'],['vault','Password vault'],['builds','Builds'],['conn','Connections'],['lock','Lock']];
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=u=>{u=new Uint8Array(u);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s);};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function deriveKey(pw,salt){const km=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function encJ(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(obj)));return b64(iv)+'.'+b64(ct);}
async function decJ(key,s){const[a,b]=String(s).split('.');const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(a)},key,unb64(b));return JSON.parse(dec.decode(pt));}
function genPw(n=16){const cs='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?';return Array.from(crypto.getRandomValues(new Uint32Array(n)),x=>cs[x%cs.length]).join('');}
function vaultTouch(){
  if(!ADM.vault.key)return;clearTimeout(ADM.vault.timer);
  ADM.vault.timer=setTimeout(()=>{vaultLock();toast('The vault locked itself after 3 minutes without use');},180000);
}
function vaultLock(silent){
  clearTimeout(ADM.vault.timer);ADM.vault.key=null;ADM.vault.items=[];ADM.vault.show={};ADM.vault.edit=null;
  if(!silent&&ADM.tab==='vault'&&!$('#admin').hidden&&TOKEN)renderAdmBody();
}
async function vaultReload(){
  await admLoad();const out=[];
  for(const it of ADM.A.vault){if(it.id==='_check')continue;try{out.push({id:it.id,...await decJ(ADM.vault.key,it.payload)});}catch(_){}}
  ADM.vault.items=out;
}
async function vaultUnlock(pw){
  const chk=ADM.A.vault.find(i=>i.id==='_check');let key;
  if(chk){
    const[saltB,rest]=String(chk.payload).split('|');
    key=await deriveKey(pw,unb64(saltB));
    try{await decJ(key,rest);}catch(e){throw new Error('Wrong master password');}
  }else{
    const salt=crypto.getRandomValues(new Uint8Array(16));
    key=await deriveKey(pw,salt);
    const payload=b64(salt)+'|'+await encJ(key,{ok:1});
    const r=await api('vaultSave',{item:{id:'_check',title:'check',payload}});
    if(r.error)throw new Error(r.error);
  }
  ADM.vault.key=key;await vaultReload();vaultTouch();
}
async function admLoad(){
  const r=await api('adminAll');
  if(r.error){if(r.auth===false){ADM.A=null;if($('#admin')&&!$('#admin').hidden)renderAdm();}throw new Error(r.error);}
  ADM.A=r;
  if(r.features)S.features=r.features;
}
async function admReload(){await admLoad();renderAdmBody();await refreshPublic();}
async function admOpen(){
  const a=$('#admin');a.hidden=false;document.body.classList.add('no-scroll','in-adm');
  if(TOKEN){try{await admLoad();}catch(e){setToken('');}}
  renderAdm();
}
function openAdminTab(t){ADM.tab=t;admOpen();}
function admClose(){
  $('#admin').hidden=true;document.body.classList.remove('no-scroll','in-adm');vaultLock(true);applyTheme(S.theme);
  if(location.hash==='#admin'){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
}
function renderAdm(){
  const a=$('#admin');
  if(!TOKEN||!ADM.A){
    a.innerHTML=`<div class="adm-card card"><div class="adm-head"><b>Admin</b><div class="adm-hb"><button class="ib" data-act="close" aria-label="Close">${IC.x}</button></div></div>
      <form class="login" id="f-login"><h3>Owner login</h3><label class="fld"><span>Password</span><input class="in" type="password" name="pw" autocomplete="current-password" required value="${DEMO?'demo':''}"></label>
      ${DEMO?'<p class="muted">Preview password: <code>demo</code></p>':'<p class="muted">First time? The starter password is in the setup steps Pablo gave you. You will be asked to change it.</p>'}<div class="btns"><button class="btn btn-main">Log in</button></div></form></div>`;
    setTimeout(()=>{const i=a.querySelector('input');if(i)i.focus();},60);return;
  }
  a.innerHTML=`<div class="adm-card card" role="dialog" aria-modal="true" aria-label="Admin"><div class="adm-head"><b>Admin</b><div class="adm-hb"><button class="ib" data-act="logout" aria-label="Log out">${IC.out}</button><button class="ib" data-act="close" aria-label="Close">${IC.x}</button></div></div><nav class="adm-tabs" id="admTabs"></nav><div class="adm-body" id="admBody"></div></div>`;
  renderAdmBody();
}
function renderAdmBody(){
  $('#admTabs').innerHTML=TABS.map(([k,l])=>`<button class="${ADM.tab===k?'on':''}" data-act="tab" data-tab="${k}">${l}</button>`).join('');
  const f={works:tabWorks,profile:tabProfile,design:tabDesign,vault:tabVault,builds:tabBuilds,conn:tabConn,lock:tabLock}[ADM.tab]||tabWorks;
  $('#admBody').innerHTML=f();
}
function tabWorks(){
  const L=ADM.A.sites,e=ADM.edit||{};
  return`<form class="form" id="f-site" autocomplete="off"><input type="hidden" name="_id" value="${esc(e.id||'')}"><input type="hidden" name="_order" value="${esc(e.order??'')}">
    <h3>${e.id?'Edit work':'Add a work'}</h3>
    <div class="row2"><label class="fld"><span>Name</span><input class="in" name="name" required value="${esc(e.name||'')}" placeholder="e.g. Assembly Attendance"></label>
    <label class="fld"><span>Site link</span><input class="in" name="link" inputmode="url" value="${esc(e.link||'')}" placeholder="https://..."></label></div>
    <label class="fld"><span>Logo link (the address of an image)</span><input class="in" name="logo" inputmode="url" value="${esc(e.logo||'')}" placeholder="https://.../logo.png"></label>
    <div class="btns"><button class="btn btn-main">${e.id?'Save':'Add'}</button>${e.id?'<button type="button" class="btn btn-ghost" data-act="site-cancel">Cancel</button>':''}</div></form>
    <h3>Your works (${L.length})</h3>
    <div class="lst">${L.map((s,i)=>`<div class="li">${logoHTML(s)}<div class="grow"><b>${esc(s.name)}</b><small>${esc(domainOf(s.link)||'No link')}</small></div>
      <button class="ib" data-act="site-up" data-id="${esc(s.id)}" ${i===0?'disabled':''} aria-label="Move up">${IC.up}</button>
      <button class="ib" data-act="site-down" data-id="${esc(s.id)}" ${i===L.length-1?'disabled':''} aria-label="Move down">${IC.down}</button>
      <button class="ib" data-act="site-edit" data-id="${esc(s.id)}" aria-label="Edit">${IC.edit}</button>
      <button class="ib bad" data-act="site-del" data-id="${esc(s.id)}" aria-label="Delete">${IC.trash}</button></div>`).join('')||'<p class="muted">Nothing added yet.</p>'}</div>`;
}
function tabProfile(){
  const P=ADM.A.profile||{},v=k=>esc(Array.isArray(P[k])?P[k].join('\n'):(P[k]||''));
  const inp=(k,l,ph)=>`<label class="fld"><span>${l}</span><input class="in" name="${k}" value="${v(k)}" ${ph?`placeholder="${ph}"`:''}></label>`;
  return`<form class="form" id="f-profile"><h3>Your details</h3>
    <div class="row2">${inp('fullName','Full name')}${inp('role','Title')}</div>
    ${inp('roles','Words that rotate in the hero (separate with commas)')}
    ${inp('tagline','One-line intro')}
    <label class="fld"><span>About you</span><textarea class="in" name="bio" rows="4">${v('bio')}</textarea></label>
    <label class="fld"><span>Organisations (one per line)</span><textarea class="in" name="orgs" rows="3">${v('orgs')}</textarea></label>
    <div class="row2">${inp('location','Location')}${inp('phone','Phone','+91 ...')}</div>
    <div class="row2">${inp('whatsapp','WhatsApp number (with country code)','91...')}${inp('email','Email')}</div>
    ${inp('photo','Photo link','https://...')}
    <label class="fld"><span>Other details (one per line, as “Title: detail”)</span><textarea class="in" name="extra" rows="3">${v('extra')}</textarea></label>
<div class="btns"><button class="btn btn-main">Save</button></div></form>`;
}
function vItem(i){
  const sh=ADM.vault.show[i.id],id=esc(i.id);
  return`<div class="vi"><div class="vi-h"><b>${esc(i.title)}</b>${i.link?`<a class="mono muted" href="${esc(safeUrl(i.link))}" target="_blank" rel="noopener noreferrer">${esc(domainOf(i.link))}</a>`:''}<span class="grow"></span>
    <button class="ib" data-act="v-edit" data-id="${id}" aria-label="Edit">${IC.edit}</button><button class="ib bad" data-act="v-del" data-id="${id}" aria-label="Delete">${IC.trash}</button></div>
    ${i.user?`<div class="vi-r"><span class="k">Username</span><code>${esc(i.user)}</code><button class="ib" data-act="v-copy" data-id="${id}" data-f="user" aria-label="Copy">${IC.copy}</button><span></span></div>`:''}
    ${i.pass?`<div class="vi-r"><span class="k">Password</span><code>${sh?esc(i.pass):'••••••••••'}</code><button class="ib" data-act="v-show" data-id="${id}" aria-label="Show">${IC.eye}</button><button class="ib" data-act="v-copy" data-id="${id}" data-f="pass" aria-label="Copy">${IC.copy}</button></div>`:''}
    ${i.note?`<p class="vi-n">${esc(i.note)}</p>`:''}</div>`;
}
function vList(){
  const q=(ADM.vq||'').toLowerCase();
  const list=ADM.vault.items.filter(i=>!q||[i.title,i.user,i.link,i.note].join(' ').toLowerCase().includes(q));
  return list.map(vItem).join('')||'<p class="muted">Nothing found.</p>';
}
function refreshVList(){const l=$('#vlist');if(l)l.innerHTML=vList();}
function tabVault(){
  const V=ADM.vault;
  if(!V.key){
    const first=!ADM.A.vault.some(i=>i.id==='_check');
    return`<form class="form" id="f-vunlock" style="max-width:480px"><h3>Password vault</h3>
      <p class="muted">${first?'Create a master password first. Every entry is locked with it inside your browser before it reaches the sheet. If you forget it, nobody can recover your entries.':'Enter your master password to open the vault.'}</p>
      <label class="fld"><span>Master password${first?' (at least 8 characters)':''}</span><input class="in" type="password" name="mp" ${first?'minlength="8"':''} required autocomplete="off"></label>
      <div class="btns"><button class="btn btn-main">${first?'Create and open':'Open'}</button></div></form>`;
  }
  const e=V.edit||{};
  return`<div class="btns" style="justify-content:space-between;align-items:center"><h3>Password vault (${V.items.length})</h3><button class="btn btn-ghost sm" data-act="v-lock">Lock</button></div>
    <form class="form" id="f-vitem" autocomplete="off"><input type="hidden" name="_id" value="${esc(e.id||'')}"><h4>${e.id?'Edit entry':'Add an entry'}</h4>
    <div class="row2"><label class="fld"><span>Name (which site or app)</span><input class="in" name="title" required value="${esc(e.title||'')}"></label>
    <label class="fld"><span>Link</span><input class="in" name="link" value="${esc(e.link||'')}"></label></div>
    <div class="row2"><label class="fld"><span>Username</span><input class="in" name="user" value="${esc(e.user||'')}" autocomplete="off"></label>
    <label class="fld"><span>Password</span><span class="accent-row"><input class="in" name="pass" id="vpass" value="${esc(e.pass||'')}" autocomplete="new-password" style="flex:1"><button type="button" class="ib" data-act="v-gen" aria-label="Generate a password">${IC.dice}</button></span></label></div>
    <label class="fld"><span>Notes</span><textarea class="in" name="note" rows="2">${esc(e.note||'')}</textarea></label>
    <div class="btns"><button class="btn btn-main">${e.id?'Save':'Add'}</button>${e.id?'<button type="button" class="btn btn-ghost" data-act="v-cancel">Cancel</button>':''}</div></form>
    <label class="fld"><span>Search</span><input class="in" id="vq" value="${esc(ADM.vq)}" placeholder="Name, username..."></label>
    <div class="lst" id="vlist">${vList()}</div>`;
}
function tabDesign(){
  const t=ADM.theme;
  const sw=(k,l)=>`<label class="swrow"><span>${l}</span><input type="checkbox" class="swi" name="${k}" ${t[k]!==false?'checked':''}><i class="sw"></i></label>`;
  return`<form class="form" id="f-design"><h3>Choose a design</h3>
    <div class="skins">${SKINS.map(k=>`<button type="button" class="skin ${t.name===k?'on':''}" data-act="skin" data-skin="${k}"><span class="pv pv-${k}"></span><span class="sk-t"><b>${SKIN_NAME[k]}</b><small>${SKIN_NOTE[k]}</small></span></button>`).join('')}</div>
    <label class="fld"><span>Change the main colour (optional)</span><span class="accent-row"><input type="color" id="accent" value="${esc(/^#[0-9a-f]{6}$/i.test(t.accent||'')?t.accent:'#'+parseHex(getC('--a1')).map(v=>v.toString(16).padStart(2,'0')).join(''))}"><button type="button" class="btn btn-ghost sm" data-act="accent-reset">Use the design's own colour</button></span></label>
    <div>${sw('particles','Drifting particles in the background')}${sw('grain','Fine grain texture')}${sw('cursor','Glow that follows the mouse')}</div>
        <h3>Redesign the whole site</h3>
    <p class="muted">Describe the look you want, or add a screenshot you like. Pablo restyles every part of the site. You see it live, then keep it or remove it.</p>
    <textarea class="in" id="dzBrief" rows="3" maxlength="1500" placeholder="For example: a bright, clean look in cream and deep green, rounded cards, a friendly serif for headings.">${esc(ADM.dz.brief)}</textarea>
    <div class="st-ref"><label class="btn btn-ghost sm" for="dzImg">Add a screenshot</label><input type="file" id="dzImg" accept="image/*" hidden><span class="muted" id="dzImgName">${esc(ADM.dz.name)}</span></div>
    <div class="btns"><button type="button" class="btn btn-ghost" data-act="dz-go">Redesign</button>${t.css?'<button type="button" class="btn btn-ghost" data-act="dz-clear">Remove custom look</button>':''}</div>
    <p class="cn-res ${ADM.dz.cls}" id="dzMsg">${esc(ADM.dz.msg)}</p>
    <div class="btns"><button class="btn btn-main">Save</button></div></form>`;
}

/* ── Builds ── */
function tabBuilds(){
  const B=ADM.A.builds||[];
  return`<h3>Websites Pablo built (${B.length})</h3>
    <p class="muted">Every page Pablo builds is kept here. Open one to preview or change it in Studio. Deleting a published page also removes it from GitHub.</p>
    <div class="lst">${B.map(b=>`<div class="li"><div class="grow"><b>${esc(b.title||'Untitled')}</b><small>${esc(fmtDate(b.updated||b.created))} · ${b.url?'published':'draft'}</small>${b.brief?`<small class="brief">${esc(b.brief)}</small>`:''}</div>
      <button class="btn btn-ghost sm" data-act="b-open" data-id="${esc(b.id)}">Open in Studio</button>
      ${b.url&&!DEMO?`<a class="ib" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open the published site">${IC.ext}</a>`:''}
      <button class="ib bad" data-act="b-del" data-id="${esc(b.id)}" aria-label="Delete">${IC.trash}</button></div>`).join('')||'<p class="muted">Nothing built yet. Ask Pablo in the chat, or use the Studio section.</p>'}</div>`;
}

/* ── Connections ── */
const CONN=[
  {id:'gemini',name:'Gemini',role:'Pablo’s brain: conversation, website building and guides',key:'GEMINI_API_KEY',keyLabel:'API key',test:'gemini',feat:'ai',
    extra:[['GEMINI_CHAT_MODEL','Chat model (optional)','gemini-3.8-flash'],['GEMINI_BUILD_MODEL','Build model (optional)','gemini-3.8-flash']],
    link:['https://aistudio.google.com/apikey','Open Google AI Studio'],free:'Has a free tier',
    how:['Open Google AI Studio with the button below and sign in with Google.','Tap “Create API key”.','Copy the key and paste it into the box above, then tap Save.']},
  {id:'hyperbeam',name:'Hyperbeam',role:'The Safe Window: a remote browser for opening suspicious links without risk',key:'HYPERBEAM_API_KEY',keyLabel:'API key',test:'hyperbeam',feat:'safe',
    extra:[['HB_REGION','Region: NA, EU or AS','AS'],['HB_MAX_MINUTES','Minutes per session (3 to 60)','15']],
    link:['https://hyperbeam.com/dashboard/','Open the Hyperbeam dashboard'],free:'Hyperbeam says 10,000 free minutes a month',
    how:['Open the dashboard with the button below and create an account.','Look for the API key (usually under Settings or API keys) and copy it.','Paste it above and tap Save, then Test.','If your account shows no key option, email founders@hyperbeam.com and ask for an API key for a personal project.']},
  {id:'github',name:'GitHub',role:'Publishing: puts the websites Pablo builds on your own GitHub Pages and returns the link',key:'GITHUB_TOKEN',keyLabel:'Access token',test:'github',feat:'publish',
    extra:[['GITHUB_REPO','Repository, written as owner/name','owner/repository',1],['GITHUB_BRANCH','Branch (optional)','main']],
    link:['https://github.com/settings/personal-access-tokens/new','Create a token on GitHub'],free:'Free',
    how:['Open the button below. Give the token any name, like “Pablo”.','Under “Repository access” choose “Only select repositories” and pick the repository your site lives in.','Under “Permissions”, open “Repository permissions” and set “Contents” to “Read and write”.','Tap “Generate token”, copy it, paste it above, and also type your repository as owner/name. Then Save and Test.']},
  {id:'virustotal',name:'VirusTotal',role:'Link checks: asks dozens of security engines about a link (optional)',key:'VT_API_KEY',keyLabel:'API key',test:'virustotal',feat:'scan',
    extra:[],link:['https://www.virustotal.com/gui/join-us','Open VirusTotal'],free:'Free for personal use, with daily limits',
    how:['Create a free account with the button below and sign in.','Open your profile picture, then “API key”.','Copy the key, paste it above and tap Save.']},
  {id:'urlscan',name:'urlscan.io',role:'Link checks: opens the page safely and takes a snapshot for the report (optional)',key:'URLSCAN_API_KEY',keyLabel:'API key',test:'urlscan',feat:'scan',
    extra:[],link:['https://urlscan.io/user/signup','Open urlscan.io'],free:'Free tier',
    how:['Create a free account with the button below and sign in.','Open “Settings & API”, then “New API key”.','Copy the key, paste it above and tap Save.']}
];
function connCard(c){
  const K=ADM.A.keys||{},has=!!K[c.key];
  const extra=c.extra.map(([k,l,ph,vis])=>`<label class="fld"><span>${l}</span><input class="in" name="${k}" value="${esc(K[k]||'')}" placeholder="${esc(ph)}" autocomplete="off"></label>`).join('');
  return`<form class="conn" id="f-conn-${c.id}" data-conn="${c.id}" autocomplete="off">
    <div class="cn-h"><div><h4>${esc(c.name)}</h4><p class="muted">${esc(c.role)}</p></div><span class="st-chip ${has?'ok':''}">${has?'Connected':'Not connected'}</span></div>
    <label class="fld"><span>${esc(c.keyLabel)}</span><input class="in" type="password" name="${c.key}" autocomplete="new-password" placeholder="${has?'Saved. Type a new one to replace it':'Paste it here'}"></label>
    ${extra}
    <details class="how"><summary>How to get it <span class="muted">· ${esc(c.free)}</span></summary><ol>${c.how.map(h=>`<li>${esc(h)}</li>`).join('')}</ol><a class="btn btn-ghost sm" href="${esc(c.link[0])}" target="_blank" rel="noopener noreferrer">${esc(c.link[1])}${IC.ext}</a></details>
    <div class="btns"><button class="btn btn-main sm">Save</button><button type="button" class="btn btn-ghost sm" data-act="conn-test" data-name="${c.test}" data-id="${c.id}">Test</button>${has?`<button type="button" class="btn btn-ghost sm" data-act="conn-clear" data-id="${c.id}">Remove</button>`:''}</div>
    <p class="cn-res" id="cn-res-${c.id}" aria-live="polite"></p></form>`;
}
function tabConn(){
  const F=ADM.A.features||S.features||{};
  const chips=[['ai','Pablo’s AI'],['safe','Safe Window'],['publish','Publishing'],['scan','Link databases']].map(([k,l])=>`<span class="st-chip ${F[k]?'ok':''}">${l}: ${F[k]?'on':'off'}</span>`).join('');
  return`<h3>Connections</h3>
    <p class="muted">Pablo’s abilities switch on when you connect these free services. Keys are saved on your own Google Apps Script, never in the website, and are never shown again after saving.</p>
    ${DEMO?'<p class="note ac-warn">Preview: every ability is simulated here so you can try the design. On your live site they switch on only after you save a real key.</p>':''}
    <div class="cn-sum">${chips}</div>${CONN.map(connCard).join('')}`;
}
async function connSave(f,silent){
  const id=f.getAttribute('data-conn'),c=CONN.find(x=>x.id===id);if(!c)return true;
  const fd=Object.fromEntries(new FormData(f)),keys={};
  [c.key,...c.extra.map(x=>x[0])].forEach(k=>{if(String(fd[k]||'').trim())keys[k]=String(fd[k]).trim();});
  if(!Object.keys(keys).length){if(!silent)toast('Nothing new to save');return true;}
  const r=await api('saveKeys',{keys});
  if(r.error){toast(r.error,'bad');return false;}
  ADM.A.keys=r.keys;if(r.features){ADM.A.features=r.features;S.features=r.features;}
  if(!silent)toast(c.name+' saved');
  return true;
}
async function connTest(btn){
  const id=btn.dataset.id,f=$('#f-conn-'+id),res=$('#cn-res-'+id),c=CONN.find(x=>x.id===id);
  res.className='cn-res busy';res.textContent='Testing…';btn.disabled=true;
  try{
    if(!await connSave(f,true)){res.textContent='';res.className='cn-res';return;}
    const r=await api('testKey',{name:btn.dataset.name});
    res.className='cn-res '+(r.ok?'ok':'bad');res.textContent=r.ok?(r.note||'Connected.'):(r.error||'The test failed.');
    const chip=$('.st-chip',f);if(chip&&ADM.A.keys[c.key]){chip.textContent='Connected';chip.classList.add('ok');}
  }finally{btn.disabled=false;}
}
function tabLock(){
  const A=ADM.A;
  return`${A.usingStarterPassword?'<p class="note ac-warn">You are using the starter password. Set your own below before you do anything else.</p>':''}
    <form class="form" id="f-lock"><h3>Lock the whole site</h3>
    <p class="muted">When locked, visitors see only the message below. Your works, details and Pablo are hidden. You can always open Admin and unlock it.</p>
    <label class="swrow"><span>The site is locked right now</span><input type="checkbox" class="swi" name="locked" ${A.locked?'checked':''}><i class="sw"></i></label>
    <label class="fld"><span>Message visitors will see</span><textarea class="in" name="message" rows="3">${esc(A.lockMsg||'')}</textarea></label>
    <div class="btns"><button class="btn btn-main">Save</button></div></form>
    <form class="form" id="f-pw"><h3>Change the admin password</h3>
    <label class="fld"><span>New password (at least 6 characters)</span><input class="in" type="password" name="pw" minlength="6" required autocomplete="new-password"></label>
    <div class="btns"><button class="btn btn-ghost">Change it</button></div></form>`;
}
function sure(b,restore){
  if(b.dataset.sure==='1')return true;
  b.dataset.sure='1';b.classList.add('sure');b.textContent='Sure?';
  setTimeout(()=>{if(b.isConnected){b.dataset.sure='';b.classList.remove('sure');b.innerHTML=restore;}},3000);
  return false;
}
async function moveSite(id,dir){
  const L=ADM.A.sites,i=L.findIndex(s=>s.id===id),j=i+dir;
  if(i<0||j<0||j>=L.length)return;
  const a=L[i],c=L[j];
  await api('saveSite',{site:{...a,order:c.order}});await api('saveSite',{site:{...c,order:a.order}});
  await admReload();
}
async function onAdmClick(e){
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act,id=b.dataset.id;vaultTouch();
  try{
    switch(act){
      case'close':admClose();break;
      case'logout':setToken('');ADM.A=null;vaultLock(true);applyTheme(S.theme);renderAdm();break;
      case'tab':ADM.tab=b.dataset.tab;if(ADM.tab==='design')ADM.theme={...(ADM.A.theme||S.theme)};else applyTheme(S.theme);renderAdmBody();$('#admBody').scrollTop=0;break;
      case'site-edit':ADM.edit=ADM.A.sites.find(s=>s.id===id)||null;renderAdmBody();$('#admBody').scrollTop=0;break;
      case'site-cancel':ADM.edit=null;renderAdmBody();break;
      case'site-del':if(!sure(b,IC.trash))break;await api('deleteSite',{id});toast('Deleted');await admReload();break;
      case'site-up':await moveSite(id,-1);break;
      case'site-down':await moveSite(id,1);break;
      case'v-lock':vaultLock();break;
      case'v-gen':$('#vpass').value=genPw();break;
      case'v-edit':ADM.vault.edit=ADM.vault.items.find(i=>i.id===id)||null;renderAdmBody();$('#admBody').scrollTop=0;break;
      case'v-cancel':ADM.vault.edit=null;renderAdmBody();break;
      case'v-show':ADM.vault.show[id]=!ADM.vault.show[id];refreshVList();break;
      case'v-copy':{const it=ADM.vault.items.find(i=>i.id===id);if(it){await copyText(it[b.dataset.f]||'');toast('Copied');}break;}
      case'v-del':if(!sure(b,IC.trash))break;await api('vaultDelete',{id});await vaultReload();toast('Deleted');renderAdmBody();break;
      case'skin':ADM.theme.name=b.dataset.skin;applyTheme(ADM.theme);renderAdmBody();break;
      case'dz-go':{
        ADM.dz.brief=($('#dzBrief').value||'').trim();
        if(ADM.dz.brief.length<4&&!ADM.dz.img){toast('Describe the look, or add a picture','bad');break;}
        b.disabled=true;const m=$('#dzMsg');m.className='cn-res busy';m.textContent='Designing. This can take up to a minute.';
        const r=await api('designSite',{brief:ADM.dz.brief,image:ADM.dz.img||''});
        b.disabled=false;
        if(r.error||!r.ok){ADM.dz.cls='bad';ADM.dz.msg=r.error||'Could not design that.';renderAdmBody();break;}
        ADM.theme.css=r.css;applyTheme(ADM.theme);ADM.dz.cls='ok';ADM.dz.msg='Done. This is a live preview. Press Save to keep it.';renderAdmBody();break;
      }
      case'dz-clear':ADM.theme.css='';applyTheme(ADM.theme);ADM.dz.msg='Custom look removed. Press Save to keep that.';ADM.dz.cls='';renderAdmBody();break;
      case'accent-reset':ADM.theme.accent='';applyTheme(ADM.theme);renderAdmBody();break;
      case'conn-test':await connTest(b);break;
      case'conn-clear':{
        if(!sure(b,'Remove'))break;
        const c=CONN.find(x=>x.id===id);
        const r=await api('saveKeys',{keys:{},clear:[c.key,...c.extra.map(x=>x[0])]});
        if(r.error)throw new Error(r.error);
        ADM.A.keys=r.keys;if(r.features){ADM.A.features=r.features;S.features=r.features;}
        toast(c.name+' disconnected');renderAdmBody();break;
      }
      case'b-open':{admClose();goTo('studio');await studioLoadBuild(id);break;}
      case'b-del':{
        if(!sure(b,IC.trash))break;
        const r=await api('deleteBuild',{id});if(r&&r.error)throw new Error(r.error);
        if(studio.cur&&studio.cur.id===id){studio.cur=null;studio.shown='';studioRender();}
        toast(r&&r.unpublished?'Deleted and unpublished':'Deleted');await admReload();studioLoadList();break;
      }
    }
  }catch(err){toast(String(err.message||err),'bad');}
}
async function onAdmSubmit(e){
  e.preventDefault();const f=e.target;vaultTouch();
  const fd=Object.fromEntries(new FormData(f)),fid=f.getAttribute('id')||'';
  try{
    if(fid.indexOf('f-conn-')===0){
      const ok=await connSave(f,false);
      if(ok){const sc=$('#admBody').scrollTop;renderAdmBody();$('#admBody').scrollTop=sc;}
      return;
    }
    switch(fid){
      case'f-login':{
        const r=await api('login',{password:fd.pw});
        if(!r.token){toast(r.error||'Could not log in','bad');return;}
        setToken(r.token);
        if(r.usingStarterPassword)toast('You are on the starter password. Change it under Lock.','warn');
        await admLoad();
        if(r.usingStarterPassword)ADM.tab='lock';
        renderAdm();break;
      }
      case'f-site':{
        const max=Math.max(0,...ADM.A.sites.map(s=>Number(s.order)||0));
        const s={id:fd._id||'',name:fd.name.trim(),logo:(fd.logo||'').trim(),link:(fd.link||'').trim(),order:fd._order!==''?fd._order:max+1};
        if(!s.name)return;
        const r=await api('saveSite',{site:s});if(r.error)throw new Error(r.error);
        toast(fd._id?'Saved':'Added');ADM.edit=null;await admReload();break;
      }
      case'f-profile':{
        const r=await api('saveProfile',{profile:fd});if(r.error)throw new Error(r.error);
        toast('Saved');await admReload();break;
      }
      case'f-vunlock':await vaultUnlock(fd.mp);renderAdmBody();break;
      case'f-vitem':{
        const item={title:fd.title.trim(),link:(fd.link||'').trim(),user:fd.user||'',pass:fd.pass||'',note:fd.note||''};
        const payload=await encJ(ADM.vault.key,item);
        const r=await api('vaultSave',{item:{id:fd._id||'',title:'enc',payload}});if(r.error)throw new Error(r.error);
        ADM.vault.edit=null;await vaultReload();toast(fd._id?'Saved':'Added');renderAdmBody();break;
      }
      case'f-design':{
        const r=await api('saveTheme',{theme:ADM.theme});if(r.error)throw new Error(r.error);
        toast('Design saved');await refreshPublic();ADM.A.theme={...ADM.theme};break;
      }
      case'f-lock':{
        const r=await api('setLock',{locked:!!fd.locked,message:fd.message||''});if(r.error)throw new Error(r.error);
        toast(fd.locked?'Site locked':'Site unlocked');await admReload();break;
      }
      case'f-pw':{
        const r=await api('changePassword',{newPassword:fd.pw});if(r.error)throw new Error(r.error);
        toast('Password changed');f.reset();ADM.A.usingStarterPassword=false;renderAdmBody();break;
      }
    }
  }catch(err){toast(String(err.message||err),'bad');}
}
function onAdmInput(e){
  const t=e.target;vaultTouch();
  if(t.id==='dzBrief'){ADM.dz.brief=t.value;return;}
  if(t.id==='vq'){ADM.vq=t.value;refreshVList();}
  else if(t.id==='accent'){ADM.theme.accent=t.value;applyTheme(ADM.theme);}
  else if(t.classList&&t.classList.contains('swi')&&t.closest('#f-design')){ADM.theme[t.name]=t.checked;applyTheme(ADM.theme);}
}

/* ═══════════════ wiring everything together ═══════════════ */
function goTo(id){const e=document.getElementById(id);if(e)e.scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'start'});}
function buildDemoBar(){
  const bar=el(`<div class="demo" role="group" aria-label="Design previews">${SKINS.map(k=>`<button data-skin="${k}">${SKIN_NAME[k]}</button>`).join('')}<button class="rs" data-reset>Reset</button></div>`);
  document.body.appendChild(bar);
  bar.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.reset!==undefined){
      D=SEED();demoSave();vaultLock(true);setToken('');ADM.A=null;studio.cur=null;studio.shown='';studioRender();refreshPublic();toast('Preview data restored');return;
    }
    S.theme={...S.theme,name:b.dataset.skin};if(D){D.theme={...D.theme,name:b.dataset.skin};demoSave();}applyTheme(S.theme);
  });
}
function routeHash(){
  const h=location.hash.slice(1);
  if(h==='admin')admOpen();
  else if(DEMO&&SKINS.includes(h)){S.theme={...S.theme,name:h};applyTheme(S.theme);}
}
function bindUI(){
  glowEl=$('#cglow');ringEl=$('#cring');
  $$('[data-ic]').forEach(n=>{n.innerHTML=IC[n.dataset.ic]||'';});
  const swIc={back:IC.back,fwd:IC.fwd,reload:IC.reload,min:IC.min,max:IC.max,close:IC.x};
  $$('#swin [data-sw]').forEach(b=>{if(swIc[b.dataset.sw])b.innerHTML=swIc[b.dataset.sw];});
  const nav=$('#nav'),menu=$('#menu'),burger=$('#burger');
  menu.innerHTML=$('#links').innerHTML;
  const setMenu=o=>{menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o));burger.setAttribute('aria-label',o?'Close menu':'Open menu');menu.setAttribute('aria-hidden',String(!o));document.body.classList.toggle('no-scroll',o);document.body.classList.toggle('menu-open',o);};
  burger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
  let lastY=0;
  const spy=()=>{let cur='';for(const id of['works','about','pablo','guard','studio','contact']){const e=document.getElementById(id);if(e&&e.getBoundingClientRect().top<innerHeight*.4)cur=id;}$$('.links a').forEach(a=>a.setAttribute('aria-current',String(a.getAttribute('href')==='#'+cur)));};
  addEventListener('scroll',()=>{
    const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
    $('#progress').style.transform=`scaleX(${max>0?(y/max).toFixed(4):0})`;
    nav.classList.toggle('scrolled',y>30);
    if(y>260&&y>lastY+6&&!menu.classList.contains('open'))nav.classList.add('hide');else if(y<lastY-6||y<260)nav.classList.remove('hide');
    lastY=y;spy();
  },{passive:true});
  document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){e.preventDefault();goTo(g.dataset.go);}});
  $$('[data-magnetic]').forEach(b=>{
    b.addEventListener('pointermove',e=>{if(!FINE)return;const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.16}px,${(e.clientY-r.top-r.height/2)*.26}px)`;});
    b.addEventListener('pointerleave',()=>{b.style.transform='';});
  });
  $('#bento').addEventListener('pointermove',e=>{const t=e.target.closest('.tile');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px');});
  const logoWatch=root=>{
    root.addEventListener('load',e=>{if(e.target.tagName==='IMG'&&e.target.closest('.logo'))e.target.closest('.logo').classList.add('ok');},true);
    root.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&e.target.closest('.logo'))e.target.remove();},true);
  };
  logoWatch($('#bento'));logoWatch($('#admin'));
  if(FINE){
    addEventListener('pointermove',e=>{
      if(!cursor.on){cursor.on=true;cursor.gx=cursor.rx=e.clientX;cursor.gy=cursor.ry=e.clientY;document.body.classList.add('has-cur');}
      cursor.tx=e.clientX;cursor.ty=e.clientY;
      ringEl.classList.toggle('big',!!e.target.closest('a,button,input,textarea,label,canvas#orbHero'));
    },{passive:true});
  }
  /* link guard */
  $('#gform').addEventListener('submit',e=>{e.preventDefault();guardSubmit();});
  $('#gStage').addEventListener('click',guardClick);
  const ga=$('#gAuto');ga.checked=gAuto();ga.addEventListener('change',()=>store.set('axjd_gauto',ga.checked?'1':'0'));
  $('#orbHero').addEventListener('click',()=>goTo('pablo'));
  /* owner and admin */
  $('#admBtn').addEventListener('click',admOpen);
  $('#lockAdm').addEventListener('click',admOpen);
  $('#ownChip').addEventListener('click',admOpen);
  $('#ownForm').addEventListener('submit',ownSubmit);
  $('#own').addEventListener('click',e=>{if(e.target.id==='own'||e.target.closest('[data-own=close]'))ownClose(false);});
  const a=$('#admin');
  a.addEventListener('click',onAdmClick);a.addEventListener('submit',onAdmSubmit);a.addEventListener('input',onAdmInput);
  a.addEventListener('change',async e=>{
    const t=e.target;if(t.id!=='dzImg')return;
    const f=t.files&&t.files[0];if(!f)return;
    try{ADM.dz.img=await readImage(f);ADM.dz.name=f.name;$('#dzImgName').textContent=f.name;}catch(er){toast(er.message,'bad');}
  });
  /* safe window */
  $('#swin').addEventListener('click',swClick);swDragInit();
  addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(!$('#own').hidden)ownClose(false);
    else if(!a.hidden)admClose();
    else if(menu.classList.contains('open'))setMenu(false);
  });
  addEventListener('pagehide',()=>{
    if(SW.session&&!DEMO&&API_URL){try{navigator.sendBeacon(API_URL,JSON.stringify({action:'safeClose',token:TOKEN,session_id:SW.session}));}catch(e){}}
  });
  addEventListener('hashchange',routeHash);
  addEventListener('resize',()=>{clearTimeout(bindUI.rt);bindUI.rt=setTimeout(gradientLetters,150);});
  $('#yr').textContent=new Date().getFullYear();
  const tickClock=()=>{$('#clock').textContent=new Date().toLocaleTimeString('en-GB');};tickClock();setInterval(tickClock,1000);
}

/* ═══════════════ start ═══════════════ */
async function init(){
  refreshColors();
  bindUI();buildName();initChat();studioInit();gIdle();setPS('idle');
  fx.init();
  orbH=new LetterOrb($('#orbHero'),{n:innerWidth<600?260:380,interactive:true});
  orbV=new LetterOrb($('#orbVoice'),{n:innerWidth<600?240:320});
  ORBS.push(orbH,orbV);
  requestAnimationFrame(loop);
  if(DEMO)buildDemoBar();
  hydrate(await loadPublic());
  updateOwnerUI();
  routeHash();
  if(document.fonts&&document.fonts.load){
    document.fonts.load('700 40px "Oxanium"').then(()=>{buildAtlas();gradientLetters();}).catch(()=>{});
    document.fonts.ready.then(()=>{gradientLetters();});
  }
}

init();
})();
