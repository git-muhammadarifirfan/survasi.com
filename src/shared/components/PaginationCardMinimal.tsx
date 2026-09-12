import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationCardProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  align?: 'left' | 'center' | 'right';
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export default function PaginationCardMinimal({
  currentPage,
  totalPages,
  onPageChange,
  align = 'center',
  totalItems,
  itemsPerPage,
  className = '',
}: PaginationCardProps) {
  if (totalPages <= 1) return null;

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white/90 border border-slate-200/80 rounded-2xl shadow-xs ${className}`}>
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900 font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</strong> to{' '}
          <strong className="text-slate-900 font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{' '}
          <strong className="text-slate-900 font-semibold">{totalItems}</strong> entries
        </div>
      )}

      <div className={`flex items-center gap-1.5 ${alignClasses} flex-1`}>
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.25]" />
        </button>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((num, idx) => {
            if (num === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-bold">
                  ...
                </span>
              );
            }

            const isCurrent = num === currentPage;

            return (
              <button
                key={`page-${num}`}
                type="button"
                onClick={() => onPageChange(num as number)}
                className={`min-w-8 h-8 px-2.5 flex items-center justify-center text-xs rounded-xl font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.25]" />
        </button>
      </div>
    </div>
  );
}
