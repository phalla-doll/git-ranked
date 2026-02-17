"use client";

import { TokenPromoModal as TokenPromoModalComponent } from "./TokenPromoModal";

interface TokenPromoModalWrapperProps {
    isOpen: boolean;
    onClose: (hideForToday: boolean) => void;
    onSave: (key: string) => void;
}

export const TokenPromoModal = ({
    isOpen,
    onClose,
    onSave,
}: TokenPromoModalWrapperProps) => {
    return (
        <TokenPromoModalComponent
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
        />
    );
};
