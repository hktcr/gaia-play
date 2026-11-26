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
const dirs=["gnistkrysset","el-och-magnetism-krysset"];
for(const [i,dir] of dirs.entries()){
 dom.clear();
 assert.ok(fs.readFileSync(dir+"/index.html","utf-8").includes("brade.js"));
 const ctx=vm.createContext({document:context.document,window:context.window,localStorage:context.localStorage,requestAnimationFrame:context.requestAnimationFrame,assert});
 vm.runInContext(fs.readFileSync(dir+"/brade.js","utf-8")+fs.readFileSync("gnistkrysset/engine.js","utf-8"),ctx);
 vm.runInContext("\n{ const i=PUZZLE_DATA.originalIndex,p=PUZZLE;\n loadBoard(i);\n assert.equal(p.entries.length,i===0?38:49);\n for(const e of p.entries){\n  const k=coords(e);\n  k.forEach((v,j)=>{assert.equal(tiles.get(v).answer,e.a[j]);assert.ok(tiles.get(v).entries.length<=2);});\n  assert.ok(k.some(v=>tiles.get(v).entries.length===2),\"Varje ord ska korsa ett annat\");\n }\n let got=new Set([p.entries[0]]);\n for(let j=0;j<p.entries.length;j++) for(const e of got) for(const k of coords(e)) for(const n of tiles.get(k).entries)got.add(n);\n assert.equal(got.size,p.entries.length,\"Sammanhängande rutnät\");\n assert.equal([...tiles.values()].filter(t=>t.entries.length===2).length,p.crossings);\n for(const e of p.entries){const k=coords(e);assert.ok(!tiles.has(key(e.x-(e.d===\"h\"?1:0),e.y-(e.d===\"v\"?1:0))));assert.ok(!tiles.has(key(e.x+(e.d===\"h\"?k.length:0),e.y+(e.d===\"v\"?k.length:0))));}\n select(p.entries[0],null,false);$(\"whole\").value=p.entries[0].a;$(\"wordform\").handlers.submit({preventDefault(){}});assert.ok(correct(active));values.clear();save();loadBoard(i);\n select(p.entries[0],null,false);\n $(\"check\").onclick(); assert.match($(\"status\").textContent,/alla rutor/);\n const first=coords(active)[0]; $(\"spark\").onclick(); assert.equal(values.get(first),active.a[0]);\n loadBoard(i); assert.equal(values.get(first),tiles.get(first).answer);\n select(p.entries[0],null,false);\n write(first,Array(active.a.length).fill(\"X\")); $(\"check\").onclick(); assert.match($(\"status\").textContent,/ändras/);\n write(first,glyphs(active.a.toLowerCase())); $(\"check\").onclick(); assert.ok(correct(active));\n for(const e of p.entries){select(e,null,false);write(coords(e)[0],glyphs(e.a));}\n assert.equal($(\"meter\").value,p.entries.length); assert.match($(\"status\").textContent,/löst hela/);\n $(\"reset\").onclick();assert.equal($(\"confirm\").open,true); $(\"confirm\").returnValue=\"nej\";$(\"confirm\").handlers.close();assert.notEqual(values.size,0);\n $(\"confirm\").returnValue=\"ja\";$(\"confirm\").handlers.close();assert.equal(values.size,0);\n}\nassert.equal(glyphs(\"ström-åäö\").join(\"\"),\"STRÖMÅÄÖ\");\n",ctx);
 assert.ok(store.has("gnistkrysset:v2:"+i));
}
console.log("Båda separata kryssen och tidigare sparnycklar verifierade.");
