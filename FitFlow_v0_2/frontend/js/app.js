const MONTHS=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
let viewDate=new Date(),selectedKey=null;
const pad=n=>String(n).padStart(2,'0');
const key=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
function records(){return JSON.parse(localStorage.getItem('fitflow_sleep_records')||'{}')}
function saveRecords(r){localStorage.setItem('fitflow_sleep_records',JSON.stringify(r))}
function duration(start,end){
const [sh,sm]=start.split(':').map(Number),[eh,em]=end.split(':').map(Number);
let mins=(eh*60+em)-(sh*60+sm);if(mins<0)mins+=1440;return mins;
}
function quality(hours,gender){
if(gender==='male'){if(hours<6)return'bad';if(hours>=7&&hours<=9)return'good';return'mid'}
if(hours<7)return'bad';if(hours>=8&&hours<=10)return'good';return'mid'
}
function qualityText(q){return q==='good'?'Хороший сон':q==='mid'?'Средний сон':'Недостаточный сон'}
function renderCalendar(){
const y=viewDate.getFullYear(),m=viewDate.getMonth();
const first=(new Date(y,m,1).getDay()+6)%7,total=new Date(y,m+1,0).getDate();
document.getElementById('monthTitle').textContent=`${MONTHS[m]} ${y}`;
const cal=document.getElementById('calendar');cal.innerHTML='';
for(let i=0;i<first;i++){const e=document.createElement('div');e.className='day empty';cal.appendChild(e)}
const r=records(),today=new Date(),todayKey=key(today.getFullYear(),today.getMonth(),today.getDate());
for(let d=1;d<=total;d++){
const k=key(y,m,d),el=document.createElement('button');el.type='button';el.className='day';el.textContent=d;
if(k===todayKey)el.classList.add('today');
if(k===selectedKey)el.classList.add('selected');
if(r[k]){
el.classList.add(r[k].quality);
el.innerHTML=`${d}<span class="status-mark">${r[k].quality==='good'?'✓':r[k].quality==='mid'?'~':'!'}</span>`;
}
el.onclick=()=>selectDay(k);cal.appendChild(el);
}
updateRecommendations();
}
function changeMonth(delta){viewDate.setMonth(viewDate.getMonth()+delta);renderCalendar()}
function selectDay(k){
selectedKey=k;const r=records()[k];
document.getElementById('emptyState').classList.add('hidden');
document.getElementById('dayForm').classList.remove('hidden');
const [y,m,d]=k.split('-').map(Number);
document.getElementById('selectedDate').textContent=`${d} ${MONTHS[m-1]} ${y}`;
document.getElementById('sleepStart').value=r?.start||'';
document.getElementById('sleepEnd').value=r?.end||'';
document.getElementById('gender').value=r?.gender||'male';
renderResult(r);renderCalendar();
}
function renderResult(r){
const box=document.getElementById('sleepResult');
if(!r){box.className='result hidden';box.innerHTML='';return}
box.className=`result ${r.quality}`;
box.innerHTML=`${r.hours.toFixed(1).replace('.',',')} ч — ${qualityText(r.quality)}`;
}
function saveSleep(){
if(!selectedKey)return;
const start=document.getElementById('sleepStart').value,end=document.getElementById('sleepEnd').value,gender=document.getElementById('gender').value;
if(!start||!end){alert('Укажи время сна и пробуждения');return}
const hours=duration(start,end)/60,q=quality(hours,gender),r=records();
r[selectedKey]={start,end,gender,hours,quality:q,updatedAt:new Date().toISOString()};
saveRecords(r);renderResult(r[selectedKey]);renderCalendar();
}
function deleteSleep(){
if(!selectedKey)return;const r=records();if(!r[selectedKey])return;
if(confirm('Удалить запись сна за этот день?')){delete r[selectedKey];saveRecords(r);renderResult(null);renderCalendar()}
}
function updateRecommendations(){
const vals=Object.values(records());
const avg=vals.length?vals.reduce((a,x)=>a+x.hours,0)/vals.length:null;
const bad=vals.slice(-7).filter(x=>x.quality==='bad').length;
let bedtime=bad>=2?'Сегодня постарайся лечь раньше обычного.':'Старайся придерживаться стабильного времени сна.';
document.getElementById('recommendations').innerHTML=
`<div class="rec-item"><div class="rec-label">🌙 На сегодня</div><div class="rec-value">${bedtime}</div></div>
<div class="rec-item"><div class="rec-label">📊 Средний сон</div><div class="rec-value">${avg?avg.toFixed(1).replace('.',',')+' ч':'Пока нет данных'}</div></div>
<div class="rec-item"><div class="rec-label">📅 Записей</div><div class="rec-value">${vals.length}</div></div>`;
}
renderCalendar();
