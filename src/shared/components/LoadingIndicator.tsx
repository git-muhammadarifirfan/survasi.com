interface LoadingIndicatorProps {
  type?: 'line-simple' | 'line-spinner' | 'dot-circle';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  color?: string;
}

export function LoadingIndicator({
  type = 'line-spinner',
  size = 'md',
  label,
  className = '',
  color,
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  }[size];

  const isCustomColorStyle = color && (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl'));
  const colorClass = color && !isCustomColorStyle ? color : '';
  const colorStyle = isCustomColorStyle ? { color } : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {type === 'line-spinner' && (
        <svg
          className={`animate-spin ${colorClass || 'text-indigo-600'} ${sizeClasses}`}
          style={colorStyle}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {type === 'line-simple' && (
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
          <div className="w-1/2 h-full bg-indigo-600 rounded-full animate-[shimmer_1.5s_infinite]" style={colorStyle} />
        </div>
      )}

      {type === 'dot-circle' && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" style={colorStyle} />
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" style={colorStyle} />
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={colorStyle} />
        </div>
      )}

      {label && <span className="text-slate-600 font-medium text-xs md:text-sm">{label}</span>}
    </div>
  );
}
