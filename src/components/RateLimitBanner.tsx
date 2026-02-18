"use client";

import { AlertCircleIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

interface RateLimitBannerProps {
    rateLimitHit: boolean;
    resetAt: number | null;
    onAddKey: () => void;
    onRefresh: () => void;
}

function formatTimeRemaining(ms: number): string {
    if (ms <= 0) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function RateLimitBanner({
    rateLimitHit,
    resetAt,
    onAddKey,
    onRefresh,
}: RateLimitBannerProps) {
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!rateLimitHit || !resetAt) {
            setIsVisible(false);
            setTimeRemaining(null);
            return;
        }

        setIsVisible(true);

        const updateTime = () => {
            const remaining = resetAt - Date.now();
            if (remaining <= 0) {
                setTimeRemaining(0);
                return false;
            }
            setTimeRemaining(remaining);
            return true;
        };

        if (!updateTime()) {
            setIsVisible(false);
            onRefresh();
            return;
        }

        const interval = setInterval(() => {
            if (!updateTime()) {
                clearInterval(interval);
                setIsVisible(false);
                onRefresh();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [rateLimitHit, resetAt, onRefresh]);

    if (!isVisible) return null;

    return (
        <div className="bg-orange-50 border-b border-orange-100 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={AlertCircleIcon}
                        size={16}
                        color="#F97316"
                        strokeWidth={1.5}
                    />
                    <span className="text-xs font-medium text-orange-800">
                        Rate limit reached. Try again in{" "}
                        <span className="tabular-nums font-semibold">
                            {timeRemaining !== null
                                ? formatTimeRemaining(timeRemaining)
                                : "..."}
                        </span>
                    </span>
                    <HugeiconsIcon
                        icon={Clock01Icon}
                        size={14}
                        color="#EA580C"
                        strokeWidth={1.5}
                    />
                </div>
                <button
                    type="button"
                    onClick={onAddKey}
                    className="text-[10px] font-medium text-orange-700 bg-white border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
                >
                    Add Key
                </button>
            </div>
        </div>
    );
}
