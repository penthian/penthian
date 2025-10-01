'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'mb-5 w-full max-w-screen-md rounded-xl bg-background p-3 transition-all duration-200 ease-in-out data-[state=open]:text-black',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex w-full">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex w-full flex-1 text-start  items-start justify-between gap-5 py-4 text-lg sm:text-xl 3xl:text-2xl font-semibold transition-all [&[data-state=open]>svg]:rotate-180 relative',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          'h-6 w-6 shrink-0 transition-transform duration-200 font-bold top-1/2 -translate-y-1/2 right-2 absolute',
          'data-[state=open]:rotate-180',
        )}
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));


AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="w-full text-[#7B7B7B] overflow-hidden text-sm xl:text-base 3xl:text-xl data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0 text-start', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
