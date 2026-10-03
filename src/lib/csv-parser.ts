export interface ParsedProspect { name:string; email:string; company?:string; customSubject?:string; customBody?:string }
export interface ParseResult { prospects:ParsedProspect[]; errors:string[]; hasCustomSubject:boolean; hasCustomBody:boolean }
const emailPattern=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const empty=(message:string):ParseResult=>({prospects:[],errors:[message],hasCustomSubject:false,hasCustomBody:false});
function fromRows(rows:string[][]):ParseResult {
  rows=rows.filter(r=>r.some(c=>c.trim()));
  if(!rows.length)return empty('The file is empty.');
  if(rows[0].length===1&&emailPattern.test(rows[0][0].trim()))rows=[['email'],...rows];
  const keys=rows[0].map(c=>c.replace(/^\uFEFF/,'').trim().toLowerCase().replace(/[\s_-]/g,''));
  const col=(names:string[])=>keys.findIndex(k=>names.includes(k));
  const e=col(['email','emailaddress','mail']),n=col(['name','fullname','firstname']),c=col(['company','companyname','organization','business','org']),s=col(['subject','emailsubject','customsubject','subjectline']),b=col(['body','emailbody','custombody','message','content','html']);
  if(e<0)return empty('Add an email column, or upload one email address per line.');
  const result:ParseResult={prospects:[],errors:[],hasCustomSubject:s>=0,hasCustomBody:b>=0},seen=new Set<string>();
  rows.slice(1).forEach((row,i)=>{
    const get=(index:number)=>index<0?'':String(row[index]||'').trim();
    const email=get(e).toLowerCase();
    if(!emailPattern.test(email)){result.errors.push(`Record ${i+2}: invalid email; skipped.`);return;}
    if(seen.has(email)){result.errors.push(`Record ${i+2}: duplicate email; skipped.`);return;}
    seen.add(email);result.prospects.push({email,name:get(n)||'there',company:get(c)||undefined,customSubject:get(s)||undefined,customBody:get(b)||undefined});
  });
  return result;
}
export function parseCSVText(text:string):ParseResult {
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
  if(quoted)return empty('Unclosed quoted field. Export the file as CSV again.');
  row.push(cell);rows.push(row);return fromRows(rows);
}
export async function parseExcelBuffer(buffer:ArrayBuffer):Promise<ParseResult>{
  const XLSX=await import('xlsx');const workbook=XLSX.read(new Uint8Array(buffer),{type:'array'});
  if(!workbook.SheetNames.length)return empty('Workbook is empty.');
  const rows=XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[workbook.SheetNames[0]],{header:1,defval:'',raw:false});
  return fromRows(rows.map(r=>r.map(c=>String(c))));
}
export async function parseProspectFile(file:File):Promise<ParseResult>{
  if(file.size>5_000_000)return empty('Upload a file smaller than 5 MB.');
  return /\.xlsx?$/i.test(file.name)?parseExcelBuffer(await file.arrayBuffer()):parseCSVText(await file.text());
}
export const parseCSV=parseCSVText;
