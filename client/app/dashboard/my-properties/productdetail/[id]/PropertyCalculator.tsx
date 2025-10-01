"use client";

import React, { useState, useMemo } from "react";
import { XAxis, YAxis, AreaChart, Area } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/app/components/ui/chart";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";

// You can accept these props from the parent page
interface PropertyCalculatorProps {
    apr: number;             // Annual appreciation %
    onBuyNowClick?: () => void;
}

export default function PropertyCalculator({ apr, onBuyNowClick }: PropertyCalculatorProps) {

    // State
    const [initialAmount, setInitialAmount] = useState<number>(100);
    const appreciationRate = apr;
    const dividendYield = apr / 12;
    const holdingPeriod = 3;

    const MAX_INITIAL = 999_999_999_999;

    // Computations
    const calculations = useMemo(() => {
        const monthlyDividendRate = dividendYield / 100;
        const annualAppreciationRate = appreciationRate / 100;

        let currentValue = initialAmount;
        const chartData: { year: string; value: number }[] = [];
        for (let year = 1; year <= holdingPeriod; year++) {
            currentValue = currentValue * (1 + annualAppreciationRate);
            chartData.push({ year: `Year ${year}`, value: Math.round(currentValue) });
        }

        const finalValue = currentValue;
        const totalReturn =
            initialAmount > 0
                ? ((finalValue - initialAmount) / initialAmount) * 100
                : 0;
        const monthlyRentalIncome = initialAmount * monthlyDividendRate;
        const yearlyRentalIncome = monthlyRentalIncome * 12;
        const totalExpectedValue = finalValue;

        return {
            chartData,
            totalReturn,
            monthlyRentalIncome,
            yearlyRentalIncome,
            totalExpectedValue,
        };
    }, [initialAmount, appreciationRate, dividendYield, holdingPeriod]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            {/* Left: Calculator */}
            <Card className="xl:col-span-2 space-y-6">
                <CardHeader className="text-xl font-bold text-black border-b">
                    How much can you earn with this Property?
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Initial Amount */}
                        <div className="space-y-2">
                            <label className="text-base font-medium text-grey-6">
                                Initial Amount
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={12}
                                value={initialAmount.toString()}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                    setInitialAmount(digits ? Number(digits) : 0);
                                }}
                                className="h-12 text-lg"
                                placeholder="Enter amount"
                            />
                        </div>

                        {/* Appreciation % */}
                        <div className="space-y-2 relative">
                            <label className="text-base font-medium text-grey-6">
                                Expected Annual Appreciation %
                            </label>
                            <Input
                                type="number"
                                value={appreciationRate}
                                disabled
                                className="h-12 text-lg bg-gray-50 pr-10"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Dividend Yield % */}
                        <div className="space-y-2 relative">
                            <label className="text-base font-medium text-grey-6">
                                Net Dividend Yield %
                            </label>
                            <Input
                                type="number"
                                value={dividendYield.toFixed(2)}
                                disabled
                                className="h-12 text-lg bg-gray-50 pr-10"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Holding Period */}
                        <div className="space-y-2 relative">
                            <label className="text-base font-medium text-grey-6">
                                Holding Period
                            </label>
                            <Input
                                type="number"
                                value={holdingPeriod}
                                disabled
                                className="h-12 text-lg bg-gray-50 pr-10"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="w-full h-60">
                        <ChartContainer config={{ value: { label: 'Value', color: '#0087FF' } }} className="h-60 w-full">
                            <AreaChart data={calculations.chartData}>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} className="text-xs" />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs"
                                    tickFormatter={(val: number) => {
                                        if (Math.abs(val) >= 1_000_000_000_000) {
                                            const v = val / 1_000_000_000_000;
                                            return `$${v.toFixed(v % 1 === 0 ? 0 : 1)}T`;
                                        }
                                        if (Math.abs(val) >= 1_000_000_000) {
                                            const v = val / 1_000_000_000;
                                            return `$${v.toFixed(v % 1 === 0 ? 0 : 1)}B`;
                                        }
                                        if (Math.abs(val) >= 1_000_000) {
                                            const v = val / 1_000_000;
                                            return `$${v.toFixed(v % 1 === 0 ? 0 : 1)}M`;
                                        }
                                        if (Math.abs(val) >= 1_000) {
                                            const v = val / 1_000;
                                            return `$${v.toFixed(v % 1 === 0 ? 0 : 1)}K`;
                                        }
                                        return `$${val}`;
                                    }}
                                />

                                <ChartTooltip
                                    content={<ChartTooltipContent className="bg-white" />}
                                    cursor={false}
                                    formatter={(value: number) => {
                                        let label: string;
                                        const abs = Math.abs(value);
                                        if (abs >= 1_000_000_000) {
                                            const v = value / 1_000_000_000;
                                            label = `$${v.toFixed(v % 1 === 0 ? 0 : 1)}B`;
                                        } else if (abs >= 1_000_000) {
                                            const v = value / 1_000_000;
                                            label = `$${v.toFixed(v % 1 === 0 ? 0 : 1)}M`;
                                        } else if (abs >= 1_000) {
                                            const v = value / 1_000;
                                            label = `$${v.toFixed(v % 1 === 0 ? 0 : 1)}K`;
                                        } else {
                                            label = `$${value}`;
                                        }
                                        return [label, " Value"];
                                    }}
                                />

                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#143560" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#143560" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#143560" strokeWidth={3} fill="url(#colorValue)" dot={false} activeDot={({ cx, cy }) => (
                                    <g>
                                        <circle cx={cx} cy={cy} r={6} fill="#fff" />
                                        <circle cx={cx} cy={cy} r={4} fill="#143560" />
                                    </g>
                                )} />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                    {/* Disclaimer */}
                    <p className="text-base text-grey-5 text-center max-w-2xl mx-auto">
                        This calculator is for illustrative purposes only. Buying a real-estate NFT carries risk and you may not receive the anticipated returns.
                    </p>
                </CardContent>
            </Card>

            {/* Right: Overview */}
            <Card>
                <CardHeader className="text-xl font-bold text-black border-b">
                    Overview
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="border-b pb-3">
                            <div className="text-xl 3xl:text-2xl font-bold text-black">
                                {calculations.totalReturn.toFixed(2)}%
                            </div>
                            <div className="text-sm text-grey-6">Expected Return on Investment</div>
                        </div>
                        <div className="border-b pb-3">
                            <div className="text-xl 3xl:text-2xl font-bold text-black">
                                {calculations.monthlyRentalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                            <div className="text-sm text-grey-6">Monthly Rental Income</div>
                        </div>
                        <div className="border-b pb-3">
                            <div className="text-xl 3xl:text-2xl font-bold text-black">
                                {calculations.yearlyRentalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                            <div className="text-sm text-grey-6">Yearly Rental Income</div>
                        </div>
                        <div className="border-b pb-3">
                            <div className="text-xl 3xl:text-2xl font-bold text-primary">
                                {calculations.totalExpectedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                            </div>
                            <div className="text-sm text-grey-6">Total Expected Value</div>
                        </div>
                        <Button onClick={onBuyNowClick} className="w-full">
                            Buy Now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
