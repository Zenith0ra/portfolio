"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    href?: string;
    glowColor?: "cyan" | "purple" | "orange";
}

export function BentoCard({
    children,
    className = "",
    delay = 0,
    href,
}: BentoCardProps) {
    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            className={`card card-hover rounded-lg p-6 ${className}`}
        >
            {children}
        </motion.div>
    );

    if (href) {
        if (href.startsWith("http")) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                >
                    {content}
                </a>
            );
        }
        return (
            <Link href={href} className="block h-full">
                {content}
            </Link>
        );
    }

    return content;
}
