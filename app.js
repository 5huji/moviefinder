import {discoverParams,mediaResults,ratings,tmdb,omdb} from './core.js';
const $=s=>document.querySelector(s);
const labels={war:'战争',scifi:'科幻',action:'动作',top:'最高评分',american:'美剧',british:'英剧'};
let state={category:'top',type:'movie',query:'',page:0,total:0},listController,detailController;
let seen=new Set();
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function title(x){return x.title||x.name||x.original_title||x.original_name||'未命名作品';}
function year(x){return (x.release_date||x.first_air_date||'').slice(0,4)||'年份暂无';}
function score(x){return x.vote_count>0?`${Number(x.vote_average).toFixed(1)} / 10`:'暂无';}
function poster(path,name){const box=el('div','poster');const fallback=el('span','', '暂无海报');box.append(fallback);if(path){const img=el('img');img.src=`https://image.tmdb.org/t/p/w500${path}`;img.alt=name;img.loading='lazy';img.addEventListener('error',()=>img.remove());box.append(img);}return box;}
function message(text,retry){$('#status').replaceChildren(el('span','',text));if(retry){const b=el('button','secondary','重试');b.onclick=()=>load(state.page===0);$('#status').append(b);}}
function updateControls(){
 for(const b of $('#categories').children)b.setAttribute('aria-pressed',String(!state.query&&b.dataset.category===state.category));
 for(const b of $('#types').children)b.setAttribute('aria-pressed',String(b.dataset.type===state.type));
 $('#types').hidden=!!state.query||['american','british'].includes(state.category);
 $('#list-title').textContent=state.query?`“${state.query}” 的搜索结果`:labels[state.category];
 $('#list-kicker').textContent=state.query?'SEARCH RESULTS':state.type==='movie'?'THE BEST OF CINEMA':'THE BEST OF TELEVISION';
 $('#list-note').textContent=state.query?'电影与剧集 · 按搜索相关度排列':`TMDB 评分从高到低 · 至少 ${state.type==='movie'?500:200} 人评分${['american','british'].includes(state.category)?' · 英语剧集，按制作地区筛选':''}`;
}
async function load(reset=true){
 listController?.abort();const controller=new AbortController();listController=controller;
 if(reset){state.page=0;state.total=0;seen=new Set();$('#grid').replaceChildren();}
 updateControls();$('#more').disabled=true;message('正在寻找好故事…');
 const page=state.page+1;
 try{
  const data=state.query?await tmdb('search/multi',{query:state.query,page,include_adult:false},AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])):await tmdb(`discover/${state.type}`,discoverParams(state.category,state.type,page),AbortSignal.any([controller.signal,AbortSignal.timeout(15000)]));
  if(controller.signal.aborted)return;
  const items=state.query?mediaResults(data.results||[]):(data.results||[]).map(x=>({...x,media_type:state.type}));
  for(const item of items){const key=`${item.media_type}/${item.id}`;if(seen.has(key))continue;seen.add(key);const card=el('button','card');card.type='button';card.setAttribute('aria-label',`查看 ${title(item)} 详情`);const p=poster(item.poster_path,title(item));p.append(el('div','score',item.vote_count>0?`★ ${Number(item.vote_average).toFixed(1)}`:'暂无评分'));card.append(p,el('h3','',title(item)),el('p','card-meta',`${year(item)} · ${item.media_type==='tv'?'剧集':'电影'}`));card.onclick=()=>openDetail(item);$('#grid').append(card);}
  state.page=page;state.total=Math.min(data.total_pages||0,500);
  message(seen.size?'':state.page<state.total?'本页暂无影视结果，请加载更多。':'未找到影视作品，试试中文或英文原名。');
  $('#more').hidden=state.page>=state.total;
 }catch(e){if(controller.signal.aborted)return;message(e.name==='TimeoutError'?'连接超时，请检查网络后重试。':e.message.includes('接口')?e.message:'无法连接影视数据服务，请检查网络后重试。',true);$('#more').hidden=true;}
 finally{if(listController===controller)$('#more').disabled=false;}
}
$('#search').addEventListener('submit',e=>{e.preventDefault();state.query=$('#query').value.trim();load();});
$('#categories').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.category=b.dataset.category;state.query='';$('#query').value='';if(['american','british'].includes(state.category))state.type='tv';load();});
$('#types').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.type=b.dataset.type;load();});
$('#more').onclick=()=>load(false);
const dialog=$('#detail');
$('#close-detail').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>detailController?.abort());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
async function openDetail(item){
 detailController?.abort();const controller=new AbortController();detailController=controller;
 const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(20000)]);
 const content=$('#detail-content');content.replaceChildren(el('h2','','正在加载详情…'));content.firstChild.id='detail-title';if(!dialog.open)dialog.showModal();
 try{
  let d=await tmdb(`${item.media_type}/${item.id}`,{append_to_response:'external_ids'},signal);
  if(!d.overview){try{const en=await tmdb(`${item.media_type}/${item.id}`,{language:'en-US'},signal);d={...d,overview:en.overview};}catch(e){if(controller.signal.aborted)return;}}
  if(controller.signal.aborted)return;
  const layout=el('div','detail-layout');layout.append(poster(d.poster_path,title(d)));
  const head=el('div');head.append(el('p','eyebrow',item.media_type==='tv'?'TV SERIES':'MOVIE'));const h=el('h2','',title(d));h.id='detail-title';head.append(h,el('p','original-name',d.original_title||d.original_name||''));
  const countries=d.production_countries?.map(x=>x.name).join(' / ')||d.origin_country?.join(' / ')||'地区暂无';
  head.append(el('p','muted',`${year(d)} · ${countries}`),el('p','muted',(d.genres||[]).map(x=>x.name).join(' / ')||'类型暂无'));
  const body=el('div','detail-body');body.append(el('p','synopsis',d.overview||'暂无剧情简介。'));
  const scores=el('div','ratings');const values={};
  for(const [key,label,value] of [['tmdb','TMDB',score(d)],['imdb','IMDb','暂无'],['rotten','烂番茄','暂无'],['douban','豆瓣','暂无']]){const cell=el('div','rating');values[key]=el('strong','',value);cell.append(el('small','',label),values[key]);scores.append(cell);}
  body.append(scores);const status=el('p','rating-status');body.append(status);
  const link=el('a','detail-links','前往豆瓣搜索 ↗');link.href=`https://www.douban.com/search?q=${encodeURIComponent(title(d))}`;link.target='_blank';link.rel='noopener noreferrer';body.append(link);
  head.append(body);layout.append(head);content.replaceChildren(layout);
  const id=d.imdb_id||d.external_ids?.imdb_id;
  if(!id){status.textContent='该作品暂无 IMDb 标识，无法查询补充评分。';return;}
  status.textContent='正在查询 IMDb 与烂番茄评分…';
  try{const extra=ratings(await omdb(id,signal));if(controller.signal.aborted)return;values.imdb.textContent=extra.imdb;values.rotten.textContent=extra.rotten;status.textContent='未收录的评分显示“暂无”；各平台评分口径不同。';}
  catch(e){if(!controller.signal.aborted)status.textContent='补充评分暂不可用；TMDB 信息仍可正常查看。';}
 }catch(e){if(controller.signal.aborted)return;content.replaceChildren(el('h2','','详情加载失败'),el('p','muted','请检查网络后重试。'));content.firstChild.id='detail-title';const b=el('button','secondary','重试');b.onclick=()=>openDetail(item);content.append(b);}
}
load();
