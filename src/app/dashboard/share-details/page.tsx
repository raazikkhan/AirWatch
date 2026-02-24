import ShareDetails from "@/components/share-details";
import { Suspense } from "react";

export default function ShareDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareDetails />
    </Suspense>
  );
}
