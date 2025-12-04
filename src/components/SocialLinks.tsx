"use client";

import { motion } from "framer-motion";
import { Github, Mail, Twitter, Linkedin } from "lucide-react";

const socials = [
    {
        icon: Github,
        href: "https://github.com/Zenith0ra",
        label: "GitHub",
    },
    {
        icon: Mail,
        href: "mailto:contact@houlinzhi.com",
        label: "Email",
    },
    {
        icon: Twitter,
        href: "https://twitter.com/",
        label: "Twitter",
    },
    {
        icon: Linkedin,
        href: "https://linkedin.com/in/",
        label: "LinkedIn",
    },
];

export function SocialLinks() {
    return (
        <div className="flex gap-3">
            {socials.map((social, index) => (
                <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        delay: 0.8 + index * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                    }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={social.label}
                >
                    <social.icon className="h-5 w-5" />
                </motion.a>
            ))}
        </div>
    );
}

