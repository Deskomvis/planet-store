import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Testimoni Pelanggan",
  description: "Kumpulan video testimoni pelanggan Planet Store.",
};

async function getTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export default async function TestimoniPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Katalog
        </Link>

        <h1 className="mt-4 text-xl font-bold text-neutral-900">Testimoni Pelanggan</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {testimonials.length} video dari pelanggan Planet Store.
        </p>

        {testimonials.length === 0 ? (
          <div className="mt-6 flex items-center justify-center rounded-2xl bg-neutral-100 px-4 py-16 text-sm text-neutral-500">
            Belum ada testimoni.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-black"
              >
                <video
                  src={testimonial.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className={`w-full ${testimonial.format === "9:16" ? "aspect-[9/16]" : "aspect-[4/5]"} object-cover`}
                />
                {testimonial.title || testimonial.description ? (
                  <div className="bg-white p-3">
                    {testimonial.title ? (
                      <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{testimonial.title}</p>
                    ) : null}
                    {testimonial.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{testimonial.description}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
