"use client";

import { motion } from "framer-motion";

interface GlowingOrbProps {
    color: string;
    size: number;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    delay?: number;
}

export function GlowingOrb({
    color,
    size,
    top,
    left,
    right,
    bottom,
    delay = 0,
}: GlowingOrbProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay }}
            className="absolute blur-[100px] pointer-events-none"
            style={{
                width: size,
                height: size,
                background: color,
                borderRadius: "50%",
                top,
                left,
                right,
                bottom,
            }}
        />
    );
}

