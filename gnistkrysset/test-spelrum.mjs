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
const dirs=["gnistkrysset","el-och-magnetism-krysset"];
for(const [i,dir] of dirs.entries()){
 dom.clear();
 context.document.addEventListener=()=>{};
 const ctx=vm.createContext({document:context.document,window:context.window,localStorage:context.localStorage,requestAnimationFrame:context.requestAnimationFrame,assert});
 vm.runInContext(fs.readFileSync(dir+"/brade.js","utf-8")+fs.readFileSync("gnistkrysset/spelrum.js","utf-8"),ctx);
 vm.runInContext(`
 const entries=board.entries;
 assert.equal(entries.length,PUZZLE_DATA.originalIndex?49:38);
 assert.equal([...tiles.values()].filter(t=>t.entries.length===2).length,board.crossings);
 assert.equal($("clues").children.length,2);
 assert.ok(entries.every(e=>e.h&&e.p));
 select(entries[0],null,false);
 const keys=coords(active), last=keys.at(-1);
 set(last,active.a.at(-1));save();
 loadBoard();
 $("answer").onclick();
 assert.equal(wordInputs.at(-1).value,active.a.at(-1));
 assert.equal(wordInputs[0].value,"");
 wordInputs[0].value="X";
 $("word-cancel").onclick();
 assert.equal(values.get(keys[0]),undefined);
 $("answer").onclick();$("whole").value=active.a;
 $("word-dialog-form").handlers.submit({preventDefault(){}});
 assert.ok(correct(active));assert.equal($("word-dialog").open,false);
 $("hintbox").hidden=true;$("help").onclick();$("more").onclick();
 assert.equal($("hintsteps").children[0].textContent,active.h);
 assert.ok($("hintsteps").children[1].textContent.includes(active.p));
 $("checkall").onclick();assert.match($("status").textContent,/1 ord stämmer/);
 $("next").onclick();assert.equal(active,entries[1]);
 $("prev").onclick();assert.equal(active,entries[0]);
 $("confirm").returnValue="ja";$("confirm").handlers.close();
 assert.equal(values.size,0);
 `,ctx);
}
console.log("Båda spelen: 87 verifierade ledtrådar med sidor, dialogförifyllning, ångra/spara, feedback, navigation och isolerad lagring godkända.");
