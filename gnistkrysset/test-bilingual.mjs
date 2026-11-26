import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
class E{
 constructor(){this.children=[];this.dataset={};this.value="";this.returnValue="";this.scrollLeft=0;this.parentElement={getBoundingClientRect:()=>({left:0,right:700})};this.handlers={};this.classes=new Set();this.classList={toggle:(x,b)=>b?this.classes.add(x):this.classes.delete(x),add:x=>this.classes.add(x),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x))};this.style={setProperty(){}};}
 setAttribute(x,y){this[x]=y;}
 append(...es){this.children.push(...es);}
 replaceChildren(...children){this.children=children;}
 querySelectorAll(){return this.children.flatMap(e=>e.children).flatMap(e=>e.children).filter(e=>e.dataset.word);}
 addEventListener(k,f){this.handlers[k]=f;}
 getBoundingClientRect(){return {left:5,right:30,top:0,bottom:50};}
 focus(){this.focused=true;}
 select(){}
 scrollIntoView(){}
 showModal(){this.open=true;} close(){this.open=false;}
}
const dom=new Map(), store=new Map();
const context=vm.createContext({document:{getElementById:id=>{if(!dom.has(id))dom.set(id,new E());return dom.get(id);},createElement:()=>new E()},window:{innerHeight:800},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},requestAnimationFrame:f=>f(),assert});
for(const [d,isEn] of [["gnistkrysset",false],["spark-crossword",true]]){
 dom.clear();context.document.addEventListener=()=>{};
 const c=vm.createContext({document:context.document,window:context.window,localStorage:context.localStorage,requestAnimationFrame:context.requestAnimationFrame,assert});
 vm.runInContext(fs.readFileSync(d+"/brade.js","utf-8")+fs.readFileSync("gnistkrysset/spelrum-v4.js","utf-8"),c);c.exp=isEn;
 vm.runInContext(`
 assert.equal(english,exp);
 assert.equal(board.entries.length,38);
 assert.equal([...tiles.values()].filter(t=>t.entries.length===2).length,exp?50:45);
 assert.ok(board.entries.every(e=>e.h&&e.p));
 const e=board.entries.find(e=>coords(e).some(k=>tiles.get(k).entries.length===2));
 select(e,null,false);
 write(coords(e)[0],glyphs(e.a));
 assert.equal(coords(e).filter(k=>tiles.get(k).el.classes.has("solved")).length,0);
 $("check").onclick();
 assert.ok(coords(e).every(k=>tiles.get(k).el.classes.has("solved")));
 assert.match($("status").textContent,exp?/Correct/:/stämmer/);
 const crossing=coords(e).find(k=>tiles.get(k).entries.length===2);const other=tiles.get(crossing).entries.find(v=>v!==e);
 select(other,null,false);
 const otherKeys=coords(other);
 for(const k of otherKeys)if(!coords(e).includes(k))set(k,tiles.get(k).answer==="Q"?"X":"Q");
 $("check").onclick();
 assert.ok(coords(e).every(k=>tiles.get(k).el.classes.has("solved")));
 set(crossing,tiles.get(crossing).answer==="Q"?"X":"Q");refreshed();
 assert.ok(coords(e).every(k=>!tiles.get(k).el.classes.has("solved")));
 $("answer").onclick();assert.equal(wordInputs.length,other.a.length);
 $("word-cancel").onclick();
 assert.equal($("word-dialog").open,false);
 `,c);
 assert.ok(store.has(isEn?"gnistkrysset:en:v1":"gnistkrysset:v2:0"));
}
console.log("Swedish and English grids: geometry, verified full-square states, crossings, edits, dialog, and separate storage passed.");
