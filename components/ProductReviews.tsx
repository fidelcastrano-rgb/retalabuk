import { Star, StarHalf, BadgeCheck } from "lucide-react";
import { type Review } from "@/lib/reviews-generator";

interface ProductReviewsProps {
  reviews: Review[];
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = (totalRating / reviews.length).toFixed(1);

  return (
    <div className="mt-16 pt-12 border-t border-[#CBD5E1]">
      <div className="flex flex-col md:flex-row gap-8 mb-10 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold text-[#0F172A] mb-2">Verified Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-[#F59E0B]">
              <Star className="fill-current" size={24} />
              <Star className="fill-current" size={24} />
              <Star className="fill-current" size={24} />
              <Star className="fill-current" size={24} />
              {Number(averageRating) >= 4.8 ? (
                <Star className="fill-current" size={24} />
              ) : (
                <StarHalf className="fill-current" size={24} />
              )}
            </div>
            <span className="text-xl font-bold text-[#0F172A]">{averageRating} out of 5</span>
          </div>
          <p className="text-[#475569] mt-1">Based on {reviews.length} authentic reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl border border-[#EEF2F7] shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#0F172A]">{review.name}</span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                      <BadgeCheck size={12} />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#64748B]">{review.location}</div>
              </div>
              <div className="text-sm text-[#94A3B8]">{review.date}</div>
            </div>
            
            <div className="flex items-center gap-1 text-[#F59E0B] mb-3">
              {[...Array(5)].map((_, i) => {
                if (i < Math.floor(review.rating)) {
                  return <Star key={i} size={14} className="fill-current" />;
                } else if (i === Math.floor(review.rating) && review.rating % 1 !== 0) {
                  return <StarHalf key={i} size={14} className="fill-current" />;
                } else {
                  return <Star key={i} size={14} className="text-[#CBD5E1]" />;
                }
              })}
            </div>
            
            <p className="text-[#475569] leading-relaxed text-sm flex-grow">
              &ldquo;{review.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
