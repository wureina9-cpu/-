(()=>{'use strict';
const OLD=window.FIXED||[],HF=window.HARD_FOUNDATION||[],HL=window.HARD_LAW||[];
const $=id=>document.getElementById(id),letters='ABCDEFG',screens=['home','modes','quiz','result','wrongs'],KEY='futures48h_web_v2_hard';
let sub=null,queue=[],idx=0,sel=new Set(),answered=false,round={c:0,w:0,t:{}};
const blank=()=>({done:0,correct:0,wrongs:{}});
function load(){try{return JSON.parse(localStorage.getItem(KEY))||blank()}catch(e){return blank()}}
let store=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}stats()}
function stats(){$('stat-done').textContent=store.done||0;$('stat-acc').textContent=store.done?Math.round(store.correct/store.done*100)+'%':'—';$('stat-wrong').textContent=Object.keys(store.wrongs||{}).length}
function show(n){screens.forEach(x=>$('screen-'+x).classList.add('hide'));$('screen-'+n).classList.remove('hide');scrollTo(0,0)}
function home(){$('footer').classList.add('hide');show('home');stats()}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function numericOptions(ans,alts,suffix=''){let arr=[ans,...alts].map(x=>Math.round(x*100)/100),uniq=[...new Set(arr)];while(uniq.length<4)uniq.push(Math.round((ans+(uniq.length+1)*10)*100)/100);let s=shuffle(uniq.slice(0,4));return{options:s.map(x=>String(x)+suffix),answer:s.indexOf(ans)}}
function gen(kind,n){
 let topic='综合题·计算',text='',exp='',ans=0,p;
 if(kind==='hedgeLong'){
  let s0=ri(36,46)*100,f0=s0+ri(2,8)*10,rise=ri(15,45)*10,s1=s0+rise,f1=f0+rise-ri(-8,8)*10,qty=ri(5,15)*100,gain=(f1-f0)*qty,extra=(s1-s0)*qty;
  ans=Math.round(gain/10000*100)/100;p=numericOptions(ans,[extra/10000,(extra-gain)/10000,(extra+gain)/10000],'万元');
  text=`某采购企业对${qty}吨原料做买入套保。建仓时现货${s0}元/吨、期货${f0}元/吨；结束时现货${s1}元/吨、期货${f1}元/吨。不计费用，期货端盈利约多少？`;
  exp=`买入套保期货盈利=(${f1}-${f0})×${qty}=${Math.round(gain)}元，即${ans}万元。`;
 }else if(kind==='hedgeShort'){
  let s0=ri(28,38)*100,f0=s0+ri(4,10)*10,drop=ri(15,35)*10,s1=s0-drop,f1=f0-drop+ri(-6,6)*10;
  ans=s1+(f0-f1);p=numericOptions(ans,[s1,f0,s0],'元/吨');
  text=`某生产商卖出套保：建仓时现货${s0}、期货${f0}；结束时现货${s1}、期货${f1}（元/吨）。不计费用，其近似有效售价为多少？`;
  exp=`卖出期货盈利=${f0}-${f1}=${f0-f1}元/吨；有效售价=${s1}+${f0-f1}=${ans}元/吨。`;
 }else if(kind==='spread'){
  let near0=ri(45,55)*100,far0=near0+ri(10,20)*10,nearCh=ri(-5,12)*10,farCh=nearCh-ri(2,10)*10,near1=near0+nearCh,far1=far0+farCh;
  ans=(near1-near0)+(far0-far1);p=numericOptions(ans,[Math.abs((far1-near1)-(far0-near0)),near1-near0,far0-far1],'点');
  text=`投资者买入近月${near0}、卖出远月${far0}，平仓时近月${near1}、远月${far1}。每点价值相同，不计费用，组合盈亏为多少点？`;
  exp=`近月多头盈亏=${near1-near0}点；远月空头盈亏=${far0-far1}点；合计=${ans}点。`;
 }else if(kind==='indexHedge'){
  let mv=ri(8,25)*100,beta=[0.8,1,1.2,1.3,1.5][ri(0,4)],price=ri(30,50)*100,mult=[200,300][ri(0,1)];
  ans=Math.round(beta*mv*10000/(price*mult));p=numericOptions(ans,[Math.max(1,Math.round(ans/2)),Math.max(1,Math.round(ans/beta)),Math.max(1,Math.round(ans*beta))],'手');
  text=`股票组合市值${mv}万元，β=${beta}。股指期货${price}点，乘数${mult}元/点。若将组合β近似降至0，应卖出约多少手？`;
  exp=`N≈β×组合市值/(期货价格×乘数)≈${ans}手。`;
 }else if(kind==='option'){
  let k=ri(8,14)*10,prem=ri(3,9),s=k+ri(-3,5)*10,intr=Math.max(s-k,0);ans=intr-prem;p=numericOptions(ans,[intr,prem,-prem],'');
  text=`买入执行价${k}的看涨期权，权利金${prem}。到期标的价格${s}，不计费用，每单位净损益为多少？`;exp=`净损益=max(${s}-${k},0)-${prem}=${ans}。`;
 }else if(kind==='straddle'){
  let k=100,pc=ri(4,8),pp=ri(3,7),s=[ri(72,90),ri(112,135)][ri(0,1)];ans=Math.max(s-k,0)+Math.max(k-s,0)-pc-pp;p=numericOptions(ans,[Math.abs(s-k),pc+pp,ans+pc+pp],'');
  text=`同时买入执行价100的看涨和看跌期权，权利金分别${pc}和${pp}。到期标的价格${s}，组合每单位净损益为多少？`;exp=`跨式净损益=|${s}-100|-(${pc}+${pp})=${ans}。`;
 }else{
  let price=ri(50,90)*100,unit=[5,10,20][ri(0,2)],lots=ri(5,20),ex=[6,8,10][ri(0,2)],add=[2,3,4][ri(0,2)];ans=price*unit*lots*(ex+add)/100/10000;p=numericOptions(ans,[price*unit*lots*ex/100/10000,price*unit*lots*add/100/10000,price*unit*lots/10000],'万元');
  text=`某期货价格${price}元/吨，${unit}吨/手，持仓${lots}手。交易所保证金${ex}%，期货公司加收${add}个百分点。按期货公司标准，占用保证金约多少？`;exp=`合约价值×(${ex}+${add})%=${Math.round(ans*100)/100}万元。`;
 }
 return{id:'g'+Date.now()+n+Math.random(),subject:'基础知识',type:'single',topic,q:text,options:p.options,ans:[p.answer],exp,section:'comprehensive'};
}
function pool(s){
 if(s==='基础知识'){
  let p=HF.map(x=>JSON.parse(JSON.stringify(x))),k=['hedgeLong','hedgeShort','spread','indexHedge','option','straddle','margin'];
  for(let i=0;i<140;i++)p.push(gen(k[i%k.length],i));
  return shuffle(p);
 }
 let hard=HL.map(x=>JSON.parse(JSON.stringify(x))),old=OLD.filter(x=>x.subject==='法律法规').map(x=>JSON.parse(JSON.stringify(x)));
 return shuffle([...hard,...hard.map(x=>JSON.parse(JSON.stringify(x))),...old]);
}
function make(s,n){let p=pool(s),out=[];while(out.length<n){if(!p.length)p=pool(s);out.push(...p.splice(0,Math.min(n-out.length,p.length)))}return out}
function choose(s){sub=s;$('mode-title').textContent=s+' · 高难版';show('modes')}
function start(n){queue=make(sub,n);begin()}
function special(){sub='法律法规';let source=[...HL,...OLD.filter(x=>x.subject==='法律法规')];let p=source.filter(x=>x.topic.includes('2026')||x.topic.includes('程序化')||x.topic.includes('营销'));queue=shuffle(p.map(x=>JSON.parse(JSON.stringify(x)))).slice(0,Math.min(30,p.length));begin()}
function wrongQuestions(){return Object.values(store.wrongs||{}).map(x=>JSON.parse(JSON.stringify(x.q)))}
function wrongReview(){let p=wrongQuestions();if(!p.length){alert('错题本现在是空的，先做一轮40题高难诊断吧～');home();return}queue=shuffle(p);begin()}
function begin(){idx=0;sel=new Set();answered=false;round={c:0,w:0,t:{}};show('quiz');$('footer').classList.remove('hide');render()}
function render(){answered=false;sel=new Set();let q=queue[idx];$('q-sub').textContent=q.subject;$('q-topic').textContent=q.topic;$('q-index').textContent=(idx+1)+' / '+queue.length;$('progress-bar').style.width=(idx/queue.length*100)+'%';let base=q.type==='multiple'?'多选题':q.type==='judge'?'判断题':'单选题';$('q-type').textContent=(q.section==='comprehensive'?'【综合题·'+base+'】':'【'+base+'】')+(q.type==='multiple'?' 可多选':'');$('q-text').textContent=q.q;$('explanation').className='hide';$('submit-btn').classList.remove('hide');$('next-btn').classList.add('hide');let box=$('options');box.innerHTML='';q.options.forEach((o,i)=>{let d=document.createElement('div');d.className='option';d.dataset.option=i;d.innerHTML=`<span class="letter">${letters[i]}</span><span>${esc(o)}</span>`;box.appendChild(d)})}
function pick(i){if(answered)return;let q=queue[idx];if(q.type==='multiple'){sel.has(i)?sel.delete(i):sel.add(i)}else{sel.clear();sel.add(i)}document.querySelectorAll('#options .option').forEach(el=>el.classList.toggle('sel',sel.has(Number(el.dataset.option))))}
function same(a,b){a=[...a].sort((x,y)=>x-y);b=[...b].sort((x,y)=>x-y);return a.length===b.length&&a.every((v,i)=>v===b[i])}
function key(q){return q.id&&String(q.id)[0]!=='g'?q.id:'dyn|'+q.q+'|'+q.options.join('|')}
function submit(){if(!sel.size){alert('先选答案～');return}answered=true;let q=queue[idx],ok=same(sel,q.ans),k=key(q);round[ok?'c':'w']++;round.t[q.topic]=round.t[q.topic]||{c:0,w:0};round.t[q.topic][ok?'c':'w']++;store.done=(store.done||0)+1;if(ok)store.correct=(store.correct||0)+1;if(ok)delete store.wrongs[k];else store.wrongs[k]={q:JSON.parse(JSON.stringify(q)),your:[...sel]};save();document.querySelectorAll('#options .option').forEach(el=>{let i=Number(el.dataset.option);el.classList.remove('sel');if(q.ans.includes(i))el.classList.add('correct');else if(sel.has(i))el.classList.add('wrong')});let e=$('explanation');e.className='explain '+(ok?'good':'bad');e.innerHTML=`<b>${ok?'✅ 答对了':'❌ 已加入错题本'}</b><br>正确答案：${q.ans.map(i=>letters[i]).join('、')}<br>${esc(q.exp)}`;$('submit-btn').classList.add('hide');$('next-btn').classList.remove('hide');$('next-btn').textContent=idx===queue.length-1?'查看结果':'下一题'}
function next(){if(idx<queue.length-1){idx++;render()}else finish()}
function finish(){$('footer').classList.add('hide');show('result');let total=round.c+round.w,a=total?Math.round(round.c/total*100):0;$('result-score').textContent=a+'%';$('result-msg').textContent=a>=80?'高难题能到80%已经很稳：继续清错题。':a>=70?'这个分数不错，重点把错题吃透。':a>=60?'高难版60%不差，但还有几个专题需要补。':'别再刷简单题，先把错得最多的3个专题补透。';$('result-c').textContent=round.c;$('result-w').textContent=round.w;$('result-a').textContent=a+'%';let arr=Object.entries(round.t).map(([k,v])=>[k,v.w,v.c+v.w]).sort((a,b)=>b[1]-a[1]).slice(0,6);$('weak-list').innerHTML=arr.map(([k,w,t])=>`<div class="weak"><span>${esc(k)}</span><b>${w}/${t}错</b></div>`).join('')}
function wrongList(){let items=Object.values(store.wrongs||{}),box=$('wrong-list');box.innerHTML=items.length?items.map((it,i)=>`<div class="wrongrow"><div class="wrongtitle">${i+1}. [${esc(it.q.topic)}] ${esc(it.q.q)}</div><div class="wrongmeta">你上次选：${(it.your||[]).map(n=>letters[n]).join('、')||'—'}　正确：${it.q.ans.map(n=>letters[n]).join('、')}</div></div>`).join(''):'<div class="empty">现在没有错题 🎉</div>';show('wrongs')}
function reset(){if(confirm('确定清空全部答题记录和错题本吗？')){store=blank();save();home()}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function countdown(){let d=new Date('2026-09-19T00:00:00+08:00')-Date.now();$('countdown').textContent=d<=0?'考试日到了：稳住，先拿会的分。':Math.floor(d/36e5)+' 小时 '+Math.floor((d%36e5)/6e4)+' 分钟'}
document.addEventListener('click',e=>{let o=e.target.closest('[data-option]');if(o&&$('options').contains(o)){pick(Number(o.dataset.option));return}let b=e.target.closest('[data-action]');if(!b)return;let a=b.dataset.action;if(a==='choose')choose(b.dataset.subject);else if(a==='start')start(Number(b.dataset.count));else if(a==='special')special();else if(a==='wrong-review')wrongReview();else if(a==='wrong-list')wrongList();else if(a==='home')home();else if(a==='submit')submit();else if(a==='next')next();else if(a==='reset')reset()});
stats();countdown();setInterval(countdown,30000);$('ready-status').textContent='✓ 高难版已就绪：综合题、计算题、场景题已加量';
})();