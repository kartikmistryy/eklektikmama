"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified events management page
    router.push("/admin/events/manage");
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to events management...</p>
      </div>
    </div>
  );
}