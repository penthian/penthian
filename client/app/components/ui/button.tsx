import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none gap-2 group disabled:opacity-60 disabled:cursor-not-allowed transition-all ease-in-out duration-300 hover:duration-300 whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white w-fit py-2 px-6 shadow hover:bg-primary/80',
        skyBlue:
          'bg-skyBlue text-primary w-fit py-2 px-6 shadow hover:bg-skyBlue/80',
        destructive:
          'hover:bg-Red/80 bg-Red text-white',
        destructive_outline:
          'hover:bg-Red hover:text-white text-Red border-Red border',
        success: 'bg-Green text-white hover:bg-Green/80',
        outline: 'border border-primary bg-transparent text-primary hover:bg-primary hover:text-white',
        outline_white: 'border border-white bg-transparent text-white hover:bg-primary',
        white: 'bg-white text-primary hover:bg-white/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        muted: 'bg-[f5f5f7] hover:bg-[f5f5f7]/80',
        ghost:
          'text-grey-2 bg-transparent hover:bg-primary hover:text-white',
        link: 'text-primary underline-offset-4 hover:underline',
        disabled: 'bg-grey-3 text-grey-2 opacity-60',
        max: 'bg-background border border-2 border-foreground',
        tableHeader: 'font-medium !px-0 text-grayText',
        blur: 'bgBlur2'
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-6 px-3 text-xs',
        lg: 'h-12 px-8 xl:text-lg',
        icon: 'h-9 w-9',
        pagination: 'h-10 w-10 bg-background text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean; // Add loading prop
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size,
      asChild = false,
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Disable button if loading or disabled prop is true
    const isDisabled = loading || disabled;

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: isDisabled ? 'disabled' : variant,
            size
          }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {children}
        {loading && <Loader2 className='animate-spin' />}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
