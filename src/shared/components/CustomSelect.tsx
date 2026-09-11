import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  badge?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  dividerBefore?: boolean;
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
    sm: 'py-1.5 px-3 text-xs rounded-xl font-medium',
    md: 'py-2 px-3.5 text-xs rounded-xl font-medium',
    lg: 'py-2.5 px-4 text-sm rounded-xl font-medium',
  };

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold tracking-wide text-text-secondary mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button - Untitled UI Styled */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 border border-border/80 bg-surface/90 hover:bg-surface hover:border-border text-text-primary shadow-2xs transition-all duration-200 cursor-pointer ${
          sizeClasses[size]
        } ${isOpen ? 'border-primary ring-3 ring-primary/10 bg-surface shadow-xs' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-bg/50' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {prefixIcon && <span className="text-text-secondary shrink-0">{prefixIcon}</span>}
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate font-medium">
              {selectedOption.icon && <span className="shrink-0 text-text-secondary">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="text-text-secondary/60 truncate font-normal">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-secondary stroke-[2.25px] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Popover Menu - Untitled UI Card & Section Style */}
      {isOpen && (
        <div className="absolute right-0 left-0 top-full mt-2 z-[999] max-h-64 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {enableSearch && options.length > 5 && (
            <div className="p-1 border-b border-border/60 mb-1 sticky top-0 bg-surface z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary stroke-[2]" />
                <input
                  type="text"
                  placeholder="Cari opsi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border/80 bg-bg/50 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-center text-text-secondary font-medium">Tidak ada opsi ditemukan</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div key={String(opt.value)}>
                    {opt.dividerBefore && <div className="h-px bg-border/60 my-1" />}
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-primary hover:bg-bg/80 hover:text-text-primary font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        {opt.icon && <span className="shrink-0 text-text-secondary">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </span>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {opt.shortcut && (
                          <span className="text-[10px] tracking-tight font-mono text-text-secondary/70 bg-bg px-1.5 py-0.5 rounded border border-border/60">
                            {opt.shortcut}
                          </span>
                        )}
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[2.5] shrink-0" />}
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
