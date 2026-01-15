import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('glass-card p-6 text-slate-200', className)}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

export { Card };
