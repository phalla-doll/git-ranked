"use client";

import { useLayoutEffect, useRef } from "react";
import { SortOption } from "@/types";

interface SortOptionsProps {
    sortBy: SortOption;
    onSortChange: (option: SortOption) => void;
}

export function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
    const options = [
        { id: SortOption.CONTRIBUTIONS, label: "Contributions" },
        { id: SortOption.FOLLOWERS, label: "Followers" },
        { id: SortOption.REPOS, label: "Repositories" },
    ] as const;

    const pillRef = useRef<HTMLSpanElement>(null);
    const buttonRefs = useRef<
        Partial<Record<SortOption, HTMLButtonElement | null>>
    >({});
    // First paint snaps without a transition; later sort changes animate.
    const animatedRef = useRef(false);

    useLayoutEffect(() => {
        const move = (animate: boolean) => {
            const pill = pillRef.current;
            const activeBtn = buttonRefs.current[sortBy];
            if (!pill || !activeBtn) return;

            const apply = () => {
                pill.style.transform = `translate(${activeBtn.offsetLeft}px, ${activeBtn.offsetTop}px)`;
                pill.style.width = `${activeBtn.offsetWidth}px`;
                pill.style.height = `${activeBtn.offsetHeight}px`;
            };

            if (animate) {
                apply();
            } else {
                // Suspend the transition, write position, force a reflow, restore —
                // so the pill snaps into place instead of sliding in from translate(0).
                const prev = pill.style.transition;
                pill.style.transition = "none";
                apply();
                void pill.offsetWidth;
                pill.style.transition = prev;
            }
        };

        move(animatedRef.current);
        animatedRef.current = true;

        const onResize = () => move(false);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [sortBy]);

    return (
        <div className="relative flex overflow-x-auto custom-scrollbar bg-gray-200/50 p-1 rounded-xl w-full sm:w-auto">
            <span ref={pillRef} aria-hidden="true" className="t-tabs-pill" />
            {options.map((option) => (
                <button
                    key={option.id}
                    ref={(el) => {
                        buttonRefs.current[option.id] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={sortBy === option.id}
                    onClick={() => onSortChange(option.id)}
                    className={`relative z-10 flex-1 md:flex-none px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 ease-out whitespace-nowrap min-h-11 ${sortBy === option.id ? "text-apple-text" : "text-gray-500 hover:text-gray-900"}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
