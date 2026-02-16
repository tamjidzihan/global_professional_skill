// components/LoaderButton.tsx (Enhanced version)
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    elevation?: 'none' | 'sm' | 'md' | 'lg';
    pulse?: boolean;
}

const variantStyles = {
    primary: {
        base: 'bg-[#0066CC] text-white hover:bg-[#0052a3] focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2 shadow-lg shadow-[#0066CC]/30',
        loading: 'bg-[#0066CC]/80'
    },
    secondary: {
        base: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        loading: 'bg-gray-50'
    },
    danger: {
        base: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 shadow-lg shadow-red-600/30',
        loading: 'bg-red-600/80'
    },
    success: {
        base: 'bg-gradient-to-r from-[#76C043] to-[#8ed15c] text-white hover:from-[#65a838] hover:to-[#76C043] focus:ring-2 focus:ring-[#76C043] focus:ring-offset-2 shadow-lg shadow-[#76C043]/40',
        loading: 'bg-[#76C043]/80'
    },
    warning: {
        base: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-lg shadow-yellow-500/30',
        loading: 'bg-yellow-500/80'
    },
    gradient: {
        base: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 shadow-lg shadow-purple-600/30',
        loading: 'bg-purple-600/80'
    }
};

const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3 text-base gap-2.5'
};

const elevationStyles = {
    none: '',
    sm: 'shadow-sm hover:shadow',
    md: 'shadow hover:shadow-md',
    lg: 'shadow-lg hover:shadow-xl'
};

export const LoaderButton: React.FC<LoaderButtonProps> = ({
    children,
    loading = false,
    loadingText,
    icon,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    elevation = 'md',
    pulse = false,
    disabled,
    className = '',
    ...props
}) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    const elevationStyle = elevationStyles[elevation];

    return (
        <button
            disabled={disabled || loading}
            className={`
        flex items-center justify-center
        rounded-xl font-semibold cursor-pointer
        transform transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyle.base}
        ${loading ? variantStyle.loading : ''}
        ${sizeStyle}
        ${elevationStyle}
        ${fullWidth ? 'w-full' : ''}
        ${pulse && !loading ? 'animate-pulse' : ''}
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className={`w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''} animate-spin`} />
                    <span>{loadingText || 'Processing...'}</span>
                </>
            ) : (
                <>
                    {icon && <span className="flex items-center">{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};