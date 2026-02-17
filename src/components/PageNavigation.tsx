import {
    CommandLineIcon,
    KeyIcon,
    Loading01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ApiKeyPanel } from "./ApiKeyPanel";

interface PageNavigationProps {
    userSearchQuery: string;
    onUserSearchChange: (query: string) => void;
    isSearchingUser: boolean;
    onUserSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    showKeyInput: boolean;
    onToggleKeyInput: () => void;
    showToken: boolean;
    apiKey: string;
    onToggleShowToken: () => void;
    onApiKeyChange: (key: string) => void;
    onSaveApiKey: () => void;
    hasApiKey: boolean;
}

export function PageNavigation({
    userSearchQuery,
    onUserSearchChange,
    isSearchingUser,
    onUserSearchKeyDown,
    showKeyInput,
    onToggleKeyInput,
    showToken,
    apiKey,
    onToggleShowToken,
    onApiKeyChange,
    onSaveApiKey,
    hasApiKey,
}: PageNavigationProps) {
    return (
        <nav className="glass-panel sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                            <HugeiconsIcon
                                icon={CommandLineIcon}
                                size={20}
                                color="white"
                                strokeWidth={1.5}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-lg text-apple-text leading-none tracking-tight">
                                GitRanked
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-apple-blue/20 transition-all w-64">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={16}
                                color="currentColor"
                                className="text-gray-400"
                                strokeWidth={1.5}
                            />
                            <input
                                type="text"
                                placeholder="Find user..."
                                className="bg-transparent border-none focus:outline-none text-sm w-full text-apple-text placeholder-gray-400 font-medium"
                                value={userSearchQuery}
                                onChange={(e) =>
                                    onUserSearchChange(e.target.value)
                                }
                                onKeyDown={onUserSearchKeyDown}
                                disabled={isSearchingUser}
                            />
                            {isSearchingUser && (
                                <HugeiconsIcon
                                    icon={Loading01Icon}
                                    size={14}
                                    color="#2563EB"
                                    className="animate-spin"
                                    strokeWidth={1.5}
                                />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onToggleKeyInput}
                            className={`p-2 rounded-full transition-all ${hasApiKey ? "text-apple-blue bg-blue-50" : "text-gray-500 hover:bg-gray-100"}`}
                            title="API Settings"
                        >
                            <HugeiconsIcon
                                icon={KeyIcon}
                                size={20}
                                color="currentColor"
                                strokeWidth={1.5}
                            />
                        </button>
                    </div>
                </div>

                {showKeyInput && (
                    <ApiKeyPanel
                        showToken={showToken}
                        apiKey={apiKey}
                        onToggleShowToken={onToggleShowToken}
                        onApiKeyChange={onApiKeyChange}
                        onSave={onSaveApiKey}
                    />
                )}
            </div>
        </nav>
    );
}
