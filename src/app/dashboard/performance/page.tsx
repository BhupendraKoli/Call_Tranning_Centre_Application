"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import EmployeeProtection from "@/components/EmployeeProtection";
import { useEffect, useState } from "react";

type CategoryPerformance = {
  category: string;
  completed: number;
  correct: number;
  wrong: number;
  points: number;
  averageScore: number;
};

type TrainingHistory = {
  id: number;
  date: string;
  category: string;
  question: string;
  type: string;
  answer: string;
  score: number;
  points: number;
  feedback: string | null;
  reviewStatus: string | null;
};

type PerformanceData = {
  employee: {
    name: string;
    email: string;
  };
  summary: {
    totalPoints: number;
    level: string;
    questionsCompleted: number;
    correctAnswers: number;
    wrongAnswers: number;
    averageScore: number;
  };
  categoryPerformance: CategoryPerformance[];
  trainingHistory: TrainingHistory[];
};

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/performance", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/";
          return;
        }

        setError(result.message || "Failed to load performance.");
        return;
      }

      setData(result);
    } catch (error) {
      console.error("Performance error:", error);
      setError("Unable to load performance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#73C2FB] border-t-[#101736] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-4">
            Loading performance...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm max-w-md w-full">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-2xl">
            !
          </div>

          <h1 className="text-xl font-bold text-[#101736] mt-4">
            Performance Error
          </h1>

          <p className="text-red-600 text-sm mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPerformance}
            className="mt-6 bg-[#101736] hover:bg-[#18204A] text-white px-6 py-2.5 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const {
    employee,
    summary,
    categoryPerformance,
    trainingHistory,
  } = data;

  const getLevelProgress = () => {
    if (summary.level === "Gold") {
      return 100;
    }

    if (summary.level === "Silver") {
      return Math.min(
        ((summary.totalPoints - 1000) / 1000) * 100,
        100
      );
    }

    if (summary.level === "Bronze") {
      return Math.min(
        ((summary.totalPoints - 500) / 500) * 100,
        100
      );
    }

    return Math.min((summary.totalPoints / 500) * 100, 100);
  };

  const levelProgress = Math.max(0, getLevelProgress());

  return (
    <EmployeeProtection>
      <main className="min-h-screen bg-[#F5F8FC]">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#101736] flex items-center justify-center">
                  <span className="text-[#73C2FB] font-bold text-lg">
                    H
                  </span>
                </div>

                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#101736]">
                    My Performance
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500">
                    Track your learning progress
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPerformance}
                className="inline-flex items-center gap-2 bg-[#101736] hover:bg-[#18204A] text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                <span>↻</span>
                <span className="hidden sm:inline">Refresh</span>
              </button>

            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-7">

          {/* Employee Profile */}
          <section className="bg-[#101736] rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden">

            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#73C2FB]/10" />
            <div className="absolute right-16 -bottom-20 w-40 h-40 rounded-full bg-[#73C2FB]/10" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-2xl bg-[#73C2FB] text-[#101736] flex items-center justify-center text-2xl font-bold shrink-0">
                  {employee.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-xs text-[#73C2FB] font-semibold uppercase tracking-wider">
                    Employee Profile
                  </p>

                  <h2 className="text-xl sm:text-2xl font-bold mt-1">
                    {employee.name}
                  </h2>

                  <p className="text-sm text-slate-300 mt-1">
                    {employee.email}
                  </p>
                </div>

              </div>

              <div className="md:min-w-[280px]">

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    Current Level
                  </span>

                  <span className="text-sm font-bold text-[#73C2FB]">
                    {summary.level}
                  </span>
                </div>

                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#73C2FB] rounded-full transition-all"
                    style={{
                      width: `${levelProgress}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  {summary.totalPoints} total points
                </p>

              </div>

            </div>
          </section>

          {/* Performance Overview */}
          <section className="mt-7">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#101736]">
                  Performance Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your overall training performance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

              <StatCard
                title="Total Points"
                value={summary.totalPoints}
                icon="★"
                iconClass="bg-sky-50 text-sky-600"
              />

              <StatCard
                title="Current Level"
                value={summary.level}
                icon="◆"
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <StatCard
                title="Completed"
                value={summary.questionsCompleted}
                icon="✓"
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                title="Correct"
                value={summary.correctAnswers}
                icon="✓"
                iconClass="bg-green-50 text-green-600"
              />

              <StatCard
                title="Wrong"
                value={summary.wrongAnswers}
                icon="×"
                iconClass="bg-red-50 text-red-600"
              />

              <StatCard
                title="Avg. Score"
                value={`${summary.averageScore}%`}
                icon="%"
                iconClass="bg-purple-50 text-purple-600"
              />

            </div>
          </section>

          {/* Category Performance */}
          <section className="mt-8">

            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#101736]">
                Category Performance
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Performance across different training areas
              </p>
            </div>

            {categoryPerformance.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="text-3xl mb-3">📚</div>

                <p className="text-slate-500 text-sm">
                  No training data available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {categoryPerformance.map((category) => (

                  <div
                    key={category.category}
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h3 className="font-bold text-[#101736]">
                          {category.category}
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          {category.completed} questions completed
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-[#EAF7FF] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#2188C7]">
                          {category.averageScore}%
                        </span>
                      </div>

                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">

                      <MiniStat
                        label="Completed"
                        value={category.completed}
                        className="bg-slate-50"
                        valueClass="text-[#101736]"
                      />

                      {/* <MiniStat
                        label="Correct"
                        value={category.correct}
                        className="bg-green-50"
                        valueClass="text-green-700"
                      /> */}

                      {/* <MiniStat
                        label="Wrong"
                        value={category.wrong}
                        className="bg-red-50"
                        valueClass="text-red-700"
                      /> */}

                    </div>

                    <div className="mt-5">

                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">
                          Score Progress
                        </span>

                        <span className="font-semibold text-[#101736]">
                          {category.averageScore}%
                        </span>
                      </div>

                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#73C2FB] rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              category.averageScore,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">

                      <span className="text-xs text-slate-500">
                        Points Earned
                      </span>

                      <span className="text-sm font-bold text-[#101736]">
                        {category.points} pts
                      </span>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>

          {/* Training History */}
          <section className="mt-8">

            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#101736]">
                Training History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your recently completed training activities
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              {trainingHistory.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-3xl mb-3">📝</div>

                  <p className="text-sm text-slate-500">
                    No training history available.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-[#F7FAFD] border-b border-slate-200">

                        <tr>

                          <th className="text-left px-5 py-4 font-semibold text-[#101736]">
                            Date
                          </th>

                          <th className="text-left px-5 py-4 font-semibold text-[#101736]">
                            Category
                          </th>

                          <th className="text-left px-5 py-4 font-semibold text-[#101736]">
                            Question
                          </th>

                          <th className="text-left px-5 py-4 font-semibold text-[#101736]">
                            Your Answer
                          </th>

                          <th className="text-center px-5 py-4 font-semibold text-[#101736]">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {trainingHistory.map((item) => (

                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition"
                          >

                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                              {new Date(item.date).toLocaleDateString()}
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#EAF7FF] text-[#2188C7] text-xs font-semibold">
                                {item.category}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-slate-700 min-w-[300px] max-w-[500px]">
                              <p className="line-clamp-2">
                                {item.question}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-slate-700 min-w-[260px] max-w-[420px]">
                              <p className="whitespace-pre-wrap line-clamp-3">
                                {item.answer}
                              </p>
                              {item.feedback && (
                                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                  <span className="font-semibold">Admin Remark:</span>{" "}
                                  {item.feedback}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-center">
                              <StatusBadge item={item} />
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-slate-100">

                    {trainingHistory.map((item) => (

                      <div
                        key={item.id}
                        className="p-5"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#EAF7FF] text-[#2188C7] text-xs font-semibold">
                              {item.category}
                            </span>

                            <p className="text-xs text-slate-400 mt-2">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>

                          <StatusBadge item={item} />

                        </div>

                        <p className="text-sm font-medium text-[#101736] mt-4 leading-6">
                          {item.question}
                        </p>

                        <div className="bg-slate-50 rounded-xl p-3 mt-4">
                          <p className="text-xs text-slate-500">Your Answer</p>
                          <p className="text-sm text-[#101736] mt-1 whitespace-pre-wrap">
                            {item.answer}
                          </p>
                        </div>

                        {item.feedback && (
                          <div className="bg-amber-50 rounded-xl p-3 mt-3">
                            <p className="text-xs text-amber-700">Admin Remark</p>
                            <p className="text-sm text-amber-900 mt-1 whitespace-pre-wrap">
                              {item.feedback}
                            </p>
                          </div>
                        )}

                      </div>

                    ))}

                  </div>
                </>
              )}

            </div>

          </section>

          {/* Footer */}
          <div className="text-center pt-8 pb-3">
            <p className="text-xs text-slate-400">
              Employee Learning & Performance System
            </p>

            <p className="text-[11px] text-slate-300 mt-1">
              Internal Use Only
            </p>
          </div>

        </div>
      </main>
    </EmployeeProtection>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string | number;
  icon: string;
  iconClass: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-center justify-between gap-2">

        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {title}
        </p>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <p className="text-2xl sm:text-3xl font-bold text-[#101736] mt-4">
        {value}
      </p>

    </div>
  );
}

function MiniStat({
  label,
  value,
  className,
  valueClass,
}: {
  label: string;
  value: number;
  className: string;
  valueClass: string;
}) {
  return (
    <div className={`${className} rounded-xl p-3`}>

      <p className="text-[11px] text-slate-500">
        {label}
      </p>

      <p className={`text-xl font-bold mt-1 ${valueClass}`}>
        {value}
      </p>

    </div>
  );
}

function StatusBadge({
  item,
}: {
  item: TrainingHistory;
}) {
  if (item.reviewStatus === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending Review
      </span>
    );
  }

  if (item.reviewStatus === "REVIEWED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Reviewed
      </span>
    );
  }

  // if (item.score === 100) {
  //   return (
  //     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold whitespace-nowrap">
  //       <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
  //       Correct
  //     </span>
  //   );
  // }

  // return (
  //   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold whitespace-nowrap">
  //     <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
  //     Wrong
  //   </span>
  // );
}