// src/components/ui/select.tsx

'use client';

import * as React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-full border bg-transparent p-4 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-6 w-6 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [showTopArrow, setShowTopArrow] = React.useState(false);
  const [showBottomArrow, setShowBottomArrow] = React.useState(true);

  // Function to handle click-based scrolling
  const scrollUp = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ top: -100, behavior: 'smooth' });
      updateArrowVisibility();
    }
  };

  const scrollDown = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ top: 100, behavior: 'smooth' });
      updateArrowVisibility();
    }
  };

  // Function to update arrow visibility based on scroll position
  const updateArrowVisibility = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setShowTopArrow(viewport.scrollTop > 0);
    setShowBottomArrow(
      viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight
    );
  };

  // Update arrow visibility on initial load and scroll events
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      updateArrowVisibility(); // Check initial arrow visibility
      viewport.addEventListener('scroll', updateArrowVisibility);
      return () => {
        viewport.removeEventListener('scroll', updateArrowVisibility);
      };
    }
  }, []);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          'relative z-50 max-h-[300px] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        {/* {showTopArrow && (
          <div
            className="absolute left-0 right-0 top-0 z-50 flex h-8 cursor-pointer items-center justify-center bg-white"
            onClick={scrollUp} // Trigger scrollUp on click
          >
            <ChevronUp size={20} />
          </div>
        )} */}

        <SelectPrimitive.Viewport
          // ref={viewportRef}
          className={cn(
            'max-h-[300px] overflow-y-auto p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>

        {/* {showBottomArrow && (
          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex h-8 cursor-pointer items-center justify-center bg-white"
            onClick={scrollDown} // Trigger scrollDown on click
          >
            <ChevronDown size={20} />
          </div>
        )} */}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;


const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer hover:bg-primary hover:text-background select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
};
