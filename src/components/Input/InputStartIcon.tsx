import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from 'shadcn/input';
import { useAtom } from 'jotai';
import searchQueryAtom from 'src/states/search/state';

export default function InputStartIcon() {
  // local state for immediate UI responsiveness, global atom gets updated debounced
  const [value, setValue] = useState('');
  const [, setSearch] = useAtom(searchQueryAtom);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(value);
    }, 300);

    return () => clearTimeout(handle);
  }, [value, setSearch]);

  return (
    <div className="w-full pt-4">
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
          <span className="sr-only">User</span>
        </div>
        <Input
          type="text"
          placeholder="Search by team..."
          value={value}
          onChange={e => setValue((e.target as HTMLInputElement).value)}
          className="peer pl-9 h-14 rounded-[29px]"
          aria-label="Search by team"
        />
      </div>
    </div>
  );
}
