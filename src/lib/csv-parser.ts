/**
 * prospect-parser.ts
 * Parses CSV and Excel (.xlsx / .xls) files into prospect records.
 * Supports per-row custom subject and body columns that override campaign defaults.
 *
 * Supported column names (case-insensitive, spaces/underscores normalised):
 *   email        → email, emailaddress, mail
 *   name         → name, fullname, firstname
 *   company      → company, companyname, organization, business, org
 *   subject      → subject, emailsubject, customsubject, subjectline
 *   body         → body, emailbody, custombody, message, content, html
 */

export interface ParsedProspect {
  name: string;
  email: string;
  company?: string;
  customSubject?: string;
  customBody?: string;
}

export interface ParseResult {
  prospects: ParsedProspect[];
  errors: string[];
  hasCustomSubject: boolean;
  hasCustomBody: boolean;
}

// ─── Column key normaliser ────────────────────────────────────────────────────
function normaliseKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_\-]/g, '');
}

// ─── Column index resolver ────────────────────────────────────────────────────
function findCol(headers: string[], candidates: string[]): number {
  return headers.findIndex((h) => candidates.includes(normaliseKey(h)));
}

// ─── Build prospect from a flat row object (keyed by original header) ─────────
function rowToProspect(
  row: Record<string, string>,
  headerMap: {
    nameKey: string | null;
    emailKey: string | null;
    companyKey: string | null;
    subjectKey: string | null;
    bodyKey: string | null;
  }
): ParsedProspect | null {
  const email = (headerMap.emailKey ? row[headerMap.emailKey] ?? '' : '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  const name =
    (headerMap.nameKey ? row[headerMap.nameKey] ?? '' : '').trim() ||
    email.split('@')[0];

  return {
    name,
    email,
    company: (headerMap.companyKey ? row[headerMap.companyKey] ?? '' : '').trim() || undefined,
    customSubject: (headerMap.subjectKey ? row[headerMap.subjectKey] ?? '' : '').trim() || undefined,
    customBody: (headerMap.bodyKey ? row[headerMap.bodyKey] ?? '' : '').trim() || undefined,
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────
export function parseCSVText(csvText: string): ParseResult {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) {
    return { prospects: [], errors: ['CSV must have a header row and at least one data row.'], hasCustomSubject: false, hasCustomBody: false };
  }

  const rawHeaders = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
  const normHeaders = rawHeaders.map(normaliseKey);

  const emailIdx  = findCol(rawHeaders, ['email', 'emailaddress', 'mail']);
  const nameIdx   = findCol(rawHeaders, ['name', 'fullname', 'firstname', 'full_name', 'first_name']);
  const companyIdx = findCol(rawHeaders, ['company', 'companyname', 'organization', 'business', 'org']);
  const subjectIdx = findCol(rawHeaders, ['subject', 'emailsubject', 'customsubject', 'subjectline']);
  const bodyIdx   = findCol(rawHeaders, ['body', 'emailbody', 'custombody', 'message', 'content', 'html']);

  if (emailIdx === -1) {
    return { prospects: [], errors: ['No "email" column found. Add a column named "email".'], hasCustomSubject: false, hasCustomBody: false };
  }

  const prospects: ParsedProspect[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // RFC 4180-compliant CSV split
    const cols: string[] = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur);
    const trimmed = cols.map((c) => c.replace(/^"|"$/g, '').trim());

    const email = trimmed[emailIdx]?.toLowerCase() ?? '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${i + 1}: Invalid email "${trimmed[emailIdx] ?? ''}"`);
      continue;
    }
    if (seenEmails.has(email)) { errors.push(`Row ${i + 1}: Duplicate "${email}" — skipped.`); continue; }
    seenEmails.add(email);

    prospects.push({
      name: (nameIdx >= 0 ? trimmed[nameIdx] : '') || email.split('@')[0],
      email,
      company: companyIdx >= 0 ? trimmed[companyIdx] || undefined : undefined,
      customSubject: subjectIdx >= 0 ? trimmed[subjectIdx] || undefined : undefined,
      customBody: bodyIdx >= 0 ? trimmed[bodyIdx] || undefined : undefined,
    });
  }

  return {
    prospects,
    errors,
    hasCustomSubject: subjectIdx >= 0,
    hasCustomBody: bodyIdx >= 0,
  };
}

// ─── Excel Parser (browser ArrayBuffer) ──────────────────────────────────────
export async function parseExcelBuffer(buffer: ArrayBuffer): Promise<ParseResult> {
  // Dynamically import xlsx so it only loads when needed
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // sheet_to_json gives us [{colName: value, ...}] rows
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, {
    defval: '',
    raw: false, // always return strings
  });

  if (rows.length === 0) {
    return { prospects: [], errors: ['Excel sheet is empty.'], hasCustomSubject: false, hasCustomBody: false };
  }

  // Get actual header keys from first row
  const rawKeys = Object.keys(rows[0]);

  function findKey(candidates: string[]): string | null {
    return rawKeys.find((k) => candidates.includes(normaliseKey(k))) ?? null;
  }

  const emailKey   = findKey(['email', 'emailaddress', 'mail']);
  const nameKey    = findKey(['name', 'fullname', 'firstname', 'full_name', 'first_name']);
  const companyKey = findKey(['company', 'companyname', 'organization', 'business', 'org']);
  const subjectKey = findKey(['subject', 'emailsubject', 'customsubject', 'subjectline']);
  const bodyKey    = findKey(['body', 'emailbody', 'custombody', 'message', 'content', 'html']);

  if (!emailKey) {
    return { prospects: [], errors: ['No "email" column found in Excel sheet.'], hasCustomSubject: false, hasCustomBody: false };
  }

  const prospects: ParsedProspect[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  rows.forEach((row, idx) => {
    const email = String(row[emailKey] ?? '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${idx + 2}: Invalid email "${row[emailKey] ?? ''}"`);
      return;
    }
    if (seenEmails.has(email)) { errors.push(`Row ${idx + 2}: Duplicate "${email}" — skipped.`); return; }
    seenEmails.add(email);

    const name = nameKey ? String(row[nameKey] ?? '').trim() || email.split('@')[0] : email.split('@')[0];

    prospects.push({
      name,
      email,
      company: companyKey ? String(row[companyKey] ?? '').trim() || undefined : undefined,
      customSubject: subjectKey ? String(row[subjectKey] ?? '').trim() || undefined : undefined,
      customBody: bodyKey ? String(row[bodyKey] ?? '').trim() || undefined : undefined,
    });
  });

  return {
    prospects,
    errors,
    hasCustomSubject: !!subjectKey,
    hasCustomBody: !!bodyKey,
  };
}

// ─── Unified parser — detects file type automatically ─────────────────────────
export async function parseProspectFile(
  file: File
): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls');

  if (isExcel) {
    const buffer = await file.arrayBuffer();
    return parseExcelBuffer(buffer);
  }

  // CSV / TSV / txt
  const text = await file.text();
  return parseCSVText(text);
}

// Keep old export alias for backward compat
export const parseCSV = parseCSVText;
