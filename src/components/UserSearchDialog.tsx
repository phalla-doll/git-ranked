"use client";

import {
    Alert02Icon,
    Cancel01Icon,
    Loading03Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

// Mirror the UserModal close timing so the unmount stays in sync with the
// shared --modal-close-dur CSS token.
const closeDurationMs = () => {
    if (typeof window === "undefined") return 150;
    const v = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
            "--modal-close-dur",
        ),
    );
    return Number.isFinite(v) ? v : 150;
};

interface UserSearchDialogProps {
    isOpen: boolean;
    isSearching: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (username: string) => void;
    onClearError: () => void;
}

export const UserSearchDialog = ({
    isOpen,
    isSearching,
    error,
    onClose,
    onSubmit,
    onClearError,
}: UserSearchDialogProps) => {
    const [mounted, setMounted] = useState(false);
    const [shown, setShown] = useState(false);
    const [value, setValue] = useState("");
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mount on open; on close, play the exit then unmount after the close dur.
    useEffect(() => {
        if (isOpen) {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            setMounted(true);
            return;
        }
        setShown(false);
        closeTimer.current = setTimeout(
            () => setMounted(false),
            closeDurationMs(),
        );
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    }, [isOpen]);

    // Flip to the open state on a later frame so the entrance transitions.
    useEffect(() => {
        if (!mounted || !isOpen) return;
        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => setShown(true));
        });
        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [mounted, isOpen]);

    // Focus the field once the entrance has begun; reset state on full close.
    useEffect(() => {
        if (shown) {
            inputRef.current?.focus();
        }
    }, [shown]);

    useEffect(() => {
        if (!mounted) {
            setValue("");
            onClearError();
        }
    }, [mounted, onClearError]);

    // Close on Escape while open.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!mounted) return null;
    const stateClass = shown ? "is-open" : "is-closing";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
    };

    return (
        <div className="relative z-50" role="dialog" aria-modal="true">
            <button
                type="button"
                className={`fixed inset-0 z-10 bg-gray-900/20 backdrop-blur-sm cursor-default t-modal-backdrop ${stateClass}`}
                onClick={onClose}
                aria-label="Close search"
            />

            <div className="fixed inset-0 z-20 overflow-y-auto pointer-events-none overscroll-contain">
                <div className="flex min-h-full items-start justify-center px-4 pt-[14vh] pb-4">
                    <div
                        className={`relative overflow-hidden bg-white rounded-3xl shadow-2xl text-left w-full max-w-lg t-modal ${stateClass}`}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                                <HugeiconsIcon
                                    icon={Search01Icon}
                                    size={20}
                                    color="currentColor"
                                    className="text-gray-400 shrink-0"
                                    strokeWidth={1.5}
                                />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                        if (error) onClearError();
                                    }}
                                    placeholder="Search by GitHub username…"
                                    className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-base text-apple-text placeholder-gray-400 font-medium"
                                    aria-label="Search by GitHub username"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    disabled={isSearching}
                                />
                                {isSearching ? (
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        size={20}
                                        color="#0071e3"
                                        className="animate-spin shrink-0"
                                        strokeWidth={1.5}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                        aria-label="Close search"
                                    >
                                        <HugeiconsIcon
                                            icon={Cancel01Icon}
                                            size={16}
                                            color="currentColor"
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                )}
                            </div>

                            <div className="px-5 py-4">
                                {error ? (
                                    <div className="flex items-center gap-2.5 text-sm text-red-500">
                                        <HugeiconsIcon
                                            icon={Alert02Icon}
                                            size={16}
                                            color="currentColor"
                                            className="shrink-0"
                                            strokeWidth={1.5}
                                        />
                                        <span>{error}</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        Enter an exact username to view the
                                        profile.
                                    </p>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!value.trim() || isSearching}
                                        className="px-5 py-2.5 bg-apple-blue hover:bg-apple-blueHover disabled:opacity-40 disabled:hover:bg-apple-blue text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        <HugeiconsIcon
                                            icon={Search01Icon}
                                            size={16}
                                            color="white"
                                            strokeWidth={1.5}
                                        />
                                        Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
