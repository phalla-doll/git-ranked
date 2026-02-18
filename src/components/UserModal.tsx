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
import type { GitHubUserDetail } from "@/types";

interface UserModalProps {
    user: GitHubUserDetail | null;
    isOpen: boolean;
    isLoading?: boolean;
    onClose: () => void;
}

export const UserModal = ({
    user,
    isOpen,
    isLoading,
    onClose,
}: UserModalProps) => {
    if (!isOpen || !user) return null;

    return (
        <div
            className="relative z-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <button
                type="button"
                className="fixed inset-0 z-10 bg-gray-900/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-default"
                onClick={onClose}
                aria-label="Close modal"
            />

            <div className="fixed inset-0 z-20 overflow-y-auto pointer-events-none">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="relative transform overflow-hidden bg-white rounded-3xl shadow-2xl text-left transition-all sm:my-8 w-full max-w-lg animate-in zoom-in-95 duration-200 pointer-events-auto">
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
                                    className="mb-1 px-5 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
                                >
                                    <HugeiconsIcon
                                        icon={Github01Icon}
                                        size={14}
                                        color="white"
                                        strokeWidth={1.5}
                                    />
                                    GitHub
                                </a>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-2xl font-medium text-apple-text tracking-tight">
                                    {user.name || user.login}
                                </h2>
                                <p className="text-apple-gray text-sm">
                                    @{user.login}
                                </p>
                            </div>

                            {user.bio && (
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed font-normal">
                                    {user.bio}
                                </p>
                            )}

                            <div className="grid grid-cols-5 gap-0 mb-8 bg-gray-50 rounded-xl p-4 divide-x divide-gray-200">
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
                                        ) : user.total_stars !== undefined ? (
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
