import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary' | 'purple';
  icon?: React.ElementType;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: CustomIcon,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
      Icon: Trash2,
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
      Icon: AlertTriangle,
    },
    info: {
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
      Icon: AlertTriangle,
    },
    primary: {
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
      Icon: AlertTriangle,
    },
    purple: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      Icon: AlertTriangle,
    },
  }[variant];

  const IconComp = CustomIcon || variantStyles.Icon;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${variantStyles.iconBg}`}>
          <IconComp className="w-6 h-6 stroke-[2]" />
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 font-display leading-tight">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${variantStyles.buttonBg} disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
