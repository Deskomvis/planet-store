"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type SliderBanner = {
  id: string;
  imageUrl: string;
  link: string | null;
};

const SLIDE_WIDTH_RATIO = 0.62; // "center" slide width relative to the container
const GAP_PX = 10;
const AUTO_ADVANCE_MS = 3500;

export function BannerSlider({ banners }: { banners: SliderBanner[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // Grows forever (never wraps with %) so the track only ever moves one
  // direction; once a full cycle has scrolled by, it's rewound by exactly
  // one cycle with the transition disabled so the rewind is invisible.
  const [step, setStep] = useState(0);
  const [instant, setInstant] = useState(false);
  const [paused, setPaused] = useState(false);

  const n = banners.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);

    // Safety net: if the tab was frozen/discarded while hidden, the observer
    // can miss the first measurement on return. Re-measure directly off the
    // element once the tab is visible again instead of waiting on it.
    const remeasure = () => {
      if (document.visibilityState === "visible") {
        setContainerWidth(el.getBoundingClientRect().width);
      }
    };
    document.addEventListener("visibilitychange", remeasure);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", remeasure);
    };
  }, []);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setStep((s) => s + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [n, paused]);

  useEffect(() => {
    if (!instant) return;
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  if (n === 0) return null;

  const slideWidth = containerWidth * SLIDE_WIDTH_RATIO;
  const cellWidth = slideWidth + GAP_PX;
  const virtualIndex = n + step;
  const track = [...banners, ...banners, ...banners];

  const translateX = containerWidth
    ? containerWidth / 2 - (virtualIndex * cellWidth + slideWidth / 2)
    : 0;

  return (
    <div
      ref={containerRef}
      // Matches the center slide's own aspect ratio (16/7, 16/6) scaled down
      // by SLIDE_WIDTH_RATIO, so this reserves the exact same height purely
      // in CSS — the area never collapses to 0 while JS is still waiting for
      // a width measurement (e.g. right after a background tab is restored).
      className="relative aspect-[16/4.34] overflow-hidden sm:aspect-[16/3.72]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: containerWidth && !instant ? "transform 700ms ease" : "none",
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName !== "transform") return;
          if (step >= n) {
            setInstant(true);
            setStep((s) => s - n);
          }
        }}
      >
        {track.map((banner, i) => {
          const distance = Math.abs(i - virtualIndex);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.85 : 0.5;

          const content = (
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-neutral-100 sm:aspect-[16/6]">
              <Image
                src={banner.imageUrl}
                alt=""
                fill
                sizes="70vw"
                className="object-cover"
                priority={distance === 0}
                loading={distance === 0 ? undefined : distance === 1 ? "eager" : "lazy"}
              />
            </div>
          );

          return (
            <div
              key={`${banner.id}-${i}`}
              className="shrink-0"
              style={{
                width: slideWidth || undefined,
                marginRight: GAP_PX,
                opacity,
                transition: "opacity 700ms ease",
              }}
            >
              {banner.link?.startsWith("/") && !banner.link.startsWith("//") ? (
                <Link href={banner.link} className="block cursor-pointer" aria-label="Buka halaman banner">
                  {content}
                </Link>
              ) : banner.link ? (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-neutral-50 to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-neutral-50 to-transparent sm:w-28" />
    </div>
  );
}
