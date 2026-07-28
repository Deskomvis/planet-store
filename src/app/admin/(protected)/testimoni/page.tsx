import { prisma } from "@/lib/db";
import { TestimonialManagement } from "@/components/admin/testimonial-management";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <TestimonialManagement
      initialTestimonials={testimonials.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        format: t.format as "9:16" | "4:5",
        videoUrl: t.videoUrl,
      }))}
    />
  );
}
