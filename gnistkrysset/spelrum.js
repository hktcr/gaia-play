
const $=id=>document.getElementById(id);
const glyphs=s=>Array.from(s.toLocaleUpperCase("sv-SE").normalize("NFC").replace(/[^A-ZÅÄÖ]/g,""));
const PUZZLE=PUZZLE_DATA.board;
const KEY="gnistkrysset:v2:"+PUZZLE_DATA.originalIndex;
let board,values=new Map(),tiles=new Map(),active,focusKey=null;
const key=(x,y)=>x+","+y;
const coords=e=>Array.from(e.a,(_,i)=>key(e.x+(e.d==="h"?i:0),e.y+(e.d==="v"?i:0)));
const heading=e=>e.n+" "+(e.d==="h"?"Vågrätt":"Lodrätt");
function save(){try{localStorage.setItem(KEY,JSON.stringify([...values]));}catch{}}
function mark(s){$("status").textContent=s;}
function set(k,v){if(v)values.set(k,v);else values.delete(k);tiles.get(k).input.value=v;}
function focus(k){const q=tiles.get(k);if(!q)return;focusKey=k;q.input.focus({preventScroll:true});const area=$("board").parentElement,rb=area.getBoundingClientRect(),rt=q.input.getBoundingClientRect();if(rt.left<rb.left||rt.right>rb.right)area.scrollLeft+=rt.left-rb.left-30;if(rt.top<rb.top||rt.bottom>rb.bottom)area.scrollTop+=rt.top-rb.top-32;for(const [pos,t] of tiles)t.input.tabIndex=pos===k?0:-1;}
function next(k,delta=1){const s=coords(active);const i=s.indexOf(k);if(s[i+delta])focus(s[i+delta]);}
function select(e,ks,move){active=e;focusKey=ks||coords(e)[0];const s=new Set(coords(e));for(const [k,t] of tiles){t.el.classList.toggle("word",s.has(k));t.input.tabIndex=k===focusKey?0:-1;}for(const a of $("clues").querySelectorAll("button"))a.setAttribute("aria-current",String(a.dataset.word===heading(e)));$("active").textContent=heading(e)+" · "+e.q+" ("+e.a.length+" bokstäver)"; setDirection(e.d); if(!$("hintbox").hidden){resetHelp();}if(move)focus(focusKey);}
const correct=e=>coords(e).every((k,i)=>values.get(k)===e.a[i]);
function refreshed(){const n=board.entries.filter(correct).length;$("count").textContent=n+" av "+board.entries.length+" ord";$("meter").max=board.entries.length;$("meter").value=n;$("spark").disabled=correct(active);if(n===board.entries.length)mark("Kretsen är sluten! Du har löst hela krysset.");}
function write(k,letters){let list=coords(active),at=list.indexOf(k);mark("");for(const [i,c] of letters.entries()){const q=list[at+i];if(!q)break;set(q,c);tiles.get(q).el.classList.remove("wrong","solved");}if(letters.length)focus(list[Math.min(list.length-1,at+letters.length)]);save();refreshed();}
function create(tag,props={},content=""){const el=document.createElement(tag);Object.assign(el,props);el.textContent=content;return el;}
function loadBoard(){
board=PUZZLE;tiles=new Map();values=new Map();
try{for(const [k,v] of JSON.parse(localStorage.getItem(KEY)||"[]"))if(typeof v==="string"&&glyphs(v).length===1)values.set(k,glyphs(v)[0]);}catch{}
$("board").replaceChildren();$("clues").replaceChildren();$("board").style.setProperty("--w",board.w);
for(const e of board.entries)for(const [i,k] of coords(e).entries()){
const t=tiles.get(k)||{entries:[],answer:e.a[i]};t.entries.push(e);if(i===0)t.n=e.n;tiles.set(k,t);}
for(let y=0;y<board.h;y++)for(let x=0;x<board.w;x++){
const k=key(x,y),t=tiles.get(k),el=create("div",{className:"tile"});$("board").append(el);if(!t){el.setAttribute("aria-hidden","true");continue;}t.el=el;
if(t.n)el.append(create("b",{},t.n));const input=create("input",{type:"text",autocomplete:"off",spellcheck:false,value:values.get(k)||""});input.setAttribute("aria-label",t.entries.map(e=>heading(e)+", bokstav "+(coords(e).indexOf(k)+1)).join(" / "));el.append(input);t.input=input;input.tabIndex=-1;
input.addEventListener("click",()=>{const choice=t.entries.includes(active)?(focusKey===k&&t.entries.length===2?t.entries.find(e=>e!==active):active):t.entries[0];select(choice,k,false);input.select();refreshed();});
input.addEventListener("input",ev=>{if(ev.isComposing)return;if(!t.entries.includes(active))select(t.entries[0],k,false);const l=glyphs(input.value);if(ev.inputType==="deleteContentBackward"||ev.inputType==="deleteContentForward"){write(k,[]);set(k,"");save();refreshed();return;}if(!l.length){input.value=values.get(k)||"";return;}write(k,[l.at(-1)]);});
input.addEventListener("paste",ev=>{ev.preventDefault();if(!t.entries.includes(active))select(t.entries[0],k,false);write(k,glyphs(ev.clipboardData.getData("text")));});
input.addEventListener("keydown",ev=>{if(ev.ctrlKey||ev.metaKey||ev.altKey)return;if(!t.entries.includes(active))select(t.entries[0],k,false);const arrows={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};if(ev.key==="Tab"){ev.preventDefault();stepWord(ev.shiftKey?-1:1);}else if(ev.key==="Escape"){ev.preventDefault();$("answer").focus();}else if(ev.key==="Enter"){ev.preventDefault();select(t.entries.find(e=>e!==active)||active,k,false);refreshed();}else if(arrows[ev.key]){ev.preventDefault();const [a,b]=arrows[ev.key],n=key(x+a,y+b),nt=tiles.get(n);if(nt)select(nt.entries.find(e=>e.d===(a?"h":"v"))||nt.entries[0],n,true);refreshed();}else if(ev.key==="Backspace"){ev.preventDefault();if(values.has(k)){set(k,"");tiles.get(k).el.classList.remove("wrong","solved");}else next(k,-1);mark("");save();refreshed();}else if(ev.key.length===1&&glyphs(ev.key).length){ev.preventDefault();write(k,glyphs(ev.key));}});
}
for(const [d,title] of [["h","Vågrätt"],["v","Lodrätt"]]){
const column=create("section",{className:"clue-column"});column.dataset.direction=d;column.append(create("h2",{},title));const ul=create("ul");for(const e of board.entries.filter(e=>e.d===d)){const li=create("li"),bt=create("button");bt.dataset.word=heading(e);bt.append(create("strong",{},e.n),create("span",{},e.q+" ("+e.a.length+")"));bt.onclick=()=>{const s=coords(e),k=s.find(k=>!values.has(k))||s[0];select(e,k,true);const r=$("board").getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)$("active").scrollIntoView({block:"nearest",inline:"nearest"});mark("");refreshed();};li.append(bt);ul.append(li);}column.append(ul);$("clues").append(column);}
select(board.entries[0],null,false);mark("");refreshed();
}
$("check").onclick=()=>{const a=coords(active),n=a.filter(k=>values.has(k)).length;if(n<a.length){mark("Skriv i alla rutor i ordet först.");return;}const good=correct(active);
for(const k of a){const {el}=tiles.get(k);el.classList.toggle("solved",good);el.classList.toggle("wrong",!good);}mark(good?"Ordet stämmer.":"Något i ordet behöver ändras. Läs ledtråden igen.");refreshed();};
$("spark").onclick=()=>{const a=coords(active),k=a.find(k=>!values.has(k))||a.find((k,i)=>values.get(k)!==active.a[i]);if(!k)return;
set(k,tiles.get(k).answer);const el=tiles.get(k).el;el.classList.remove("wrong","spark");requestAnimationFrame(()=>el.classList.add("spark"));focus(k);mark("En hjälpbokstav tändes: "+tiles.get(k).answer+".");save();refreshed();};
$("reset").onclick=()=>{$("confirm").returnValue="";$("confirm").showModal();};$("confirm").addEventListener("close",()=>{if($("confirm").returnValue==="ja"){values.clear();save();loadBoard();mark("Rutorna är tömda.");}});
$("size").addEventListener("input",()=>{$("board").classList.remove("overview");$("board").style.setProperty("--cell",$("size").value+"px");});
$("fit").onclick=()=>{$("board").classList.add("overview");$("board").style.setProperty("--cell","max(6px, min(32px, calc(100cqi / var(--w) - 2px)))");mark("Överblick. Använd reglaget för större rutor.");};

function setDirection(d){$("clues").dataset.direction=d;$("across").setAttribute("aria-pressed",String(d==="h"));$("down").setAttribute("aria-pressed",String(d==="v"));}
$("across").onclick=()=>setDirection("h");$("down").onclick=()=>setDirection("v");
function stepWord(delta){const list=board.entries, i=list.indexOf(active), e=list[(i+list.length+delta)%list.length];select(e,null,true);refreshed();}
$("prev").onclick=()=>stepWord(-1);$("next").onclick=()=>stepWord(1);
function resetHelp(){$("hintsteps").replaceChildren(create("li",{},active.h));$("more").hidden=false;}
$("help").onclick=()=>{const h=$("hintbox");h.hidden=!h.hidden;$("help").setAttribute("aria-expanded",String(!h.hidden));$("help").textContent=h.hidden?"Visa hjälp":"Dölj hjälp";if(!h.hidden)resetHelp();};
$("more").onclick=()=>{$("hintsteps").append(create("li",{},(active.related?"Bakgrund i häftet, s. ":"Ellära och magnetism, s. ")+active.p+"."));$("more").hidden=true;};
let wordInputs=[];
function paintWordInputs(letters,start=0){for(const [i,v] of letters.entries())if(wordInputs[start+i])wordInputs[start+i].value=v;}
function fillFromWhole(){const letters=glyphs($("whole").value);if(letters.length!==wordInputs.length){$("word-error").textContent="Skriv ett ord med "+wordInputs.length+" bokstäver.";return false;}paintWordInputs(letters);$("whole").value="";$("word-error").textContent="Ordet är ifyllt i dialogen. Spara för att föra över det till brädet.";return true;}
$("answer").onclick=()=>{const dialog=$("word-dialog");$("word-title").textContent="Skriv svar · "+heading(active);$("word-question").textContent=active.q;$("word-error").textContent="";$("whole").value="";$("word-cells").replaceChildren();wordInputs=[];
 const ks=coords(active);for(const [i,k] of ks.entries()){
  const f=create("input",{type:"text",autocomplete:"off",spellcheck:false,value:values.get(k)||""});f.setAttribute("aria-label","Bokstav "+(i+1)+" av "+ks.length);if(f.value)f.classList.add("prefilled");
  f.addEventListener("focus",()=>f.select());
  f.addEventListener("input",ev=>{if(ev.isComposing)return;const l=glyphs(f.value);f.value=l.at(-1)||"";f.classList.remove("prefilled");if(l.length)wordInputs[i+1]?.focus();});
  f.addEventListener("keydown",ev=>{if(ev.key==="Backspace"&&!f.value&&i){ev.preventDefault();wordInputs[i-1].focus();}if(ev.key==="ArrowLeft"&&i){ev.preventDefault();wordInputs[i-1].focus();}if(ev.key==="ArrowRight"&&i+1<ks.length){ev.preventDefault();wordInputs[i+1].focus();}});
  f.addEventListener("paste",ev=>{ev.preventDefault();paintWordInputs(glyphs(ev.clipboardData.getData("text")),i);});
  wordInputs.push(f);$("word-cells").append(f);
 }
 dialog.showModal();(wordInputs.find(f=>!f.value)||wordInputs[0]).focus();};
$("word-copy").onclick=fillFromWhole;
$("word-cancel").onclick=()=>$("word-dialog").close();
$("word-dialog-form").addEventListener("submit",ev=>{ev.preventDefault();if($("whole").value&&!fillFromWhole())return;let ks=coords(active);ks.forEach((k,i)=>{set(k,glyphs(wordInputs[i].value)[0]||"");tiles.get(k).el.classList.remove("wrong","solved");});save();$("word-dialog").close();mark("Svar sparat i krysset.");refreshed();});
$("checkall").onclick=()=>{const complete=board.entries.filter(e=>coords(e).every(k=>values.has(k)));const pass=complete.filter(correct).length;mark(pass+" ord stämmer. "+(complete.length-pass)+" ifyllda ord behöver ses över. "+(board.entries.length-complete.length)+" återstår att fylla i.");for(const [k,t] of tiles){const isCorrect=values.get(k)===t.answer;t.el.classList.toggle("solved",values.has(k)&&isCorrect);t.el.classList.toggle("wrong",values.has(k)&&!isCorrect);}refreshed();};
if(document.fullscreenEnabled&&$("play").requestFullscreen){$("full").hidden=false;$("full").onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $("play").requestFullscreen();}catch{mark("Helskärm är inte tillgänglig här.");}};document.addEventListener("fullscreenchange",()=>{$("full").textContent=document.fullscreenElement?"Avsluta helskärm":"Helskärm";});}
loadBoard();
