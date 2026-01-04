'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    spotlight?: boolean;
}

export const Card = ({ children, className, onClick, spotlight = true }: CardProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || !spotlight) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={cn(
                "glass-card relative overflow-hidden rounded-3xl transition-all duration-300",
                onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                className
            )}
        >
            {/* Spotlight Gradient */}
            {spotlight && (
                <div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8">
                {children}
            </div>

            {/* Border Gradient Overlay */}
            <div
                className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none"
            />
        </div>
    );
};
