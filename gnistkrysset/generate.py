import json, random
from collections import defaultdict
D=[(1,0),(0,1)]
def fit(words,seed):
 rng=random.Random(seed); m={}; loc=defaultdict(set); entries=[]
 def add(w,x,y,d):
  dx,dy=D[d]
  for j,z in enumerate(w["a"]):
   c=(x+j*dx,y+j*dy)
   if c in m: m[c][1]|=(1<<d)
   else: m[c]=[z,1<<d];loc[z].add(c)
  entries.append((w,x,y,d))
 left=sorted(words,key=lambda w:-len(w["a"]))
 add(left.pop(rng.randrange(min(5,len(left)))),0,0,0)
 while left:
  best=None; best_score=-1e10
  for wi,w in enumerate(left):
   v=w["a"]; n=len(v)
   for j,z in enumerate(v):
    for cx,cy in loc[z]:
     ds=m[cx,cy][1]
     if ds==3: continue
     d=int(ds==1); dx,dy=D[d]; x,y=cx-j*dx,cy-j*dy
     if (x-dx,y-dy) in m or (x+n*dx,y+n*dy) in m: continue
     crosses=0
     for i,a in enumerate(v):
      xx,yy=x+i*dx,y+i*dy; q=m.get((xx,yy))
      if q is not None:
       if q[0]!=a or q[1]&(1<<d): break
       crosses+=1
      elif (xx+dy,yy+dx) in m or (xx-dy,yy-dx) in m: break
     else:
      score=10*crosses+.32*n-.31*(abs(x+dx*n/2)+abs(y+dy*n/2))+rng.random()*9
      if score>best_score: best_score=score;best=(wi,x,y,d)
  if not best: break
  wi,x,y,d=best; add(left.pop(wi),x,y,d)
 x0,y0=min(x for x,y in m),min(y for x,y in m)
 cols=max(x for x,y in m)-x0+1; rows=max(y for x,y in m)-y0+1; xs=sum(v[1]==3 for v in m.values())
 uniq=sorted(set((x,y) for _,x,y,_ in entries),key=lambda p:(p[1],p[0]))
 result=[dict(w,n=uniq.index((x,y))+1,x=x-x0,y=y-y0,d="hv"[d]) for w,x,y,d in entries]
 result.sort(key=lambda e:(e["n"],e["d"]))
 return (len(result),xs*3-cols*rows/22-abs(cols-rows)*.4),dict(w=cols,h=rows,entries=result,crossings=xs)
ws=json.load(open("largewords.json"));out=[]
for g in ws:
 best=None
 for seed in range(1,185):
  rank,board=fit(g["entries"],seed)
  if best is None or rank>best: best,data=rank,board
 assert len(data["entries"])==len(g["entries"])
 out.append(dict(data,title=g["title"]))
json.dump(out,open("largeboards.json","w"),ensure_ascii=False,separators=(",",":"))
