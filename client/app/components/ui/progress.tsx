"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  className?: string;
  classNameRoot?: string;
  value?: number;
}

function Progress({ className, classNameRoot, value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full bg-lightBlue overflow-hidden rounded-lg",
        classNameRoot
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(`bg-primary h-full w-full flex-1 rounded-lg transition-all`, className)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
