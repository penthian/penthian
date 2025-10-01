import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border text-sm font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-grey-3 text-grey-6 [a&]:hover:bg-grey-6/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
                destructive:
                    "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                green:
                    "text-Green border border-Green [a&]:hover:bg-transparent [a&]:hover:text-transparent-foreground",
                red:
                    "text-Red border border-Red [a&]:hover:bg-transparent [a&]:hover:text-transparent-foreground",
                orange:
                    "text-Orange border border-Orange [a&]:hover:bg-transparent [a&]:hover:text-transparent-foreground",
            },
            size: {
                default: 'px-4 3xl:px-6 py-1.5 3xl:py-2',
                sm: 'h-8 px-3 text-xs',
                md: 'py-1.5 3xl:py-2 px-4',
                lg: 'h-10 px-8',
                icon: 'h-9 w-9',
            }
        },
        defaultVariants: {
            variant: "default",
            size: 'default'
        },
    }
)

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span"

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
