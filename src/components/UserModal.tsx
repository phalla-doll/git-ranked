"use client";

import {
    Calendar01Icon,
    Cancel01Icon,
    Github01Icon,
    Link01Icon,
    Loading03Icon,
    Location01Icon,
    OfficeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import type { GitHubUserDetail } from "@/types";

// Read the close duration from the --modal-close-dur token so the unmount
// timer stays in sync with the CSS transition.
const closeDurationMs = () => {
    if (typeof window === "undefined") return 150;
    const v = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
            "--modal-close-dur",
        ),
    );
    return Number.isFinite(v) ? v : 150;
};

interface UserModalProps {
    user: GitHubUserDetail | null;
    rank?: number;
    isOpen: boolean;
    isLoading?: boolean;
    onClose: () => void;
}

const RankBadge = ({ rank }: { rank: number }) => {
    let colorClass = "text-gray-500 font-medium";

    if (rank === 1) {
        colorClass = "text-yellow-600 font-medium";
    } else if (rank === 2) {
        colorClass = "text-gray-600 font-medium";
    } else if (rank === 3) {
        colorClass = "text-orange-700 font-medium";
    }

    return (
        <div className={`flex items-center gap-1.5 ${colorClass}`}>
            <span className="text-2xl">#{rank}</span>
        </div>
    );
};

export const UserModal = ({
    user,
    rank,
    isOpen,
    isLoading,
    onClose,
}: UserModalProps) => {
    // Keep the modal mounted through the close animation, then unmount.
    const [mounted, setMounted] = useState(false);
    const [shown, setShown] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Once mounted, flip to the open state on a later frame — after the closed
    // state has painted — so the entrance actually transitions instead of
    // snapping straight to open.
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

    // `user` is retained by the parent during close, so the exit animation
    // still has content to render.
    if (!mounted || !user) return null;
    const stateClass = shown ? "is-open" : "is-closing";

    return (
        <div
            className="relative z-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <button
                type="button"
                className={`fixed inset-0 z-10 bg-gray-900/20 backdrop-blur-sm cursor-default t-modal-backdrop ${stateClass}`}
                onClick={onClose}
                aria-label="Close modal"
            />

            <div className="fixed inset-0 z-20 overflow-y-auto pointer-events-none overscroll-contain">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div
                        className={`relative overflow-hidden bg-white rounded-3xl shadow-2xl text-left sm:my-8 w-full max-w-lg t-modal ${stateClass}`}
                    >
                        <div className="relative h-24 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-900 transition-colors z-20"
                                aria-label="Close modal"
                            >
                                <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    size={18}
                                    color="currentColor"
                                    strokeWidth={1.5}
                                />
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="relative -mt-12 mb-5 flex justify-between items-end">
                                <div className="relative">
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.login}
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white"
                                    />
                                </div>
                                <a
                                    href={user.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() =>
                                        analytics.githubProfileClick(
                                            user.login,
                                            "modal",
                                        )
                                    }
                                    className="mb-1 px-5 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
                                >
                                    <HugeiconsIcon
                                        icon={Github01Icon}
                                        size={18}
                                        color="white"
                                        strokeWidth={1.5}
                                    />
                                    GitHub
                                </a>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-medium text-apple-text tracking-tight">
                                        {user.name || user.login}
                                    </h2>
                                    {rank && <RankBadge rank={rank} />}
                                </div>
                                <p className="text-apple-gray text-sm">
                                    @{user.login}
                                </p>
                            </div>

                            {user.bio && (
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed font-normal">
                                    {user.bio}
                                </p>
                            )}

                            <div className="mb-8 bg-gray-50 rounded-xl p-4">
                                <div className="grid grid-cols-3 divide-x divide-gray-200 pb-3 border-b border-gray-200">
                                    <div className="text-center px-1">
                                        <div className="text-lg font-medium text-apple-text">
                                            {user.public_repos.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium mt-1">
                                            Repos
                                        </div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="text-lg font-medium text-apple-text">
                                            {user.followers.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium mt-1">
                                            Followers
                                        </div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="text-lg font-medium text-apple-text">
                                            {user.following.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium mt-1">
                                            Following
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-gray-200 pt-3">
                                    <div className="text-center px-1">
                                        <div className="text-lg font-medium text-apple-text">
                                            {isLoading ? (
                                                <div className="h-7 flex items-center justify-center">
                                                    <HugeiconsIcon
                                                        icon={Loading03Icon}
                                                        size={20}
                                                        color="currentColor"
                                                        className="text-gray-600 animate-spin"
                                                    />
                                                </div>
                                            ) : user.total_stars !==
                                              undefined ? (
                                                user.total_stars.toLocaleString()
                                            ) : (
                                                "-"
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium mt-1">
                                            Stars
                                        </div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="text-lg font-medium text-apple-blue">
                                            {user.recent_activity_count !==
                                            undefined
                                                ? user.recent_activity_count.toLocaleString()
                                                : "-"}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium mt-1">
                                            Contribs
                                        </div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="flex items-center justify-center gap-1 text-lg font-medium text-apple-text">
                                            {isLoading ? (
                                                <div className="h-7 flex items-center justify-center">
                                                    <HugeiconsIcon
                                                        icon={Loading03Icon}
                                                        size={20}
                                                        color="currentColor"
                                                        className="text-gray-600 animate-spin"
                                                    />
                                                </div>
                                            ) : user.contribution_streak ? (
                                                `${user.contribution_streak}d`
                                            ) : (
                                                "-"
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium mt-1">
                                            Streak
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 font-normal">
                                {user.location && (
                                    <div className="flex items-center gap-3">
                                        <HugeiconsIcon
                                            icon={Location01Icon}
                                            size={16}
                                            color="currentColor"
                                            className="text-gray-400"
                                            strokeWidth={1.5}
                                        />
                                        <span>{user.location}</span>
                                    </div>
                                )}
                                {user.company && (
                                    <div className="flex items-center gap-3">
                                        <HugeiconsIcon
                                            icon={OfficeIcon}
                                            size={16}
                                            color="currentColor"
                                            className="text-gray-400"
                                            strokeWidth={1.5}
                                        />
                                        <span>{user.company}</span>
                                    </div>
                                )}
                                {user.blog && (
                                    <div className="flex items-center gap-3">
                                        <HugeiconsIcon
                                            icon={Link01Icon}
                                            size={16}
                                            color="currentColor"
                                            className="text-gray-400"
                                            strokeWidth={1.5}
                                        />
                                        <a
                                            href={
                                                user.blog.startsWith("http")
                                                    ? user.blog
                                                    : `https://${user.blog}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() =>
                                                analytics.userBlogClick(
                                                    user.login,
                                                )
                                            }
                                            className="text-apple-blue hover:underline truncate max-w-62.5"
                                        >
                                            {user.blog}
                                        </a>
                                    </div>
                                )}
                                {user.created_at && (
                                    <div className="flex items-center gap-3">
                                        <HugeiconsIcon
                                            icon={Calendar01Icon}
                                            size={16}
                                            color="currentColor"
                                            className="text-gray-400"
                                            strokeWidth={1.5}
                                        />
                                        <span>
                                            Joined{" "}
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
