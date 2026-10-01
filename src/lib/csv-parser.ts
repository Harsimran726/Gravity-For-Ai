// Pure utility — runs on both client and server, NOT a server action
// Moved out of outreach-actions.ts to avoid 'use server' restriction

export interface ParsedProspect {
  name: string;
  email: string;
  company?: string;
}

export function parseCSV(csvText: string): { prospects: ParsedProspect[]; errors: string[] } {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) {
    return { prospects: [], errors: ['CSV must have a header row and at least one data row.'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ''));

  const nameIdx = headers.findIndex((h) =>
    ['name', 'full_name', 'fullname', 'first_name', 'firstname'].includes(h)
  );
  const emailIdx = headers.findIndex((h) =>
    ['email', 'email_address', 'emailaddress', 'mail'].includes(h)
  );
  const companyIdx = headers.findIndex((h) =>
    ['company', 'company_name', 'companyname', 'organization', 'business'].includes(h)
  );

  if (emailIdx === -1) {
    return { prospects: [], errors: ['CSV must have an "email" column.'] };
  }

  const prospects: ParsedProspect[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted CSV fields
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    const email = cols[emailIdx]?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${i + 1}: Invalid or missing email "${email}"`);
      continue;
    }
    if (seenEmails.has(email)) {
      errors.push(`Row ${i + 1}: Duplicate email "${email}" — skipped.`);
      continue;
    }
    seenEmails.add(email);

    prospects.push({
      name: (nameIdx >= 0 ? cols[nameIdx] : '') || email.split('@')[0],
      email,
      company: companyIdx >= 0 ? cols[companyIdx] || undefined : undefined,
    });
  }

  return { prospects, errors };
}
