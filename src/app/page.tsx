"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-black">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">AirWatch</h1>
        <p className="mb-8 text-lg text-gray-700">
          Real-time air quality insights and personalized climate action
          recommendations
        </p>
        <Link href={session ? "/dashboard" : "/onboarding"}>
          <Button className="bg-black text-white hover:bg-gray-800">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
