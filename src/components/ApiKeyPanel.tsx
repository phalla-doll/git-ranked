import { ArrowUpRight01Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { analytics } from "@/lib/analytics";

interface ApiKeyPanelProps {
    showToken: boolean;
    apiKey: string;
    onToggleShowToken: () => void;
    onApiKeyChange: (key: string) => void;
    onSave: () => void;
}

export function ApiKeyPanel({
    showToken,
    apiKey,
    onToggleShowToken,
    onApiKeyChange,
    onSave,
}: ApiKeyPanelProps) {
    return (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2">
            <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="text-sm text-apple-text">
                    <p className="font-medium mb-1">GitHub Access Token</p>
                    <p className="text-gray-500 flex items-center flex-wrap gap-1">
                        Add a token to increase API rate limits.{" "}
                        <a
                            href="https://github.com/settings/tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                                analytics.externalLinkClick("github_tokens")
                            }
                            className="text-apple-blue hover:underline inline-flex items-center gap-1 font-medium"
                        >
                            Generate one here{" "}
                            <HugeiconsIcon
                                icon={ArrowUpRight01Icon}
                                size={12}
                                color="currentColor"
                                strokeWidth={1.5}
                            />
                        </a>
                    </p>
                </div>
                <div className="flex w-full md:w-auto gap-2 items-center">
                    <div className="relative w-full md:w-80">
                        <input
                            type={showToken ? "text" : "password"}
                            placeholder="ghp_…"
                            value={apiKey}
                            onChange={(e) => onApiKeyChange(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm w-full focus:outline-none focus-visible:border-apple-blue focus-visible:ring-1 focus-visible:ring-apple-blue transition-all"
                            aria-label="GitHub Access Token"
                        />
                        <button
                            type="button"
                            onClick={onToggleShowToken}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                            aria-label={showToken ? "Hide token" : "Show token"}
                        >
                            <HugeiconsIcon
                                icon={EyeIcon}
                                size={14}
                                color="currentColor"
                                strokeWidth={showToken ? 3 : 1.5}
                            />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onSave}
                        className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors min-h-11"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
