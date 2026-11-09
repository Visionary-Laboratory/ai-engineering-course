// Full-slide exports are a local source archive; only teaching media is served.
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist/client/materials');
let count=0;
for(const entry of await fs.readdir(root,{withFileTypes:true})){
 if(!entry.isDirectory()||!/^\d+$/.test(entry.name))continue;
 const dir=path.join(root,entry.name);
 for(const name of await fs.readdir(dir)){
  if(/^\d+(?:-thumb)?\.webp$/.test(name)){await fs.unlink(path.join(dir,name));count++;}
 }
}
console.log(`Prepared public assets: ${count} local source-reference images omitted; teaching diagrams and media retained.`);
