import { cn } from '@/lib/utils';
import React from 'react';
type ButtonVariant = 'primary' | 'secondary' | 'outline';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}
const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = cn('px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none', className);
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg focus:ring-purple-400',
    secondary: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg focus:ring-pink-400',
    outline: 'bg-transparent border-2 border-indigo-400 text-indigo-100 hover:bg-indigo-800/30 hover:border-indigo-200 focus:ring-indigo-400'
  };
  const widthClasses = fullWidth ? 'w-full' : '';
  return <button disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} `} {...props}>
      {children}
    </button>;
};
export default Button;