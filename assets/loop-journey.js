(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('tour');
if(!root)return;
const rows=JSON.parse($('allData').textContent),trip=window.MEILING_TRIP,geography=window.MEILING_GEOGRAPHY;
if(!trip||!geography)throw Error('環島巡覽缺少地圖資料');
const NS='http://www.w3.org/2000/svg',reduced=matchMedia('(prefers-reduced-motion: reduce)');
const T={index:0,playing:!reduced.matches,visible:false,modal:false,elapsed:0,last:null,raf:0,duration:800,start:'臺北市',direction:'ccw',savedOnly:false};
const displayName=r=>r.displayName||r.name;
let saved=new Set(),stops=[],steps=[],points=[],dots=[];
try{
 const stored=localStorage.getItem('meiling_faves_v1')||'[]';
 saved=new Set(JSON.parse(stored));
}catch{}
function project(lng,lat){return{x:75+(lng-119.2)*Math.cos(23.6*Math.PI/180)*143.243,y:42+(25.45-lat)*143.243}}
function path(list){return list.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ')}
$('tourIsland').setAttribute('d',geography.rings.map(ring=>path(ring.map(([lng,lat])=>project(lng,lat)))+' Z').join(' '));
function running(){return T.playing&&T.visible&&!T.modal&&!document.hidden}
function controls(){
 const ended=T.index===steps.length-1,text=T.playing?'暫停':ended?(T.savedOnly?'再看一次':'再繞一圈'):'播放';
 $('tourRuntime').textContent='動畫約 '+Math.ceil(steps.length*T.duration/1000)+' 秒／圈';
 for(const id of ['tourPlay','tourMapToggle']){$(id).textContent=text;$(id).setAttribute('aria-label',T.playing?'暫停環島巡覽':ended?'重新播放環島一圈':'播放環島巡覽');$(id).setAttribute('aria-pressed',String(T.playing))}
 $('tourPrev').disabled=T.index===0;$('tourNext').disabled=ended;root.classList.toggle('is-playing',running());
}
function savedControls(){
 const eligible=rows.filter(r=>trip.isStop(r)&&saved.has(r.id)).length;
 $('tourOnlySaved').disabled=eligible===0;$('tourSavedCount').textContent=String(eligible);
 if(steps.length){const selected=saved.has(steps[T.index].id);$('tourSave').textContent=selected?'♥ 已加入停靠':'♡ 加入停靠';$('tourSave').setAttribute('aria-pressed',String(selected))}
}
function render(announce=false){
 const r=steps[T.index],p=points[T.index],isReturn=T.index===steps.length-1,stage=trip.stageFor(r);
 root.dataset.index=String(T.index);root.dataset.n=String(r.n);root.dataset.stopCount=String(stops.length);root.dataset.returning=String(isReturn);root.dataset.interval=String(T.duration);root.dataset.direction=T.direction;
 const companionNotes={north:'雙北這幾家，想吃或想逛的先收著。',northwest:'桃園、新竹一帶，挑家順路的。',central:'中部的店不少，慢慢選就好。',southwest:'嘉義、臺南，想吃的留點胃口。',south:'到南部了，先看看哪家順路。',east:'東部這段，多留點時間看海。'};
 const companionSrc=isReturn?'assets/meiling-laugh-original.webp':'assets/meiling-guide.webp';
 if($('tourCompanionImage').getAttribute('src')!==companionSrc)$('tourCompanionImage').src=companionSrc;
 $('tourCompanionImage').alt=isReturn?'美玲笑著拍手的原始貼圖':'美玲的旅行導覽人物';
 $('tourCompanionTitle').textContent=isReturn?(T.savedOnly?'哈哈，停靠清單看完了。':'哈哈，這圈看完了。'):'美玲的環島小導航';
 $('tourCompanionText').textContent=isReturn?'接著挑幾家想去的店，把時間留給路上。':companionNotes[stage.key];
 $('featuredName').textContent=isReturn?(T.savedOnly?'想停的店，都看過了。':'回到'+T.start+'，繞完一圈。'):displayName(r);
 $('tourRegion').textContent=isReturn?'回到出發地':r.county+(r.district?' · '+r.district:'');
 $('tourCounter').textContent=isReturn?(T.savedOnly?'清單看完了':'完成一圈'):String(T.index+1).padStart(2,'0')+' / '+stops.length;
 $('tourCategory').textContent=isReturn?'環島停靠清單':r.type;$('tourCategory').className='type-badge '+(isReturn?'living':r.category);
 $('featuredInfo').textContent=!isReturn&&r.phone?'電話 '+r.phone:'';$('featuredInfo').hidden=isReturn||!r.phone;
 $('tourAddress').textContent=isReturn?'挑好想去的店，再把時間留給路上的風景。':r.address;
 $('tourNote').textContent=isReturn?'清單存在這台裝置。出發前先確認各店的營業與預約方式。':r.visitNote||'';$('tourNote').hidden=!$('tourNote').textContent;
 $('featuredMap').href=r.map;$('tourPlaceKind').textContent=isReturn?(T.savedOnly?'停靠清單巡覽完成':'環島一圈完成'):stage.label+'段';
 $('tourRange').value=String(T.index);
 const description=isReturn?'已完成環島，回到'+T.start:`第 ${T.index+1} 家，共 ${stops.length} 家：${r.county}${r.district}，${displayName(r)}`;
 $('tourRange').setAttribute('aria-valuetext',description);$('tourCounty').value=r.county;
 $('tourMarker').style.transform=`translate(${p.x}px,${p.y}px)`;
 const label=isReturn?'回到 '+T.start:r.county+' '+r.district,width=Math.max(122,label.length*17+24),labelX=p.x>340?p.x-width-43:p.x+43;
 $('tourMarkerLabel').setAttribute('transform',`translate(${Math.min(580-width,Math.max(35,labelX))},${Math.max(35,p.y-53)})`);
 $('tourMarkerLabelBox').setAttribute('width',width);$('tourMapLocation').textContent=label;
 $('tourVisited').setAttribute('d',path(points.slice(0,T.index+1)));
 dots.forEach((dot,i)=>{dot.classList.toggle('active',i===(isReturn?0:T.index));dot.classList.toggle('visited',i<T.index)});
 document.querySelectorAll('[data-trip-stage]').forEach(button=>{const active=button.dataset.tripStage===stage.key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
 $('tourDwell').style.transform=`scaleX(${T.elapsed/T.duration})`;if(announce)$('tourAnnounce').textContent=description;savedControls();controls();
}
function rebuild(){
 const eligibleSaved=rows.filter(r=>trip.isStop(r)&&saved.has(r.id));
 if(T.savedOnly&&!eligibleSaved.length){T.savedOnly=false;$('tourOnlySaved').checked=false}
 stops=trip.build(T.savedOnly?eligibleSaved:rows,T.start,T.direction);
 if(!stops.length)throw Error('沒有可巡覽的本島商家');
 T.start=stops[0].county;T.index=0;T.elapsed=0;T.last=null;steps=stops.concat({...stops[0],returnToStart:true});points=steps.map(r=>project(r.lng,r.lat));
 const reference=trip.build(rows,T.start,T.direction).map(r=>project(r.lng,r.lat));
 $('tourRoute').setAttribute('d',path(reference.concat(reference[0])));$('tourDots').replaceChildren();
 dots=stops.map((r,i)=>{const circle=document.createElementNS(NS,'circle');circle.setAttribute('cx',points[i].x);circle.setAttribute('cy',points[i].y);circle.setAttribute('r','3.9');circle.setAttribute('class','tour-dot');circle.dataset.tourIndex=String(i);const title=document.createElementNS(NS,'title');title.textContent=displayName(r)+' · '+r.county+r.district;circle.appendChild(title);$('tourDots').appendChild(circle);return circle});
 $('tourRange').max=String(steps.length-1);
 const counties=[...new Set(stops.map(r=>r.county))];
 for(const id of ['tourStart','tourCounty']){$(id).replaceChildren();for(const county of counties){const option=document.createElement('option');option.value=county;option.textContent=county;$(id).appendChild(option)}}
 $('tourStart').value=T.start;$('tourStages').replaceChildren();
 for(const key of [...new Set(stops.map(r=>trip.stageFor(r).key))]){const stage=trip.stages.find(s=>s.key===key),index=stops.findIndex(r=>trip.stageFor(r).key===key),count=stops.filter(r=>trip.stageFor(r).key===key).length;const button=document.createElement('button');button.type='button';button.dataset.tripStage=key;button.textContent=stage.label+' '+count;button.addEventListener('click',()=>jump(index));$('tourStages').appendChild(button)}
 $('tourRouteSummary').textContent=T.start+'出發 · '+(T.direction==='cw'?'順時針':'逆時針')+' · '+stops.length+' 家可選商家';
 $('tourStartLabel').textContent=T.start;$('tourDirectionLabel').textContent=T.direction==='cw'?'順時針繞一圈':'逆時針繞一圈';$('tourEndLabel').textContent='回到'+T.start;
 window.dispatchEvent(new CustomEvent('meiling:routechange',{detail:{ids:stops.map(r=>r.id),start:T.start,direction:T.direction}}));render();sync();
}
function frame(time){T.raf=0;if(!running()){T.last=null;return}if(T.last!==null)T.elapsed+=Math.min(time-T.last,150);T.last=time;if(T.elapsed>=T.duration){T.elapsed=0;if(T.index===steps.length-1){T.playing=false;T.last=null;controls();$('tourDwell').style.transform='scaleX(1)';return}T.index+=1;render()}$('tourDwell').style.transform=`scaleX(${T.elapsed/T.duration})`;T.raf=requestAnimationFrame(frame)}
function sync(){if(!running()){if(T.raf)cancelAnimationFrame(T.raf);T.raf=0;T.last=null}else if(!T.raf){T.last=null;T.raf=requestAnimationFrame(frame)}controls()}
function jump(index,announce=true){T.playing=false;T.index=Math.max(0,Math.min(steps.length-1,index));T.elapsed=0;T.last=null;render(announce);sync()}
function toggle(){if(!T.playing&&T.index===steps.length-1){T.index=0;T.elapsed=0;render(true)}T.playing=!T.playing;sync()}
for(const id of ['tourPlay','tourMapToggle'])$(id).addEventListener('click',toggle);
$('tourPrev').addEventListener('click',()=>jump(T.index-1));$('tourNext').addEventListener('click',()=>jump(T.index+1));$('tourRange').addEventListener('input',e=>jump(Number(e.target.value)));
$('tourCounty').addEventListener('change',e=>jump(stops.findIndex(r=>r.county===e.target.value)));
$('tourStart').addEventListener('change',e=>{T.start=e.target.value;rebuild()});$('tourDirection').addEventListener('change',e=>{T.direction=e.target.value;rebuild()});
$('tourSpeed').addEventListener('change',e=>{T.duration=Number(e.target.value);T.elapsed=0;root.dataset.interval=String(T.duration);controls()});
$('tourOnlySaved').addEventListener('change',e=>{T.savedOnly=e.target.checked;rebuild()});
$('tourDots').addEventListener('click',e=>{const dot=e.target.closest('[data-tour-index]');if(dot)jump(Number(dot.dataset.tourIndex))});
$('tourDetails').addEventListener('click',()=>{T.playing=false;sync();window.dispatchEvent(new CustomEvent('meiling:details',{detail:{id:steps[T.index].id}}))});
$('tourSave').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('meiling:favorite',{detail:{id:steps[T.index].id}})));
for(const id of ['tourSave','tourDetails','featuredMap','featuredShuffle'])for(const event of ['pointerdown','focus'])$(id).addEventListener(event,()=>{T.playing=false;sync()});
window.addEventListener('meiling:random',()=>{let next=Math.floor(Math.random()*stops.length);if(next===T.index&&stops.length>1)next=(next+1)%stops.length;jump(next)});
window.addEventListener('meiling:favoriteschange',e=>{saved=new Set(e.detail.ids);if(T.savedOnly)rebuild();else savedControls()});
window.addEventListener('meiling:modal',e=>{T.modal=!!e.detail.open;sync()});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{if(reduced.matches){T.playing=false;sync()}});
for(const r of rows.filter(r=>!trip.isStop(r))){const article=document.createElement('article');article.className='trip-extra';const kind=document.createElement('span');kind.className='trip-extra-kind';kind.textContent=r.county==='澎湖縣'?'澎湖加點':'臺中外送';const title=document.createElement('h3');title.textContent=displayName(r);const text=document.createElement('p');text.textContent=r.county==='澎湖縣'?'位在馬公，另行安排離島交通，分開加入行程。':'提供臺中地區外送，先電話詢問訂購，不列入到店停靠。';const button=document.createElement('button');button.type='button';button.className='detail-link';button.textContent='看店家資料';button.addEventListener('click',()=>{T.playing=false;sync();window.dispatchEvent(new CustomEvent('meiling:details',{detail:{id:r.id}}))});article.append(kind,title,text,button);$('tripExtras').appendChild(article)}
rebuild();if('IntersectionObserver'in window)new IntersectionObserver(entries=>{T.visible=entries[0].isIntersecting;sync()},{threshold:.12}).observe(root);else{T.visible=true;sync()}
window.addEventListener('pagehide',()=>{T.visible=false;sync()});
})();
