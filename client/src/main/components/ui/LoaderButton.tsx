import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    elevation?: 'none' | 'sm' | 'md' | 'lg';
    pulse?: boolean;
}

const variantStyles: Record<string, string> = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700 focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 shadow-sm',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2',
    danger: 'bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 focus:ring-2 focus:ring-rose-200 focus:ring-offset-2',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 shadow-sm',
    warning: 'bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 focus:ring-2 focus:ring-amber-200 focus:ring-offset-2',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2',
};

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-lg',
    lg: 'px-6 py-3 text-sm gap-2 rounded-xl',
};

export const LoaderButton: React.FC<LoaderButtonProps> = ({
    children,
    loading = false,
    loadingText,
    icon,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    pulse = false,
    disabled,
    className = '',
    ...props
}) => {
    return (
        <button
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center font-semibold
                transition-all duration-150 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]
                ${variantStyles[variant] || variantStyles.primary}
                ${sizeStyles[size]}
                ${fullWidth ? 'w-full' : ''}
                ${pulse && !loading ? 'animate-pulse' : ''}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>{loadingText || 'Processing...'}</span>
                </>
            ) : (
                <>
                    {icon && <span className="flex items-center shrink-0">{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};