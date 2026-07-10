"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: "cyan" | "purple" | "orange";
    delay?: number;
    href?: string;
}

export function BentoCard({
    children,
    className = "",
    glowColor = "cyan",
    delay = 0,
    href,
}: BentoCardProps) {
    const glowClass = {
        cyan: "glow-cyan",
        purple: "glow-purple",
        orange: "glow-orange",
    }[glowColor];

    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay: delay * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ scale: 1.02 }}
            className={`glass-card border-glow ${glowClass} rounded-2xl p-6 ${className}`}
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
