import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { Card } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Coins, Layers } from "lucide-react";
import React from "react";

export interface BreakdownField {
    key: string;
    value: string | number;
}

interface FinancialBreakdownProps {
    transactionBreakdown: BreakdownField[];
    rentalBreakdown: BreakdownField[];
    loading?: boolean;
}

export default function FinancialBreakdown({
    transactionBreakdown,
    rentalBreakdown,
    loading = false,
}: FinancialBreakdownProps) {
    const transactionSection = {
        title: "Property Features",
        icon: Coins,
        items: transactionBreakdown.map(({ key, value }) => ({
            label: key,
            value,
        })),
    } as const;

    const rentalSection = {
        title: "Management Fees",
        icon: Layers,
        items: rentalBreakdown.map(({ key, value }) => ({
            label: key,
            value,
        })),
    } as const;

    const sections = { transaction: transactionSection, rental: rentalSection };

    function formatValue(value: string | number): string | number {
        // Handle if already number
        if (typeof value === "number") {
            return value.toLocaleString();
        }

        // Clean comma number in string
        const numericString = value.replace(/,/g, "");

        // Match if it's a plain integer with optional commas, no decimals, no symbols
        const isPureNumber = /^[\d,]+$/.test(value);

        if (isPureNumber && !value.includes('.')) {
            const parsed = parseInt(numericString, 10);
            if (!isNaN(parsed)) {
                return parsed.toLocaleString();
            }
        }

        return value;
    }

    const renderAccordionSection = (sectionKey: keyof typeof sections) => {
        const section = sections[sectionKey];
        const IconComponent = section.icon;
        const items = section.items;

        return (
            <Card className="w-full xl:w-1/2 py-0 h-fit" key={sectionKey}>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue={sectionKey}
                >
                    <AccordionItem
                        value={sectionKey}
                        className="max-w-full w-full"
                    >
                        <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center gap-3 flex-1">
                                    <IconComponent className="h-6 w-6 text-grey-6" />
                                    <div className="text-left">
                                        <div className="font-semibold text-black">
                                            {section.title}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                            {items.length > 0 ? (
                                <div className="space-y-2 pt-2">
                                    {items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center py-1"
                                        >
                                            <span className="text-grey-6 font-medium text-sm xl:text-base">
                                                {item.label}
                                            </span>
                                            <span className="font-semibold text-black text-sm xl:text-base">
                                                {formatValue(item.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-grey-5">
                                    No records available.
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>
        );
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            {loading ? (
                <div className="w-full flex gap-4 xl:gap-6">
                    <Skeleton className="w-full xl:w-1/2 h-64" />
                    <Skeleton className="w-full xl:w-1/2 h-64" />
                </div>
            ) : (
                <>
                    {renderAccordionSection("transaction")}
                    {renderAccordionSection("rental")}
                </>
            )}
        </div>
    );
}
