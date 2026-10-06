export interface ParsedProspect { name:string; email:string; company?:string; customSubject?:string; customBody?:string }
export interface ParseResult { prospects:ParsedProspect[]; errors:string[]; hasCustomSubject:boolean; hasCustomBody:boolean }
const emailPattern=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const empty=(message:string):ParseResult=>({prospects:[],errors:[message],hasCustomSubject:false,hasCustomBody:false});
export type ImportField='email'|'name'|'company'|'subject'|'body';
export type ColumnMapping=Record<ImportField,number>;
export interface ProspectTable { headers:string[]; rows:string[][]; errors:string[] }
const aliases:Record<ImportField,string[]>={
  email:['email','emailaddress','mail','workemail','businessemail','contactemail'],
  name:['name','fullname','firstname','contactname'],
  company:['company','companyname','organization','business','org'],
  subject:['subject','emailsubject','customsubject','subjectline'],
  body:['body','emailbody','custombody','message','emailmessage','personalizedmessage','content','html'],
};
export function suggestColumnMapping(headers:string[]):ColumnMapping {
  const keys=headers.map(c=>c.replace(/^\uFEFF/,'').trim().toLowerCase().replace(/[\s_-]/g,''));
  return Object.fromEntries(Object.entries(aliases).map(([field,names])=>[field,keys.findIndex(k=>names.includes(k))])) as ColumnMapping;
}
function tableFromRows(rows:string[][]):ProspectTable {
  rows=rows.filter(r=>r.some(c=>c.trim()));
  if(!rows.length)return {headers:[],rows:[],errors:['The file is empty.']};
  if(rows[0].length===1&&emailPattern.test(rows[0][0].trim()))rows=[['email'],...rows];
  const width=rows.reduce((max,row)=>Math.max(max,row.length),0);
  return {headers:Array.from({length:width},(_,i)=>(rows[0][i]||'').replace(/^\uFEFF/,'').trim()),rows:rows.slice(1),errors:[]};
}
export function mapProspectTable(table:ProspectTable,mapping:ColumnMapping):ParseResult {
  if(table.errors.length)return empty(table.errors.join(' '));
  if(mapping.email<0)return empty('Choose the column containing email addresses.');
  const indices=Object.values(mapping).filter(i=>i!==-1);
  if(indices.some(i=>!Number.isInteger(i)||i<0||i>=table.headers.length))return empty('Choose valid file columns.');
  if(new Set(indices).size!==indices.length)return empty('Each file column can only be assigned to one field.');
  const result:ParseResult={prospects:[],errors:[],hasCustomSubject:mapping.subject>=0,hasCustomBody:mapping.body>=0},seen=new Set<string>();
  table.rows.forEach((row,i)=>{
    const get=(field:ImportField)=>mapping[field]<0?'':String(row[mapping[field]]||'').trim();
    const email=get('email').toLowerCase();
    if(!emailPattern.test(email)){result.errors.push(`Record ${i+2}: invalid email; skipped.`);return;}
    if(seen.has(email)){result.errors.push(`Record ${i+2}: duplicate email; skipped.`);return;}
    seen.add(email);result.prospects.push({email,name:get('name')||'there',company:get('company')||undefined,customSubject:get('subject')||undefined,customBody:get('body')||undefined});
  });
  return result;
}
export function readCSVTable(text:string):ProspectTable {
  text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const delimiter=text.split('\n')[0].includes('\t')?'\t':',';
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){
      if(quoted&&text[i+1]==='"'){cell+='"';i++;}
      else if(quoted||!cell){quoted=!quoted;}
      else cell+=ch;
    }else if(!quoted&&(ch===delimiter||ch==='\n')){
      row.push(cell);cell='';if(ch==='\n'){rows.push(row);row=[];}
    }else cell+=ch;
  }
  if(quoted)return {headers:[],rows:[],errors:['Unclosed quoted field. Export the file as CSV again.']};
  row.push(cell);rows.push(row);return tableFromRows(rows);
}
export async function readExcelTable(buffer:ArrayBuffer):Promise<ProspectTable>{
  const XLSX=await import('xlsx');const workbook=XLSX.read(new Uint8Array(buffer),{type:'array'});
  if(!workbook.SheetNames.length)return {headers:[],rows:[],errors:['Workbook is empty.']};
  const rows=XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[workbook.SheetNames[0]],{header:1,defval:'',raw:false});
  return tableFromRows(rows.map(r=>r.map(c=>String(c))));
}
export async function readProspectFile(file:File):Promise<ProspectTable>{
  if(file.size>5_000_000)return {headers:[],rows:[],errors:['Upload a file smaller than 5 MB.']};
  return /\.xlsx?$/i.test(file.name)?readExcelTable(await file.arrayBuffer()):readCSVTable(await file.text());
}
export function parseCSVText(text:string):ParseResult {const table=readCSVTable(text);return mapProspectTable(table,suggestColumnMapping(table.headers));}
export async function parseExcelBuffer(buffer:ArrayBuffer):Promise<ParseResult>{const table=await readExcelTable(buffer);return mapProspectTable(table,suggestColumnMapping(table.headers));}
export async function parseProspectFile(file:File):Promise<ParseResult>{const table=await readProspectFile(file);return mapProspectTable(table,suggestColumnMapping(table.headers));}
export const parseCSV=parseCSVText;
