"use client";

import { useEffect, useState } from "react";

const WORDS = ["Marketing", "Software", "Designing", "Branding", "Photography"] as const;

export default function Hero() {
    const [idx, setIdx] = useState(0);
    const word = WORDS[idx % WORDS.length];

    useEffect(() => {
        const t = setInterval(() => setIdx((v) => (v + 1) % WORDS.length), 1500);
        return () => clearInterval(t);
    }, []);

    return (
        <main className="flex flex-col h-screen items-center justify-start bg-[url('/home/grid-bg.svg')] bg-cover bg-center leading-none py-10">
            <section>
                <h1 className="text-[62px] font-monument text-center text-orange">
                    FUEL YOUR <br />
                    <span className="relative inline-block">
                        DIGITAL FUTURE.
                        <span className="absolute left-full bottom-[10px] ml-2 text-[24px] font-monument text-black">
                            {word}
                        </span>
                    </span>
                </h1>
                <h1 className="text-[20px] font-poppins text-center text-black mt-4">Best digital marketing agency in Malappuram</h1>
            </section>
        </main>
    );
}