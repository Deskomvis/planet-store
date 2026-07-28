"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type SliderBanner = {
  id: string;
  imageUrl: string;
  link: string | null;
};

const SLIDE_WIDTH_RATIO = 0.62; // "center" slide width relative to the container
const GAP_PX = 16;
const AUTO_ADVANCE_MS = 3500;

export function BannerSlider({ banners }: { banners: SliderBanner[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  const n = banners.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = setInterval(() => setStep((s) => s + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [n, paused]);

  if (n === 0) return null;

  const slideWidth = containerWidth * SLIDE_WIDTH_RATIO;
  const cellWidth = slideWidth + GAP_PX;
  const virtualIndex = n + (((step % n) + n) % n);
  const track = [...banners, ...banners, ...banners];

  const translateX = containerWidth
    ? containerWidth / 2 - (virtualIndex * cellWidth + slideWidth / 2)
    : 0;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: containerWidth ? "transform 700ms ease" : "none",
        }}
      >
        {track.map((banner, i) => {
          const distance = Math.abs(i - virtualIndex);
          const scale = distance === 0 ? 1 : distance === 1 ? 0.72 : 0.6;
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
                transform: `scale(${scale})`,
                opacity,
                transition: "transform 700ms ease, opacity 700ms ease",
              }}
            >
              {banner.link ? (
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
