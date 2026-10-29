"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import EmployeeProtection from "@/components/EmployeeProtection";

type DashboardData = {
  employee: {
    name: string;
    email: string;
  };
  stats: {
    totalPoints: number;
    level: string;
    questionsCompleted: number;
    correctAnswers: number;
    averageScore: number;
    nextLevelPoints: number;
  };
};

const trainingModules = [
  {
    title: "Product Knowledge",
    description: "Improve your knowledge about products and solutions.",
    icon: "📦",
    path: "/dashboard/training?category=Product%20Knowledge",
  },
  {
    title: "Customer Handling",
    description: "Learn how to handle customer questions professionally.",
    icon: "🤝",
    path: "/dashboard/training?category=Customer%20Handling",
  },
  {
    title: "Sales",
    description: "Develop your sales and communication skills.",
    icon: "💼",
    path: "/dashboard/training?category=Sales",
  },
  {
    title: "Technical",
    description: "Strengthen your technical and product understanding.",
    icon: "⚙️",
    path: "/dashboard/training?category=Technical",
  },
];

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        window.location.href = "/";
        return;
      }

      const result = await response.json();

      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
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
      <main className="min-h-screen bg-[#F5F9FC] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#73C2FB]/30 border-t-[#4AA8E8]" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#F5F9FC] flex items-center justify-center">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            Unable to load dashboard.
          </p>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-[#73C2FB] px-5 py-2.5 text-sm font-semibold text-[#101736] hover:bg-[#4AA8E8]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const { employee, stats } = data;

  const progress =
    stats.nextLevelPoints > 0
      ? Math.min(
          100,
          Math.round(
            (stats.totalPoints / stats.nextLevelPoints) * 100
          )
        )
      : 100;

  return (
    <EmployeeProtection>
      <main className="min-h-screen bg-[#F5F9FC]">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="border-b border-gray-200 bg-white">

          <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">

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

                <p className="text-sm font-bold text-[#101736]">
                  Training Portal
                </p>

                <p className="text-[11px] text-gray-400">
                  Employee Learning
                </p>

              </div>

            </div>


            {/* Right Header */}
            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  (window.location.href =
                    "/dashboard/performance")
                }
                className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#101736] transition hover:bg-[#73C2FB]/10"
              >
                <span>📊</span>
                My Performance
              </button>

              <div className="h-9 w-px bg-gray-200" />

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101736] text-sm font-bold text-white">
                {employee.name.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>

            </div>

          </div>

        </header>


        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

          {/* ===================================================
              WELCOME HERO
          =================================================== */}
          <section className="relative overflow-hidden rounded-3xl bg-[#101736] px-7 py-8 text-white shadow-xl lg:px-10 lg:py-10">

            {/* Decorative shapes */}
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#73C2FB]/15" />
            <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-[#73C2FB]/10" />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#73C2FB]/15 px-4 py-2 text-xs font-medium text-[#DDF3FF]">

                  <span className="h-2 w-2 rounded-full bg-[#73C2FB]" />

                  Employee Training

                </div>

                <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">

                  Hello, {employee.name} 👋

                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 lg:text-base">

                  Keep learning, improve your skills and build your
                  knowledge through regular training.

                </p>

              </div>


              {/* Level */}
              <div className="min-w-[220px] rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-gray-300">
                    Current Level
                  </span>

                  <span className="rounded-full bg-[#73C2FB] px-3 py-1 text-xs font-bold text-[#101736]">
                    {stats.level}
                  </span>

                </div>

                <div className="mt-5">

                  <div className="flex justify-between text-xs text-gray-300">

                    <span>
                      {stats.totalPoints} points
                    </span>

                    <span>
                      {stats.nextLevelPoints > 0
                        ? `${stats.nextLevelPoints} next`
                        : "Maximum level"}
                    </span>

                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-[#73C2FB] transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ===================================================
              PERFORMANCE SNAPSHOT
          =================================================== */}
          <section className="mt-8">

            <div className="mb-4 flex items-end justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#4AA8E8]">
                  Your Progress
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#101736]">
                  Performance Snapshot
                </h2>

              </div>

              <button
                onClick={loadDashboard}
                className="text-sm font-medium text-gray-500 transition hover:text-[#2575B5]"
              >
                ↻ Refresh
              </button>

            </div>


            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              {/* Points */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <span className="text-2xl">⭐</span>

                  <span className="text-xs font-medium text-gray-400">
                    TOTAL
                  </span>

                </div>

                <p className="mt-4 text-3xl font-bold text-[#101736]">
                  {stats.totalPoints}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Total Points
                </p>

              </div>


              {/* Questions */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <span className="text-2xl">📚</span>

                  <span className="text-xs font-medium text-gray-400">
                    COMPLETED
                  </span>

                </div>

                <p className="mt-4 text-3xl font-bold text-[#101736]">
                  {stats.questionsCompleted}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Questions Completed
                </p>

              </div>


              {/* Correct
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <span className="text-2xl">✓</span>

                  <span className="text-xs font-medium text-gray-400">
                    CORRECT
                  </span>

                </div>

                <p className="mt-4 text-3xl font-bold text-[#101736]">
                  {stats.correctAnswers}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Correct Answers
                </p>

              </div> */}


              {/* Score */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <span className="text-2xl">🎯</span>

                  <span className="text-xs font-medium text-gray-400">
                    SCORE
                  </span>

                </div>

                <p className="mt-4 text-3xl font-bold text-[#101736]">
                  {stats.averageScore}%
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Average Score
                </p>

              </div>

            </div>

          </section>


          {/* ===================================================
              TRAINING AREA
          =================================================== */}
          <section className="mt-10">

            <div className="mb-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-[#4AA8E8]">
                Start Learning
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#101736]">
                Training Areas
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose a category and continue your training.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {trainingModules.map((module) => (

                <button
                  key={module.title}
                  onClick={() =>
                    (window.location.href = module.path)
                  }
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#73C2FB] hover:shadow-lg"
                >

                  {/* Blue accent */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#73C2FB] transition group-hover:bg-[#4AA8E8]" />

                  <div className="flex items-start justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73C2FB]/15 text-2xl">
                      {module.icon}
                    </div>

                    <span className="text-xl text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#4AA8E8]">
                      →
                    </span>

                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#101736]">
                    {module.title}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    {module.description}
                  </p>

                  <div className="mt-5 text-sm font-semibold text-[#2575B5]">
                    Start Training →
                  </div>

                </button>

              ))}

            </div>

          </section>


          {/* ===================================================
              QUICK ACCESS
          =================================================== */}
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/performance")
              }
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-[#73C2FB] hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#101736] text-xl">
                  📊
                </div>

                <div>

                  <h3 className="font-bold text-[#101736]">
                    My Performance
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    View detailed training performance
                  </p>

                </div>

              </div>

              <span className="text-gray-300">
                →
              </span>

            </button>


            <div className="flex items-center justify-between rounded-2xl border border-[#73C2FB]/30 bg-[#73C2FB]/10 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                  💡
                </div>

                <div>

                  <h3 className="font-bold text-[#101736]">
                    Keep Learning
                  </h3>

                  <p className="mt-1 text-xs text-gray-600">
                    Regular practice helps improve your score.
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* ===================================================
              FOOTER
          =================================================== */}
          <footer className="mt-12 border-t border-gray-200 py-6">

            <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-400 sm:flex-row">

              <p>
                © 2026 Heera Agro · Training Portal
              </p>

              <p>
                Internal Use Only · Version 1.0
              </p>

            </div>

          </footer>

        </div>

      </main>
    </EmployeeProtection>
  );
}