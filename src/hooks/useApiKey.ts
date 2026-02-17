import { useEffect, useState } from "react";

export function useApiKey() {
    const [apiKey, setApiKey] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && typeof window !== "undefined") {
            const savedKey = localStorage.getItem("gitranked_api_key");
            if (savedKey) {
                setApiKey(savedKey);
            }
        }
    }, [mounted]);

    const saveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem("gitranked_api_key", apiKey.trim());
        } else {
            localStorage.removeItem("gitranked_api_key");
        }
    };

    return {
        apiKey,
        setApiKey,
        saveApiKey,
        mounted,
    };
}
