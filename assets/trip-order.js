/* Regional stop order for browsing; road navigation stays with Google Maps. */
(()=>{'use strict';
const stages=[
 {key:'north',label:'雙北',counties:['臺北市','新北市'],descending:true},
 {key:'east',label:'宜蘭・臺東',counties:['宜蘭縣','臺東縣'],descending:true},
 {key:'south',label:'屏東・高雄',counties:['屏東縣','高雄市']},
 {key:'southwest',label:'臺南・嘉義',counties:['臺南市','嘉義縣']},
 {key:'central',label:'中部',counties:['雲林縣','南投縣','彰化縣','臺中市']},
 {key:'northwest',label:'新竹・桃園',counties:['新竹縣','桃園市']}
];
const stageFor=r=>stages.find(stage=>stage.counties.includes(r.county));
const isStop=r=>r.locationKind==='point'&&Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&!!stageFor(r);
function base(rows){return rows.filter(isStop).sort((a,b)=>{
 const sa=stageFor(a),sb=stageFor(b),order=stages.indexOf(sa)-stages.indexOf(sb);
 return order||(sa.descending?b.lat-a.lat:a.lat-b.lat)||a.lng-b.lng||a.n-b.n;
})}
function build(rows,startCounty='臺北市',direction='ccw'){
 const canonical=base(rows);if(!canonical.length)return[];
 const anchor=canonical.find(r=>r.county===startCounty)||canonical[0];
 const ordered=direction==='ccw'?[...canonical].reverse():canonical;
 const index=ordered.findIndex(r=>r.id===anchor.id);
 return ordered.slice(index).concat(ordered.slice(0,index));
}
window.MEILING_TRIP=Object.freeze({stages,stageFor,isStop,base,build});
})();
