const translations = {
  'ROADSTER DASH / 本地开发台':'ROADSTER DASH / Developer Studio',
  '原版公开前端恢复 · 独立本地存档 · 参数编辑':'Recovered frontend · Local saves · Gameplay tuning',
  '打开纯游戏窗口 ↗':'Open game window ↗',
  '运行状态':'Runtime status','加载中…':'Loading…','距离 / m':'Distance / m',
  '分数':'Score','压缩空气 / L':'Air / L','本地金币':'Local coins',
  '开始游戏':'Play','暂停 / 继续':'Pause / Resume','主菜单':'Main menu',
  '物理参数':'Physics','重力':'Gravity','跳跃高度':'Jump height','最大高度':'Maximum height',
  '空中悬停耗气 / 秒':'Hover air / second','推进加速倍数':'Boost multiplier',
  '应用参数':'Apply changes','恢复原版值':'Restore defaults',
  '应用后立即生效。刷新恢复源码中的设置；长期修改请编辑 src/config/gameplay.js。':'Changes apply immediately. Reload to restore source settings. For permanent changes, edit src/config/gameplay.js.',
  '本地调试':'Local tools','+10,000 测试金币':'+10,000 test coins',
  '导出存档':'Export save','导入存档':'Import save','导出参数':'Export settings',
  '存档只在本机浏览器保存。测试金币与本地排行榜独立于原网站；付款、Google 登录和联网好友不连接原服务。':'Saves stay in this browser. Test coins and local records are independent of the original website. Payments, Google sign-in and online friends do not connect to its services.',
  '操作测试':'Control checks','跳跃':'Jump','悬停 1 秒':'Fly for 1 second','加速 1 秒':'Boost for 1 second',
  '点击游戏画面后，可用方向键、空格、Shift、Z、P 操作。':'Click the game to use arrow keys, Space, Shift, Z and P.',
  '运行错误':'Runtime errors','无':'None','运行玩法回归':'Run gameplay checks',
  '运行增强回归':'Run enhancement checks',
  '原始变量名与恢复名称的对应表：evidence/symbol-map.json。保留的原始部署文件位于 original/。':'Symbol mapping: evidence/symbol-map.json. Original deployment files: original/.',
};
const frame=document.getElementById('game');
const link=document.querySelector('header a');
const toggle=document.createElement('button');
toggle.id='developer-language-toggle';toggle.type='button';toggle.style.marginLeft='12px';
link.before(toggle);
const nodes=[];
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
while(walker.nextNode()) {
  const node=walker.currentNode;
  if(node.parentElement.closest('script,style'))continue;
  const key=node.textContent.replace(/\s+/g,' ').trim();
  if(translations[key])nodes.push({node,original:node.textContent,english:translations[key]});
}
const preference=()=>{
  const explicit=new URLSearchParams(location.search).get('lang');
  if(['en','zh'].includes(explicit))return explicit;
  try {return localStorage.getItem('rdstr.lang')==='en'?'en':'zh';}catch{return 'zh';}
};
let language=preference();
function apply(next,forward=false) {
  language=next==='en'?'en':'zh';
  document.documentElement.lang=language;
  document.title=language==='en'?'Roadster Dash · Developer Studio':'Roadster Dash · 本地开发台';
  for(const item of nodes)item.node.textContent=language==='en'?item.english:item.original;
  toggle.textContent=language==='en'?'中文':'English';
  toggle.setAttribute('aria-label',language==='en'?'Switch developer studio to Chinese':'切换开发台为英文');
  frame.title=language==='en'?'Roadster Dash game':'Roadster Dash 原版游戏画面';
  link.href='/?lang='+language;
  try{localStorage.setItem('rdstr.lang',language);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  if(forward)frame.contentWindow.postMessage({type:'roadster:command',command:'language',payload:language},location.origin);
}
toggle.onclick=()=>apply(language==='en'?'zh':'en',true);
addEventListener('message',event=>{
  if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='roadster:language'&&['en','zh'].includes(event.data.language))apply(event.data.language);
});
frame.src='/?lang='+language;
apply(language);
