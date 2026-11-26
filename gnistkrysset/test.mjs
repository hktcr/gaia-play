import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
class E{
 constructor(){this.children=[];this.dataset={};this.value="";this.returnValue="";this.scrollLeft=0;this.parentElement={getBoundingClientRect:()=>({left:0,right:700})};this.handlers={};this.classes=new Set();this.classList={toggle:(x,b)=>b?this.classes.add(x):this.classes.delete(x),add:x=>this.classes.add(x),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x))};this.style={setProperty(){}};}
 setAttribute(x,y){this[x]=y;}
 append(...es){this.children.push(...es);}
 replaceChildren(){this.children=[];}
 querySelectorAll(){return this.children.flatMap(e=>e.children).flatMap(e=>e.children).filter(e=>e.dataset.word);}
 addEventListener(k,f){this.handlers[k]=f;}
 getBoundingClientRect(){return {left:5,right:30,top:0,bottom:50};}
 focus(){this.focused=true;}
 select(){}
 scrollIntoView(){}
 showModal(){this.open=true;}
}
const dom=new Map(), store=new Map();
const context=vm.createContext({document:{getElementById:id=>{if(!dom.has(id))dom.set(id,new E());return dom.get(id);},createElement:()=>new E()},window:{innerHeight:800},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},requestAnimationFrame:f=>f(),assert});
const script=fs.readFileSync(new URL("./kryss.js",import.meta.url),"utf-8");
vm.runInContext(script,context);
vm.runInContext(`
assert.equal(BOARDS.length,2);
for(const [i,p] of BOARDS.entries()){
 loadBoard(i);
 assert.equal(p.entries.length,i===0?12:10);
 for(const e of p.entries){
  const k=coords(e);
  k.forEach((v,j)=>{assert.equal(tiles.get(v).answer,e.a[j]);assert.ok(tiles.get(v).entries.length<=2);});
  assert.ok(k.some(v=>tiles.get(v).entries.length===2),"Varje ord ska korsa ett annat");
 }
 let got=new Set([p.entries[0]]);
 for(let j=0;j<p.entries.length;j++) for(const e of got) for(const k of coords(e)) for(const n of tiles.get(k).entries)got.add(n);
 assert.equal(got.size,p.entries.length,"Sammanhängande rutnät");
 select(p.entries[0],null,false);
 $("check").onclick(); assert.match($("status").textContent,/alla rutor/);
 const first=coords(active)[0]; $("spark").onclick(); assert.equal(values.get(first),active.a[0]);
 loadBoard(i); assert.equal(values.get(first),tiles.get(first).answer);
 select(p.entries[0],null,false);
 write(first,Array(active.a.length).fill("X")); $("check").onclick(); assert.match($("status").textContent,/ändras/);
 write(first,glyphs(active.a.toLowerCase())); $("check").onclick(); assert.ok(correct(active));
 for(const e of p.entries){select(e,null,false);write(coords(e)[0],glyphs(e.a));}
 assert.equal($("meter").value,p.entries.length); assert.match($("status").textContent,/löst hela/);
 $("reset").onclick();assert.equal($("confirm").open,true); $("confirm").returnValue="nej";$("confirm").handlers.close();assert.notEqual(values.size,0);
 $("confirm").returnValue="ja";$("confirm").handlers.close();assert.equal(values.size,0);
}
assert.equal(glyphs("ström-åäö").join(""),"STRÖMÅÄÖ");
`,context);
console.log("2 bräden och 22 ord: geometri, hjälp, rättning, svensk inmatning, separat lagring, slutförande och återställning godkända.");
