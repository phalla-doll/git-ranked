export function PageFooter() {
    return (
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                        GitRanked Cambodia
                    </p>
                    <p className="text-xs text-gray-500">
                        Community leaderboard for local developers.
                    </p>
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap justify-center items-center gap-1">
                    <span>Created as a hobby and maintained by</span>
                    <a
                        href="https://manthaa.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:underline transition-colors"
                    >
                        Mantha
                    </a>
                </div>
            </div>
        </footer>
    );
}
