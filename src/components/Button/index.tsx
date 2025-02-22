import clsx from 'clsx';
import { FunctionComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?:
    | 'none'
    | 'primary'
    | 'primary-outline'
    | 'landing-primary-outline'
    | 'landing-primary'
    | 'success'
    | 'success-outline'
    | 'danger'
    | 'danger-outline';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: ReactNode;
  href?: string;
  rightIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'none',
  size = 'medium',
  leftIcon,
  rightIcon,
  href,
  disabled = false,
  className = '',
}) => {
  // Variants
  const variantStyles = {
    none: '',
    primary: 'bg-primary-500 text-white hover:bg-blue-700 disabled:bg-blue-700',
    'primary-outline':
      'border border-primary-500 text-primary-500 hover:bg-blue-100',
    'landing-primary-outline':
      'border border-landing-primary-500 text-landing-primary-500 hover:bg-success-100 bg-white bg-opacity-20',
    'landing-primary': 'bg-landing-primary-500 text-white',
    success: 'bg-success-500 text-white hover:bg-green-600',
    'success-outline':
      'border border-success-500 text-success-500 hover:bg-green-100',
    danger: 'bg-danger-500 text-white hover:bg-danger-600',
    'danger-outline':
      'border border-danger-500 text-danger-500 hover:bg-red-100',
  }[variant];

  // Sizes
  const sizeStyles = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }[size];

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const Tag = href ? Link : 'button';

  return (
    <Tag
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx([
        'inline-flex items-center justify-center gap-1 rounded-[8px] px-[10px] py-[8px] font-medium focus:outline-none',
        variantStyles,
        sizeStyles,
        disabledStyles,
        className,
      ])}
      to={href || ''}
    >
      {leftIcon && <span className="mr-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="mr-1">{rightIcon}</span>}
    </Tag>
  );
};

export default Button;
