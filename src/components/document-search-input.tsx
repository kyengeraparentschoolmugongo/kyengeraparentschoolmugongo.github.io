import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DocumentSearchInput({ query, onChange, id }: { query: string; onChange: (value: string) => void; id?: string }) {
  return <div className="dg-search"><Search size={20} aria-hidden="true" /><input id={id} type="search" aria-label="Search for content" placeholder="Search documents…" value={query} onChange={event => onChange(event.target.value)} />{query && <Button variant="source" size="source" className="dg-icon" aria-label="Clear search" title="Clear search" onClick={() => onChange('')}><X size={18} /></Button>}</div>;
}