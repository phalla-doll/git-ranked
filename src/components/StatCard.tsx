import type React from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ElementType;
    trend?: string;
    color?: string;
}

export const StatCard = ({ label, value }: StatCardProps) => {
    return (
        <div className="flex flex-col h-full justify-between items-start gap-4">
            <h3 className="text-6xl sm:text-7xl font-normal text-apple-text tracking-tighter leading-none">
                {value}
            </h3>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
        </div>
    );
};
