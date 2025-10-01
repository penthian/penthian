import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    className?: string;
}

export function LoadingSpinner({ className = 'h-8 w-8' }: LoadingSpinnerProps) {
    return (
        <Loader2 className={className} />
    );
}