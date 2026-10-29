"use client";

import { useEffect, useState } from "react";

export default function EmployeeProtection({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkEmployee() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.href = "/";
          return;
        }

        const data = await response.json();

        if (data.user?.role !== "EMPLOYEE") {
          window.location.href = "/admin";
          return;
        }

        setCheckingAuth(false);
      } catch (error) {
        console.error("Employee authentication check failed:", error);
        window.location.href = "/";
      }
    }

    checkEmployee();
  }, []);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">
          Checking access...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}