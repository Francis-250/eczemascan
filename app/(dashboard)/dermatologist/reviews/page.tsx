import { getDermatologistReviews } from "@/lib/actions/review";
import ReviewsHistory from "@/components/dermatologist/reviews-history";

export default async function ReviewsHistoryPage() {
  const { reviews } = await getDermatologistReviews();

  return <ReviewsHistory reviews={reviews ?? []} />;
}