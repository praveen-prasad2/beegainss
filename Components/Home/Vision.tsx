import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

const INSTAGRAM_URL = "https://www.instagram.com/reel/C9zfuXWytbD/";

export const Vision = () => {
  return (
    <section className="flex flex-row flex-wrap items-center gap-12 px-[110px] py-20 leading-none">
      <div className="relative  w-[min(20%,200px)] h-[320px] shrink-0 overflow-hidden rounded-[20px] bg-neutral-800 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)]">
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-600 via-slate-700 to-slate-900"
          aria-hidden
        />
        <video
          className="relative z-1 h-full w-full object-cover"
          src="/home/vision-video.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 bg-linear-to-t from-black/85 via-black/40 to-transparent pt-16" />
        <div className="absolute h-10 flex items-center justify-center inset-x-0 bottom-0 z-3  bg-black/55 backdrop-blur-[2px]">
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-4 py-4 font-poppins text-[13px] font- tracking-wide text-white transition-opacity hover:opacity-90"
          >
            <FaInstagram className="h-5 w-5 shrink-0 text-white font-poppins" />
            <span>View on Instagram</span>
          </Link>
        </div>
      </div>

      <div className="flex min-w-[30%,200px] flex-1 flex-col items-start justify-center gap-4">
        <h2 className="text-left font-monument text-[62px]">
          The <br /> Bee <br /> Vision
        </h2>
        <p className="text-left font-poppins text-[18px] text-orange">
          We want our Visitors to inspire to <br />
          get their hands dirty.
        </p>
      </div>
      <div className="flex min-w-[50%,400px] flex-1">
        
        <p className="text-left font-poppins text-[18px] text-black ">
        The bee sees what humans cannot. Beegains was founded with the vision to enable clients to explore the unexplored.We provide you with customised digital solutions to expand your reach and online foot-print. We help you scale up your businesses qualitatively, and quantitatively.
        </p>
      </div>

     
    </section>
  );
};
