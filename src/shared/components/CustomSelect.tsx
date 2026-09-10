import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  prefixIcon?: React.ReactNode;
  enableSearch?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  disabled = false,
  className = '',
  buttonClassName = '',
  label,
  size = 'md',
  prefixIcon,
  enableSearch = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = enableSearch && search
    ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs rounded-lg',
    md: 'py-2 px-3.5 text-xs rounded-xl',
    lg: 'py-2.5 px-4 text-sm rounded-xl',
  };

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 border border-border bg-bg/80 hover:bg-surface focus:bg-surface text-text-primary shadow-xs transition-smooth cursor-pointer ${
          sizeClasses[size]
        } ${isOpen ? 'border-primary/50 ring-2 ring-primary/10 bg-surface' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-border/20' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {prefixIcon && <span className="text-text-secondary shrink-0">{prefixIcon}</span>}
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate font-medium">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="text-text-secondary/70 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 left-0 top-full mt-1.5 z-[99] max-h-60 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-xl animate-scale-in text-xs">
          {enableSearch && options.length > 5 && (
            <div className="p-1.5 border-b border-border mb-1 sticky top-0 bg-surface z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-bg text-text-primary focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-text-secondary">Tidak ada opsi</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-smooth cursor-pointer text-left ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-text-primary hover:bg-bg'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
