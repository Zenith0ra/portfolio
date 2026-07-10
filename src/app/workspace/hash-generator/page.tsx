"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Hash, Copy, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { GlowingOrb } from "@/components/GlowingOrb";
import { PageNav } from "@/components/PageNav";

// Hash functions using Web Crypto API
async function generateHash(text: string, algorithm: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// MD5 implementation (Web Crypto doesn't support MD5)
function md5(string: string): string {
    function rotateLeft(value: number, shift: number): number {
        return (value << shift) | (value >>> (32 - shift));
    }

    function addUnsigned(x: number, y: number): number {
        const x8 = x & 0x80000000;
        const y8 = y & 0x80000000;
        const x4 = x & 0x40000000;
        const y4 = y & 0x40000000;
        const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
        if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
        if (x4 | y4) {
            if (result & 0x40000000) return result ^ 0xC0000000 ^ x8 ^ y8;
            else return result ^ 0x40000000 ^ x8 ^ y8;
        }
        return result ^ x8 ^ y8;
    }

    function f(x: number, y: number, z: number): number { return (x & y) | (~x & z); }
    function g(x: number, y: number, z: number): number { return (x & z) | (y & ~z); }
    function h(x: number, y: number, z: number): number { return x ^ y ^ z; }
    function i(x: number, y: number, z: number): number { return y ^ (x | ~z); }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
        a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(str: string): number[] {
        const wordArray: number[] = [];
        const messageLength = str.length;
        const numWords = (((messageLength + 8) >> 6) + 1) * 16;

        for (let i = 0; i < numWords; i++) wordArray[i] = 0;

        for (let i = 0; i < messageLength; i++) {
            wordArray[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        }
        wordArray[messageLength >> 2] |= 0x80 << ((messageLength % 4) * 8);
        wordArray[numWords - 2] = messageLength * 8;

        return wordArray;
    }

    function wordToHex(value: number): string {
        let hex = "";
        for (let i = 0; i <= 3; i++) {
            hex += ((value >> (i * 8)) & 255).toString(16).padStart(2, '0');
        }
        return hex;
    }

    const x = convertToWordArray(string);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;

        a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);

        a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = gg(d, a, b, c, x[k + 10], S22, 0x02441453);
        c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

        a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = hh(b, c, d, a, x[k + 6], S34, 0x04881D05);
        a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

        a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);

        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

interface HashResult {
    algorithm: string;
    hash: string;
}

export default function HashGeneratorPage() {
    const [input, setInput] = useState("");
    const [hashes, setHashes] = useState<HashResult[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateHashes = useCallback(async () => {
        if (!input.trim()) {
            setHashes([]);
            return;
        }

        setIsGenerating(true);

        try {
            const results: HashResult[] = [
                { algorithm: "MD5", hash: md5(input) },
                { algorithm: "SHA-1", hash: await generateHash(input, "SHA-1") },
                { algorithm: "SHA-256", hash: await generateHash(input, "SHA-256") },
                { algorithm: "SHA-384", hash: await generateHash(input, "SHA-384") },
                { algorithm: "SHA-512", hash: await generateHash(input, "SHA-512") },
            ];
            setHashes(results);
        } catch (error) {
            console.error("Hash generation error:", error);
        }

        setIsGenerating(false);
    }, [input]);

    const copyToClipboard = async (hash: string, algorithm: string) => {
        await navigator.clipboard.writeText(hash);
        setCopied(algorithm);
        setTimeout(() => setCopied(null), 1500);
    };

    const clearAll = () => {
        setInput("");
        setHashes([]);
    };

    return (
        <div className="relative min-h-screen overflow-hidden noise-overlay">
            <div className="fixed inset-0 bg-grid-pattern" />
            <GlowingOrb color="rgba(168, 85, 247, 0.12)" size={500} top="-100px" right="-100px" delay={0.2} />
            <GlowingOrb color="rgba(0, 212, 255, 0.08)" size={400} bottom="10%" left="-100px" delay={0.4} />

            <main className="relative z-10 mx-auto max-w-2xl px-6 py-16 md:py-20">
                <PageNav />
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                    <Link href="/workspace" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                        Back to workspace
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-purple-500/10 p-3">
                            <Hash className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="gradient-text text-3xl font-bold tracking-tight">Hash Generator</h1>
                            <p className="text-zinc-500">Generate MD5, SHA-1, SHA-256, and more</p>
                        </div>
                    </div>
                </motion.div>

                {/* Input */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-4">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Input Text</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter text to hash..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none font-mono text-sm"
                    />
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex gap-3 mb-6">
                    <button
                        onClick={generateHashes}
                        disabled={!input.trim() || isGenerating}
                        className="flex items-center gap-2 rounded-xl bg-purple-500/20 px-5 py-3 text-sm font-medium text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Hash className="h-4 w-4" />
                        {isGenerating ? "Generating..." : "Generate Hashes"}
                    </button>
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-400 hover:bg-white/10 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear
                    </button>
                </motion.div>

                {/* Results */}
                {hashes.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="space-y-3">
                        {hashes.map((result) => (
                            <div key={result.algorithm} className="rounded-xl bg-white/5 border border-white/10 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-zinc-400">{result.algorithm}</span>
                                    <button
                                        onClick={() => copyToClipboard(result.hash, result.algorithm)}
                                        className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                                    >
                                        {copied === result.algorithm ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                        {copied === result.algorithm ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <p className="font-mono text-xs text-zinc-300 break-all select-all">{result.hash}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 text-center">
                    <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
                </motion.footer>
            </main>
        </div>
    );
}

