import React from "react";

export interface AvatarProps {
    src?: string | null;
    alt: string;
    size?: number; // px
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 40, className }) => {
    const styles = { width: size, height: size };
    const initials = alt?.trim()?.substring(0, 1)?.toUpperCase() || "U";

    return src ? (
        <img
        src={src}
        alt={alt}
        style={styles}
        className={`rounded-full object-cover ${className || ""}`}
        />
    ) : (
        <div
        style={styles}
        className={`rounded-full flex items-center justify-center text-sm bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ${className || ""}`}
        aria-label={alt}
        role="img"
        >
        {initials}
        </div>
    );
};
