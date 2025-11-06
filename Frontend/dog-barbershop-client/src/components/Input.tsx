import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-amber-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-amber-900 placeholder-amber-400 ${
          error ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white hover:border-amber-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

