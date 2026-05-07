import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const inputUnderline =
  'w-full bg-transparent border-b border-dark/10 py-3 pr-11 focus:border-dark transition-colors outline-none text-dark font-light placeholder:text-dark/25';

/**
 * Underline-style password input with visibility toggle (matches Auth / Admin forms).
 */
export function PasswordField({
  id,
  label,
  labelClassName,
  wrapperClassName,
  inputClassName,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={wrapperClassName ?? 'space-y-4'}>
      {label ? (
        <label
          htmlFor={id}
          className={
            labelClassName ??
            'text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1'
          }
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={inputClassName ?? inputUnderline}
          {...inputProps}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-dark/40 hover:text-dark rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dark/25"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <EyeOff className="w-5 h-5" strokeWidth={1.5} aria-hidden />
          ) : (
            <Eye className="w-5 h-5" strokeWidth={1.5} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
