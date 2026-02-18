import {
    ArrowUpRight01Icon,
    BarChartIcon,
    Cancel01Icon,
    CheckmarkCircle01Icon,
    EyeIcon,
    KeyIcon,
    ZapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface TokenPromoModalProps {
    isOpen: boolean;
    onClose: (hideFuture: boolean) => void;
    onSave: (key: string) => void;
}

export const TokenPromoModal = ({
    isOpen,
    onClose,
    onSave,
}: TokenPromoModalProps) => {
    const [keyInput, setKeyInput] = useState("");
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [showToken, setShowToken] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        if (keyInput.trim()) {
            onSave(keyInput.trim());
        }
    };

    const handleClose = () => {
        onClose(dontShowAgain);
    };

    return (
        <div
            className="relative z-50"
            aria-labelledby="promo-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <button
                type="button"
                className="fixed inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={handleClose}
                aria-label="Close modal"
            />

            <div className="fixed inset-0 z-10 overflow-y-auto pointer-events-none overscroll-contain">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="pointer-events-auto relative transform overflow-hidden bg-white rounded-3xl shadow-2xl text-left transition-all sm:my-8 w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
                            aria-label="Close"
                        >
                            <HugeiconsIcon
                                icon={Cancel01Icon}
                                size={20}
                                color="currentColor"
                                strokeWidth={1.5}
                            />
                        </button>

                        <div className="p-8 pt-12">
                            <div className="flex flex-col items-center text-center mb-8">
                                <h3 className="text-2xl font-semibold text-apple-text mb-3 tracking-tight">
                                    Unlock the Full Experience
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                                    Add your free GitHub Token to access{" "}
                                    <b>accurate contribution data</b> and{" "}
                                    <b>bypass rate limits</b>.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-3.5 border border-gray-100">
                                <div className="flex items-center gap-3.5 text-sm text-gray-700 font-medium">
                                    <div className="p-1.5 bg-green-100 rounded-lg text-green-700 shadow-sm">
                                        <HugeiconsIcon
                                            icon={BarChartIcon}
                                            size={16}
                                            color="#15803D"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <span>
                                        See real contribution calendar stats
                                    </span>
                                </div>
                                <div className="flex items-center gap-3.5 text-sm text-gray-700 font-medium">
                                    <div className="p-1.5 bg-orange-100 rounded-lg text-orange-700 shadow-sm">
                                        <HugeiconsIcon
                                            icon={ZapIcon}
                                            size={16}
                                            color="#EA580C"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <span>
                                        Increase limits: 60 &rarr; 5,000 req/hr
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HugeiconsIcon
                                            icon={KeyIcon}
                                            size={16}
                                            color="currentColor"
                                            className="text-gray-400"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <input
                                        type={showToken ? "text" : "password"}
                                        placeholder="Paste your GitHub token…"
                                        value={keyInput}
                                        onChange={(e) =>
                                            setKeyInput(e.target.value)
                                        }
                                        className="block w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus-visible:border-apple-blue focus-visible:ring-1 focus-visible:ring-apple-blue transition-all shadow-sm"
                                        aria-label="GitHub Token"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        aria-label={
                                            showToken
                                                ? "Hide token"
                                                : "Show token"
                                        }
                                    >
                                        <HugeiconsIcon
                                            icon={EyeIcon}
                                            size={16}
                                            color="currentColor"
                                            strokeWidth={showToken ? 3 : 1.5}
                                        />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="w-full bg-apple-blue hover:bg-apple-blueHover text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                                >
                                    Save Token &amp; Continue
                                </button>

                                <div className="text-center pt-2">
                                    <a
                                        href="https://github.com/settings/tokens"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-apple-blue transition-colors font-medium border-b border-transparent hover:border-apple-blue pb-0.5"
                                    >
                                        Don't have one? Generate here{" "}
                                        <HugeiconsIcon
                                            icon={ArrowUpRight01Icon}
                                            size={10}
                                            color="currentColor"
                                            strokeWidth={1.5}
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 px-8 py-5 flex items-center justify-center border-t border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-100/50 transition-colors">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={dontShowAgain}
                                        onChange={(e) =>
                                            setDontShowAgain(e.target.checked)
                                        }
                                        className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-apple-blue checked:bg-apple-blue hover:border-gray-400"
                                    />
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle01Icon}
                                        size={12}
                                        color="white"
                                        className="pointer-events-none absolute opacity-0 transition-opacity peer-checked:opacity-100"
                                        strokeWidth={3}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 select-none transition-colors">
                                    Don't show again for today
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
