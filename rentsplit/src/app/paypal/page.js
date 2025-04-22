"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PayPalSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("token");
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const captureOrder = async () => {
      if (!orderId) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/paypal/capture-order/${orderId}`, {
          method: "POST",
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          window.location.href = "http://localhost:3000/dashboard";
        } else {
          console.error("❌ Capture failed:", data);
          setStatus("error");
        }
      } catch (err) {
        console.error("❌ Network error:", err);
        setStatus("error");
      }
    };

    captureOrder();
  }, [orderId]);

  useEffect(() => {
    if (status === "error") {
      const timeout = setTimeout(() => {
        window.location.href = "http://localhost:3000/dashboard";
      }, 5000); // ⏱️ 5 seconds before redirect

      return () => clearTimeout(timeout); // Cleanup if component unmounts early
    }
  }, [status]);

  return (
    <div className="flex items-center justify-center h-screen">
      {status === "processing" && (
        <p className="text-lg font-medium">Processing your payment...</p>
      )}
      {status === "error" && (
        <p className="text-lg font-semibold text-red-600">
          Failed to process payment. Redirecting...
        </p>
      )}
    </div>
  );
}
