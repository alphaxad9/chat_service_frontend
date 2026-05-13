import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

const HomeSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      {/* Search Input Bar */}
      <div className="flex items-center rounded-md px-3 py-2 bg-inherit">
        <Search className="w-5 h-5 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          // Don't auto-hide on blur — rely on clickOutside instead
          className="bg-transparent outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown: only show if focused AND query is not empty */}
      {isFocused && query.trim() !== '' && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 p-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Searching for: <span className="font-medium">{query}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;