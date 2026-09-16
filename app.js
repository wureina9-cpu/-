(()=>{'use strict';
const Q=window.FIXED,$=id=>document.getElementById(id),letters='ABCDEFG',screens=['home','modes','quiz','result','wrongs'],KEY='futures48h_web_v1';
let sub=null,queue=[],idx=0,sel=new Set(),answered=false,round={c:0,w:0,t:{}};
const blank=()=>({done:0,correct:0,wrongs:{}});
function load(){try{return JSON.parse(localStorage.getItem(KEY))||blank()}catch(e){return blank()}}
let store=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){} stats()}
function stats(){$('stat-done').textContent=store.done||0;$('stat-acc').textContent=store.done?Math.round(store.correct/store.done*100)+'%':'—';$('stat-wrong').textContent=Object.keys(store.wrongs||{}).length}
function show(n){screens.forEach(x=>$('screen-'+x).classList.add('hide'));$('screen-'+n).classList.remove('hide');scrollTo(0,0)}
function home(){$('footer').classList.add('hide');show('home');stats()}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function gen(kind,n){let text,ans,exp,topic,v,price,unit,lots,open,close,diff,k,s,fut,basis,spot,rate;
 if(kind==='margin'){price=ri(30,100)*100;unit=[5,10,20][ri(0,2)];lots=ri(1,5);rate=[5,8,10,12][ri(0,3)];v=price*unit*lots*rate/100;topic='保证金计算';text=`价格${price}元/吨，${unit}吨/手，买入${lots}手，保证金比例${rate}%。初始保证金是多少？`;ans=v;exp=`${price}×${unit}×${lots}×${rate}%=${v}元。`}
 else if(kind==='long'){open=ri(30,80)*100;diff=ri(1,12)*10;close=open+diff;unit=[5,10,20][ri(0,2)];lots=ri(1,4);v=diff*unit*lots;topic='期货盈亏';text=`以${open}元/吨买入${lots}手，${unit}吨/手，随后${close}元/吨平仓。盈利多少？`;ans=v;exp=`(${close}-${open})×${unit}×${lots}=${v}元。`}
 else if(kind==='short'){open=ri(30,80)*100;diff=ri(1,12)*10;close=open-diff;unit=[5,10,20][ri(0,2)];lots=ri(1,4);v=diff*unit*lots;topic='期货盈亏';text=`以${open}元/吨卖出${lots}手，${unit}吨/手，随后${close}元/吨买入平仓。盈利多少？`;ans=v;exp=`(${open}-${close})×${unit}×${lots}=${v}元。`}
 else if(kind==='basis'){fut=ri(35,80)*100;basis=ri(-15,15)*10;spot=fut+basis;topic='基差';text=`现货${spot}元/吨，期货${fut}元/吨，基差是多少？`;ans=basis;exp=`基差=现货-期货=${basis}元/吨。`}
 else if(kind==='call'){k=ri(30,70)*10;s=k+ri(-12,20)*10;v=Math.max(s-k,0);topic='期权';text=`看涨期权执行价${k}，标的价${s}，内涵价值是多少？`;ans=v;exp=`max(${s}-${k},0)=${v}。`}
 else{k=ri(30,70)*10;s=k+ri(-20,12)*10;v=Math.max(k-s,0);topic='期权';text=`看跌期权执行价${k}，标的价${s}，内涵价值是多少？`;ans=v;exp=`max(${k}-${s},0)=${v}。`}
 let w=[ans*2,ans/2,ans+(ans===0?100:Math.max(10,Math.round(Math.abs(ans)*.25)))].map(x=>Math.round(x*100)/100),all=shuffle([...new Set([ans,...w])]);while(all.length<4)all.push(ans+(all.length+1)*100);
 return{id:'g'+Date.now()+n,subject:'基础知识',type:'single',topic,q:text,options:all.map(x=>String(x)+(topic==='基差'?' 元/吨':' 元')),ans:[all.indexOf(ans)],exp}}
function pool(s){let p=Q.filter(x=>x.subject===s).map(x=>JSON.parse(JSON.stringify(x)));if(s==='基础知识'){let ks=['margin','long','short','basis','call','put'];for(let i=0;i<130;i++)p.push(gen(ks[i%ks.length],i))}return shuffle(p)}
function make(s,n){let p=pool(s),out=[];while(out.length<n){if(!p.length)p=pool(s);out.push(...p.splice(0,Math.min(n-out.length,p.length)))}return out}
function choose(s){sub=s;$('mode-title').textContent=s;show('modes')}
function start(n){queue=make(sub,n);begin()}
function special(){sub='法律法规';let p=Q.filter(x=>['2026新增','2026教材','程序化交易','营销合规'].includes(x.topic));queue=[];for(let i=0;i<4;i++)queue.push(...p.map(x=>JSON.parse(JSON.stringify(x))));queue=shuffle(queue).slice(0,Math.min(30,queue.length));begin()}
function wrongQuestions(){return Object.values(store.wrongs||{}).map(x=>JSON.parse(JSON.stringify(x.q)))}
function wrongReview(){const p=wrongQuestions();if(!p.length){alert('错题本现在是空的，先做一轮40题诊断吧～');home();return}queue=shuffle(p);begin()}
function begin(){idx=0;sel=new Set();answered=false;round={c:0,w:0,t:{}};show('quiz');$('footer').classList.remove('hide');render()}
function render(){answered=false;sel=new Set();const q=queue[idx];$('q-sub').textContent=q.subject;$('q-topic').textContent=q.topic;$('q-index').textContent=(idx+1)+' / '+queue.length;$('progress-bar').style.width=(idx/queue.length*100)+'%';$('q-type').textContent=q.type==='multiple'?'【多选题】可多选':q.type==='judge'?'【判断题】':'【单选题】';$('q-text').textContent=q.q;$('explanation').className='hide';$('submit-btn').classList.remove('hide');$('next-btn').classList.add('hide');const box=$('options');box.innerHTML='';q.options.forEach((o,i)=>{const d=document.createElement('div');d.className='option';d.dataset.option=i;d.innerHTML=`<span class="letter">${letters[i]}</span><span>${esc(o)}</span>`;box.appendChild(d)})}
function pick(i){if(answered)return;const q=queue[idx];if(q.type==='multiple'){sel.has(i)?sel.delete(i):sel.add(i)}else{sel.clear();sel.add(i)}document.querySelectorAll('#options .option').forEach(el=>el.classList.toggle('sel',sel.has(Number(el.dataset.option))))}
function same(a,b){a=[...a].sort((x,y)=>x-y);b=[...b].sort((x,y)=>x-y);return a.length===b.length&&a.every((v,i)=>v===b[i])}
function key(q){return q.id&&String(q.id)[0]!=='g'?q.id:'dyn|'+q.q+'|'+q.options.join('|')}
function submit(){if(!sel.size){alert('先选答案～');return}answered=true;const q=queue[idx],ok=same(sel,q.ans),k=key(q);round[ok?'c':'w']++;round.t[q.topic]=round.t[q.topic]||{c:0,w:0};round.t[q.topic][ok?'c':'w']++;store.done=(store.done||0)+1;if(ok)store.correct=(store.correct||0)+1;if(ok)delete store.wrongs[k];else store.wrongs[k]={q:JSON.parse(JSON.stringify(q)),your:[...sel]};save();document.querySelectorAll('#options .option').forEach(el=>{const i=Number(el.dataset.option);el.classList.remove('sel');if(q.ans.includes(i))el.classList.add('correct');else if(sel.has(i))el.classList.add('wrong')});const e=$('explanation');e.className='explain '+(ok?'good':'bad');e.innerHTML=`<b>${ok?'✅ 答对了':'❌ 已加入错题本'}</b><br>正确答案：${q.ans.map(i=>letters[i]).join('、')}<br>${esc(q.exp)}`;$('submit-btn').classList.add('hide');$('next-btn').classList.remove('hide');$('next-btn').textContent=idx===queue.length-1?'查看结果':'下一题'}
function next(){if(idx<queue.length-1){idx++;render()}else finish()}
function finish(){$('footer').classList.add('hide');show('result');let total=round.c+round.w,a=total?Math.round(round.c/total*100):0;$('result-score').textContent=a+'%';$('result-msg').textContent=a>=75?'状态不错：继续清错题，把正确率稳定住。':a>=60?'已经摸到及格线，建议继续稳定到70%+。':'先补错误最多的3个专题。';$('result-c').textContent=round.c;$('result-w').textContent=round.w;$('result-a').textContent=a+'%';let arr=Object.entries(round.t).map(([k,v])=>[k,v.w,v.c+v.w]).sort((a,b)=>b[1]-a[1]).slice(0,6);$('weak-list').innerHTML=arr.map(([k,w,t])=>`<div class="weak"><span>${esc(k)}</span><b>${w}/${t}错</b></div>`).join('')}
function wrongList(){const items=Object.values(store.wrongs||{}),box=$('wrong-list');box.innerHTML=items.length?items.map((it,i)=>`<div class="wrongrow"><div class="wrongtitle">${i+1}. [${esc(it.q.topic)}] ${esc(it.q.q)}</div><div class="wrongmeta">你上次选：${(it.your||[]).map(n=>letters[n]).join('、')||'—'}　正确：${it.q.ans.map(n=>letters[n]).join('、')}</div></div>`).join(''):'<div class="empty">现在没有错题 🎉</div>';show('wrongs')}
function reset(){if(confirm('确定清空全部答题记录和错题本吗？')){store=blank();save();home()}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function countdown(){let d=new Date('2026-09-19T00:00:00+08:00')-Date.now();$('countdown').textContent=d<=0?'考试日到了：稳住，先拿会的分。':Math.floor(d/36e5)+' 小时 '+Math.floor((d%36e5)/6e4)+' 分钟'}
document.addEventListener('click',e=>{const o=e.target.closest('[data-option]');if(o&&$('options').contains(o)){pick(Number(o.dataset.option));return}const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='choose')choose(b.dataset.subject);else if(a==='start')start(Number(b.dataset.count));else if(a==='special')special();else if(a==='wrong-review')wrongReview();else if(a==='wrong-list')wrongList();else if(a==='home')home();else if(a==='submit')submit();else if(a==='next')next();else if(a==='reset')reset()});
stats();countdown();setInterval(countdown,30000);$('ready-status').textContent='✓ 刷题器已就绪，可以点击科目开始';
})();