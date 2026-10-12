const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(root+'/src/lib/structured-data.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:m.exports,URL,Date});
const {buildPageGraph,buildBlogGraph,serializeSchema,publicUrl}=m.exports;
const find=(g,t)=>g['@graph'].find(n=>n['@type']===t);
const post={slug:'test',title:'Example </script><script>alert(1)</script>',metaDescription:'A real description',publishedAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-10T00:00:00Z',author:{name:'Navleen Kaur',linkedinUrl:'https://www.linkedin.com/in/example',token:'NEVER_PUBLIC'},token:'NEVER_PUBLIC',faqs:[{question:'How?',answer:'Here is how.'}],ogImage:'/og-default.jpg'};
const g=buildBlogGraph(post),a=find(g,'BlogPosting');
assert.equal(a.dateModified,'2026-10-10T00:00:00.000Z');assert.equal(a.datePublished,'2026-10-01T00:00:00.000Z');
assert.equal(g['@graph'].find(n=>n['@id']===a.author['@id']).name,'Navleen Kaur');
assert.equal(find(g,'FAQPage').mainEntity.length,1);assert.equal(find(buildBlogGraph(post,false),'FAQPage'),undefined);
const encoded=serializeSchema(g);assert(!encoded.includes('</script>'));assert(!encoded.includes('NEVER_PUBLIC'));assert.equal(JSON.parse(encoded)['@graph'].find(n=>n['@type']==='BlogPosting').headline,post.title);
assert.equal(a.image,undefined);assert.equal(publicUrl('javascript:alert(1)'),undefined);
assert.equal(find(buildBlogGraph({...post,author:{name:'Gravity Team'}}),'BlogPosting').author['@id'],'https://gravityforai.com/#organization');
assert.equal(buildBlogGraph({...post,author:{name:'Harsimran Singh'}})['@graph'].filter(n=>n['@id']==='https://gravityforai.com/#founder').length,1);
const missing=find(buildBlogGraph({...post,publishedAt:null,updatedAt:null}),'BlogPosting');assert.equal(missing.datePublished,undefined);assert.equal(missing.dateModified,undefined);
const slash=buildBlogGraph({...post,canonicalUrl:'https://gravityforai.com/blog/test/?tracking=1#foo'});assert.equal(find(slash,'WebPage')['@id'],find(slash,'BlogPosting').mainEntityOfPage['@id']);
const service=buildPageGraph({path:'/services/test',title:'Test',nodes:[{'@type':'Service',provider:{name:'Gravity For AI'}}]});assert.equal(find(service,'Service').provider['@id'],'https://gravityforai.com/#organization');assert.equal(find(service,'BreadcrumbList').itemListElement.length,3);
for(const g of [service,buildPageGraph({path:'/',title:'Home'}),buildBlogGraph(post)]) {const ids=g['@graph'].map(n=>n['@id']);assert.equal(new Set(ids).size,ids.length);assert(!g['@graph'].some(n=>n['@type']==='Review'||n['@type']==='AggregateRating'));}
function pages(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(path.join(dir,e.name)):e.name==='page.tsx'?[path.join(dir,e.name)]:[])}
let count=0;for(const p of pages(root+'/src/app')){if(p.includes(path.sep+'admin'+path.sep)||p.includes(path.sep+'samples'+path.sep))continue;assert.match(fs.readFileSync(p,'utf8'),/<(?:PageSchema|JsonLd) /,p);count++}
console.log(`PASS: ${count} public page templates covered; authors, date accuracy, IDs, FAQ visibility, service references, malicious script escaping, private-field exclusion and no invented reviews.`);
