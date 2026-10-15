import {readCSVTable,tableFromRows,mapProspectTable,suggestColumnMapping,type ProspectTable,type ColumnMapping} from './csv-parser';
export type MessageMapping={subject:number;body:number};
export function suggestMessages(headers:string[],count=4):MessageMapping[]{
 const keys=headers.map(s=>s.toLowerCase().replace(/[\s_-]/g,''));
 const base=suggestColumnMapping(headers);
 return Array.from({length:count},(_,i)=>i===0?{subject:base.subject,body:base.body}:{subject:keys.findIndex(k=>[`followup${i}subject`,`followup${i}subjectline`].includes(k)),body:keys.findIndex(k=>[`followup${i}body`,`followup${i}message`].includes(k))});
}
export function mapSequenceTable(table:ProspectTable,mapping:ColumnMapping,steps:MessageMapping[]){
 const result=mapProspectTable(table,{...mapping,subject:-1,body:-1});
 if(steps.some(s=>[s.subject,s.body].some(i=>!Number.isInteger(i)||i< -1||i>=table.headers.length)))return {...result,prospects:[],errors:['Choose valid subject and message columns.']};
 const firstByEmail=new Map<string,string[]>();for(const row of table.rows){const email=(row[mapping.email]||'').trim().toLowerCase();if(!firstByEmail.has(email))firstByEmail.set(email,row);}
 result.prospects=result.prospects.map(p=>{const row=firstByEmail.get(p.email)!;return {...p,sequenceMessages:steps.map(s=>({subject:s.subject<0?'':(row[s.subject]||'').trim(),body:s.body<0?'':(row[s.body]||'').trim()}))};});return result;
}
export type ImportWorkbook={sheets:{name:string;table:ProspectTable}[];recommended:number;notes:string[]};
// Join the report's vertical sequence sheet to Contacts by its explicit contact ID.
export function flattenReport(contacts:ProspectTable,sequence:ProspectTable):ProspectTable|null {
 const index=(t:ProspectTable,h:string)=>t.headers.findIndex(v=>v.toLowerCase()===h.toLowerCase());
 const ci=index(contacts,'Contact ID'),ei=index(contacts,'Email'),si=index(sequence,'Contact ID'),step=index(sequence,'Step'),sub=index(sequence,'Subject'),body=index(sequence,'Body');
 if([ci,ei,si,step,sub,body].some(i=>i<0))return null;
 const grouped=new Map<string,Map<number,string[]>>();const errors:string[]=[];
 for(const row of sequence.rows){const label=row[step];const n=/^first email$/i.test(label)?0:/^follow-up ([1-7])$/i.test(label)?Number(label.match(/\d+/)![0]):-1;if(n<0)continue;const id=row[si];if(!grouped.has(id))grouped.set(id,new Map());if(grouped.get(id)!.has(n))errors.push(`Duplicate step ${n} for ${id}.`);grouped.get(id)!.set(n,row);}
 const heads=['name','email','company','scope','review_status',...Array.from({length:8},(_,i)=>[i?`followup_${i}_subject`:'subject',i?`followup_${i}_body`:'body']).flat()];
 return {headers:heads,errors,rows:contacts.rows.map(r=>[r[index(contacts,'Name')]||'',r[ei]||'',r[index(contacts,'Company')]||'',r[index(contacts,'Scope')]||'',r[index(contacts,'First contact')]||'',...Array.from({length:8},(_,i)=>{const m=grouped.get(r[ci])?.get(i);return [m?.[sub]||'',m?.[body]||''];}).flat()])};
}
export async function readOutreachWorkbook(file:File):Promise<ImportWorkbook>{
 if(file.size>5_000_000)throw Error('Upload a file smaller than 5 MB.');
 if(!/\.(csv|tsv|txt|xlsx|xls)$/i.test(file.name))throw Error('Use CSV, TSV or Excel.');
 if(!/\.xlsx?$/i.test(file.name))return {sheets:[{name:'CSV',table:readCSVTable(await file.text())}],recommended:0,notes:[]};
 const XLSX=await import('xlsx');const wb=XLSX.read(new Uint8Array(await file.arrayBuffer()),{type:'array'});
 const sheets=wb.SheetNames.map(name=>({name,table:tableFromRows(XLSX.utils.sheet_to_json<string[]>(wb.Sheets[name],{header:1,defval:'',raw:false}).map(r=>r.map(String)))}));
 const c=sheets.find(s=>s.name==='Contacts'),s=sheets.find(s=>s.name==='Email sequences');let recommended=Math.max(0,sheets.findIndex(s=>suggestColumnMapping(s.table.headers).email>=0));const notes:string[]=[];
 if(c&&s){const joined=flattenReport(c.table,s.table);if(joined){sheets.unshift({name:'Contacts + Email sequences (joined)',table:joined});recommended=0;notes.push('Joined the report by Contact ID. Scope and contact-wave filters are available below. No messages are sent by importing.');}}
 return {sheets,recommended,notes};
}
