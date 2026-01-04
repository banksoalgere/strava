import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

// Combine standard button props with framer-motion props
type MotionButtonProps = ButtonProps & HTMLMotionProps<"button">;

export const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {

        const baseStyles = 'relative inline-flex items-center justify-center font-medium font-outfit transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden';

        // Aesthetic variants
        const variants = {
            primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_20px_-5px_var(--primary-glow)] border border-white/10 hover:brightness-110',
            glow: 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_30px_-5px_var(--primary-glow)] border border-white/20 hover:shadow-[0_0_45px_-10px_var(--primary)] hover:scale-[1.02]',
            secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/5 hover:border-white/20 backdrop-blur-sm',
            outline: 'bg-transparent border border-white/20 text-white hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5',
            ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
            danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40',
        };

        const sizes = {
            sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
            md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
            lg: 'text-base px-8 py-4 rounded-2xl gap-2.5',
            xl: 'text-lg px-10 py-5 rounded-2xl gap-3',
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.96 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {/* Inner Noise Texture for subtle detail */}
                {variant !== 'ghost' && variant !== 'outline' && (
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
                )}

                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {!isLoading && leftIcon && <span className="opacity-90">{leftIcon}</span>}
                <span className="relative z-10 tracking-wide">{children}</span>
                {!isLoading && rightIcon && <span className="opacity-90">{rightIcon}</span>}

                {/* Subtle top highlight for 3D feel */}
                {variant !== 'ghost' && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
