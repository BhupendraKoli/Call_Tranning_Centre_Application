"use client";

import { useEffect, useState } from "react";
import AdminProtection from "@/components/AdminProtection";

type AdminUser = {
  name: string;
  email: string;
};

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.href = "/";
          return;
        }

        const data = await response.json();

        if (data.user?.role !== "ADMIN") {
          window.location.href = "/dashboard";
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Failed to load admin:", error);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#73C2FB]/30 border-t-[#73C2FB]" />
          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <AdminProtection>
      <main className="min-h-screen bg-[#F7FAFC]">

        {/* =====================================================
            TOP NAVBAR
        ===================================================== */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">

          <div className="flex h-20 items-center justify-between px-6 lg:px-10">

            {/* Logo + Title */}
            <div className="flex items-center gap-4">

              <div className="flex h-12 items-center rounded-xl border border-gray-100 bg-white px-3 shadow-sm">

                <img
                  src="/logo.png"
                  alt="Heera Agro"
                  className="h-9 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

              </div>

              <div className="hidden sm:block">

                <h1 className="text-lg font-bold text-[#101736]">
                  Training Portal
                </h1>

                <p className="text-xs text-gray-500">
                  Admin Panel
                </p>

              </div>

            </div>


            {/* User + Logout */}
            <div className="flex items-center gap-4">

              <div className="hidden md:block text-right">

                <p className="text-sm font-semibold text-[#101736]">
                  {user?.name || "Administrator"}
                </p>

                <p className="text-xs text-gray-500">
                  Administrator
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#73C2FB]/20 text-[#101736] font-bold">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>

            </div>

          </div>

        </header>


        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

          {/* Welcome */}
          <div className="mb-8">

            <p className="text-sm font-medium text-[#2575B5]">
              ADMINISTRATION
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#101736]">
              Welcome, {user?.name || "Administrator"}
            </h2>

            <p className="mt-2 text-gray-500">
              Manage employee training, questions and performance
              from one place.
            </p>

          </div>


          {/* ===================================================
              QUICK STATS
          =================================================== */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Questions */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Training
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#101736]">
                    Questions
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-xl">
                  📚
                </div>

              </div>

              <p className="mt-4 text-xs text-gray-400">
                Manage training questions
              </p>

            </div>


            {/* Employees */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Team
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#101736]">
                    Employees
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-xl">
                  👥
                </div>

              </div>

              <p className="mt-4 text-xs text-gray-400">
                Manage employee accounts
              </p>

            </div>


            {/* Performance */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Analytics
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#101736]">
                    Performance
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-xl">
                  📊
                </div>

              </div>

              <p className="mt-4 text-xs text-gray-400">
                View employee performance
              </p>

            </div>


            {/* Reviews */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Pending
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#101736]">
                    Situation Reviews
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-xl">
                  📝
                </div>

              </div>

              <p className="mt-4 text-xs text-gray-400">
                Review employee answers
              </p>

            </div>

          </div>


          {/* ===================================================
              MANAGEMENT SECTION
          =================================================== */}
          <section>

            <div className="mb-5">

              <h3 className="text-xl font-bold text-[#101736]">
                Management
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Access and manage all training modules.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Questions */}
              <button
                onClick={() =>
                  (window.location.href = "/admin/questions")
                }
                className="group text-left rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#73C2FB] hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73C2FB]/15 text-2xl">
                    📚
                  </div>

                  <span className="text-gray-300 transition group-hover:text-[#4AA8E8]">
                    →
                  </span>

                </div>

                <h4 className="mt-5 text-xl font-bold text-[#101736]">
                  Question Management
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Add, edit, activate, deactivate and delete
                  employee training questions.
                </p>

                <div className="mt-5 inline-flex items-center rounded-lg bg-[#73C2FB]/10 px-3 py-1.5 text-xs font-semibold text-[#2575B5]">
                  Manage Questions
                </div>

              </button>


              {/* Employees */}
              <button
                onClick={() =>
                  (window.location.href = "/admin/employees")
                }
                className="group text-left rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#73C2FB] hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73C2FB]/15 text-2xl">
                    👥
                  </div>

                  <span className="text-gray-300 transition group-hover:text-[#4AA8E8]">
                    →
                  </span>

                </div>

                <h4 className="mt-5 text-xl font-bold text-[#101736]">
                  Employee Management
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  View employee accounts and manage the
                  training team.
                </p>

                <div className="mt-5 inline-flex items-center rounded-lg bg-[#73C2FB]/10 px-3 py-1.5 text-xs font-semibold text-[#2575B5]">
                  View Employees
                </div>

              </button>


              {/* Performance */}
              <button
                onClick={() =>
                  (window.location.href = "/admin/performance")
                }
                className="group text-left rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#73C2FB] hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73C2FB]/15 text-2xl">
                    📊
                  </div>

                  <span className="text-gray-300 transition group-hover:text-[#4AA8E8]">
                    →
                  </span>

                </div>

                <h4 className="mt-5 text-xl font-bold text-[#101736]">
                  Employee Performance
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Monitor points, levels, scores and employee
                  training performance.
                </p>

                <div className="mt-5 inline-flex items-center rounded-lg bg-[#73C2FB]/10 px-3 py-1.5 text-xs font-semibold text-[#2575B5]">
                  View Performance
                </div>

              </button>


              {/* Situation Reviews */}
              <button
                onClick={() =>
                  (window.location.href =
                    "/admin/situation-reviews")
                }
                className="group text-left rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#73C2FB] hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73C2FB]/15 text-2xl">
                    📝
                  </div>

                  <span className="text-gray-300 transition group-hover:text-[#4AA8E8]">
                    →
                  </span>

                </div>

                <h4 className="mt-5 text-xl font-bold text-[#101736]">
                  Situation Reviews
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Review situation-based answers and assign
                  employee points.
                </p>

                <div className="mt-5 inline-flex items-center rounded-lg bg-[#73C2FB]/10 px-3 py-1.5 text-xs font-semibold text-[#2575B5]">
                  Review Answers
                </div>

              </button>

            </div>

          </section>


          {/* ===================================================
              FOOTER
          =================================================== */}
          <footer className="mt-12 border-t border-gray-200 pt-6">

            <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-400 sm:flex-row">

              <p>
                © 2026 Heera Agro · Call Center Training Portal
              </p>

              <p>
                Internal Use Only · Version 1.0
              </p>

            </div>

          </footer>

        </div>

      </main>
    </AdminProtection>
  );
}