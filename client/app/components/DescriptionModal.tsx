"use client";

import React from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

interface DescriptionModalProps {
    title?: string;
    description: string;
    triggerText?: string;
}

export const DescriptionModal: React.FC<DescriptionModalProps> = ({
    title = "Description",
    description,
    triggerText = "View More...",
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" size="sm">
                    {triggerText}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <p className="whitespace-pre-wrap text-base">
                        {description}
                    </p>
                </DialogDescription>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
