import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Mic,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface PeripheralsWarningModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  onCancel?: () => void;
}

const STORAGE_KEY = 'qtr_peripherals_ack_v1';

export function isPeripheralsAcknowledged(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'acknowledged';
  } catch {
    return false;
  }
}

export function setPeripheralsAcknowledged(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'acknowledged');
  } catch {}
}

export const PeripheralsWarningModal: React.FC<PeripheralsWarningModalProps> = ({
  isOpen,
  onAcknowledge,
  onCancel
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(3);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSecondsRemaining(3);
    setCanDismiss(false);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanDismiss(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Prevent escape key dismissal while countdown is active
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (onCancel && canDismiss) {
          onCancel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onCancel, canDismiss]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!canDismiss) return;
    setPeripheralsAcknowledged();
    onAcknowledge();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="peripherals-warning-title"
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy/85 p-3 sm:items-center sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="my-auto w-full max-w-2xl overflow-hidden rounded-lg border-2 border-orange-500 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Header */}
        <div className="flex items-start gap-3 border-b border-orange-200 bg-orange-50 px-4 py-4 sm:px-7 sm:py-5">
          <AlertTriangle className="mt-0.5 h-[26px] w-[26px] shrink-0 text-orange-600" />
          <div>
            <p className="qtr-label text-orange-700">Before adding your PC to cart!</p>
            <h2
              id="peripherals-warning-title"
              className="mt-1 font-heading text-[18px] font-extrabold uppercase leading-tight text-orange-900 sm:text-[23px]"
            >
              Have you remembered your peripherals?
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-5 sm:px-7 sm:py-6">
          <p className="text-[14px] leading-relaxed text-slate-700">
            Your custom-built PC includes the computer only. <strong>Peripherals are NOT included</strong>:
          </p>

          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <li className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3">
              <Monitor className="h-[17px] w-[17px] shrink-0 text-rose-700" />
              <span className="text-[13.5px] font-semibold text-rose-900">Monitor</span>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3">
              <Keyboard className="h-[17px] w-[17px] shrink-0 text-rose-700" />
              <span className="text-[13.5px] font-semibold text-rose-900">Keyboard</span>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3">
              <Mouse className="h-[17px] w-[17px] shrink-0 text-rose-700" />
              <span className="text-[13.5px] font-semibold text-rose-900">Mouse</span>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3">
              <Headphones className="h-[17px] w-[17px] shrink-0 text-rose-700" />
              <span className="text-[13.5px] font-semibold text-rose-900">Headphones</span>
            </li>
            <li className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3">
              <Mic className="h-[17px] w-[17px] shrink-0 text-rose-700" />
              <span className="text-[13.5px] font-semibold text-rose-900">Microphone</span>
            </li>
          </ul>

          <p className="mt-4 text-[13.5px] leading-relaxed text-slate-700">
            These items must be added or purchased separately. Confirm below if you already have them
            or have budgeted for them, or return to keep your build selections intact.
          </p>
        </div>

        {/* Countdown Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-600" aria-live="polite">
              {!canDismiss ? (
                <>
                  <Lock className="h-[13px] w-[13px] shrink-0 text-slate-400" />
                  <span>
                    Please wait {secondsRemaining} second
                    {secondsRemaining === 1 ? '' : 's'} to confirm.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-emerald-700">Ready to confirm.</span>
                </>
              )}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 font-heading text-[12px] font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100"
                >
                  NO, I DIDN&apos;T FACTOR IT IN
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canDismiss}
                className={`inline-flex h-11 items-center justify-center rounded-md px-5 font-heading text-[12.5px] font-bold uppercase tracking-wide transition ${
                  canDismiss
                    ? 'cursor-pointer bg-orange-600 text-white hover:bg-orange-700'
                    : 'cursor-not-allowed bg-slate-300 text-slate-500'
                }`}
              >
                {canDismiss ? 'YES, I UNDERSTAND' : `YES, I UNDERSTAND (${secondsRemaining}s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
