import { Button } from './ui/Button';
import { Trash2 } from 'lucide-react';
import type { HistoryEntry } from '../shared/types';

interface HistoryListProps {
  entries: HistoryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({ entries, selectedId, onSelect, onDelete }: HistoryListProps) {
  if (entries.length === 0) {
    return <p className="p-2 text-sm text-gray-600">No summaries yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-1" role="listbox" aria-label="Summary history">
      {entries.map((entry) => (
        <li
          key={entry.id}
          role="option"
          aria-selected={selectedId === entry.id}
          className={`group flex items-center justify-between gap-2 rounded-md p-2 text-sm transition-colors ${
            selectedId === entry.id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-200'
          }`}
        >
          <button
            onClick={() => onSelect(entry.id)}
            className="flex-1 truncate text-left"
            title={entry.title}
          >
            {entry.title}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
            onPress={() => onDelete(entry.id)}
            aria-label={`Delete ${entry.title}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
