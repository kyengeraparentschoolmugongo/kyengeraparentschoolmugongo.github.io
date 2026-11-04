import { resourceTitle, type ResourceRecord } from './resources';
import { searchTokens } from './document-search';

const subjects: Record<string, string> = { mathematics: 'Mathematics', science: 'Science', socialstudies: 'Social Studies', english: 'English', literacy: 'Literacy', agriculture: 'Agriculture', entrepreneurship: 'Entrepreneurship', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', geography: 'Geography', history: 'History', religiouseducation: 'Religious Education', christianreligiouseducation: 'Christian Religious Education', islamicreligiouseducation: 'Islamic Religious Education' };
export function documentMetadata(item: ResourceRecord) {
  const text = `${resourceTitle(item)} ${item.description}`;
  const tokens = searchTokens(text);
  const subject = Object.entries(subjects).find(([token]) => tokens.includes(token))?.[1];
  const year = text.match(/\b(19\d{2}|20\d{2})\b/)?.[1];
  const termMatch = text.match(/\bterm\s*(iii|ii|i|[123])\b/i)?.[1]?.toLowerCase();
  const term = termMatch ? `Term ${{ i: '1', ii: '2', iii: '3' }[termMatch] ?? termMatch}` : undefined;
  const level = tokens.find(token => /^[ps][1-7]$/.test(token))?.toUpperCase();
  const kind = tokens.includes('mock') ? 'Mock' : tokens.includes('ple') ? 'PLE' : tokens.includes('scheme') ? 'Scheme of Work' : tokens.includes('endofterm') ? 'End of Term' : tokens.includes('midterm') ? 'Mid Term' : tokens.includes('beginningofterm') ? 'Beginning of Term' : /holiday/i.test(text) ? 'Holiday Package' : undefined;
  return { subject, year, term, level, kind };
}

// Two independent 32-bit hashes keep URL-derived identity browser-safe and stable.
export function documentKey(url: string) {
  let a = 2166136261, b = 5381;
  for (let i = 0; i < url.length; i++) { const c = url.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = Math.imul(b, 33) ^ c; }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}
export function documentSlug(item: ResourceRecord) {
  return `${documentKey(item.pdfUrl)}-${resourceTitle(item).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'document'}`;
}