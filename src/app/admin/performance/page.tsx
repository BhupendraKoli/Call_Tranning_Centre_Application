"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import AdminProtection from "@/components/AdminProtection";
import { useEffect, useState } from "react";

type EmployeePerformance = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  totalPoints: number;
  level: string;
  questionsCompleted: number;
  // correctAnswers: number;
  // wrongAnswers: number;
  averageScore: number;
};

type EmployeeAttempt = {
  id: number;
  answer: string;
  feedback: string | null;
  reviewStatus: string | null;
  reviewedAt: string | null;
  date: string;
  question: {
    id: number;
    question: string;
    category: string;
    type: string;
  };
};

export default function AdminPerformancePage() {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeePerformance | null>(null);
  const [attempts, setAttempts] = useState<EmployeeAttempt[]>([]);
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [savingAttemptId, setSavingAttemptId] = useState<number | null>(null);

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/performance", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          window.location.href = "/";
          return;
        }

        setError(
          data.message || "Failed to load employee performance."
        );

        return;
      }

      setEmployees(data.employees || []);
      if (selectedEmployee) {
        const detailResponse = await fetch(
          `/api/admin/performance?employeeId=${selectedEmployee.id}`,
          { cache: "no-store" }
        );
        const detailData = await detailResponse.json();
        if (detailResponse.ok) {
          setAttempts(detailData.attempts || []);
        }
      }
    } catch (error) {
      console.error("Admin performance error:", error);
      setError("Unable to load employee performance.");
    } finally {
      setLoading(false);
    }
  };

  const openEmployee = async (employee: EmployeePerformance) => {
    setSelectedEmployee(employee);
    setAttempts([]);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/performance?employeeId=${employee.id}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to load employee answers.");
        return;
      }
      const employeeAttempts = data.attempts || [];
      setAttempts(employeeAttempts);
      setRemarks(
        Object.fromEntries(
          employeeAttempts.map((attempt: EmployeeAttempt) => [
            attempt.id,
            attempt.feedback || "",
          ])
        )
      );
    } catch (error) {
      console.error("Employee answers error:", error);
      setError("Unable to load employee answers.");
    }
  };

  const saveRemark = async (attemptId: number) => {
    setSavingAttemptId(attemptId);
    setError("");
    try {
      const response = await fetch("/api/admin/performance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          feedback: remarks[attemptId] || "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to save remark.");
        return;
      }
      setAttempts((current) =>
        current.map((attempt) =>
          attempt.id === attemptId
            ? {
                ...attempt,
                feedback: data.attempt.feedback,
                reviewStatus: data.attempt.reviewStatus,
                reviewedAt: data.attempt.reviewedAt,
              }
            : attempt
        )
      );
    } catch (error) {
      console.error("Save remark error:", error);
      setError("Unable to save remark.");
    } finally {
      setSavingAttemptId(null);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  const totalEmployees = employees.length;

  const totalPoints = employees.reduce(
    (sum, employee) => sum + employee.totalPoints,
    0
  );

  const totalCompleted = employees.reduce(
    (sum, employee) => sum + employee.questionsCompleted,
    0
  );

  const averageScore =
    employees.length > 0
      ? Math.round(
          employees.reduce(
            (sum, employee) => sum + employee.averageScore,
            0
          ) / employees.length
        )
      : 0;

  return (
    <AdminProtection>
      <main className="min-h-screen bg-[#f5f8fc] text-[#101736]">

        {/* HEADER */}
        <header className="bg-[#101736] text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-[#73C2FB] flex items-center justify-center text-[#101736] shadow-lg">

                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m7 16 4-5 3 3 5-7" />
                  </svg>

                </div>

                <div>

                  <p className="text-xs uppercase tracking-[0.18em] text-[#73C2FB] font-semibold">
                    Admin Panel
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold mt-1">
                    Employee Performance
                  </h1>

                  <p className="text-sm text-slate-300 mt-1">
                    Monitor employee training progress and scores
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={loadPerformance}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-[#73C2FB] hover:bg-[#4AA8E8] text-[#101736] px-5 py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-60"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
                </svg>

                {loading ? "Refreshing..." : "Refresh"}

              </button>

            </div>

          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {/* Employees */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 font-medium">
                    Total Employees
                  </p>

                  <h2 className="text-3xl font-bold text-[#101736] mt-2">
                    {totalEmployees}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Training users
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#4AA8E8] flex items-center justify-center">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>

                </div>

              </div>

            </div>

            {/* Points */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 font-medium">
                    Total Points
                  </p>

                  <h2 className="text-3xl font-bold text-[#101736] mt-2">
                    {totalPoints}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Earned by employees
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v10" />
                    <path d="M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2" />
                  </svg>

                </div>

              </div>

            </div>

            {/* Completed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 font-medium">
                    Questions Completed
                  </p>

                  <h2 className="text-3xl font-bold text-[#101736] mt-2">
                    {totalCompleted}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Across all employees
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>

                </div>

              </div>

            </div>

            {/* Average */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 font-medium">
                    Average Score
                  </p>

                  <h2 className="text-3xl font-bold text-[#101736] mt-2">
                    {averageScore}%
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Employee average
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v18" />
                    <path d="M17 7H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H6" />
                  </svg>

                </div>

              </div>

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">

              <div className="w-8 h-8 shrink-0 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                !
              </div>

              <div>
                <p className="text-sm font-bold text-red-700">
                  Unable to load performance
                </p>

                <p className="text-sm text-red-600 mt-0.5">
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* NO EMPLOYEES */}
          {employees.length === 0 && !error && !loading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">

                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>

              </div>

              <h2 className="text-xl font-bold text-[#101736] mt-5">
                No Employees Found
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                There are currently no employees available.
              </p>

            </div>
          )}

          {/* EMPLOYEE PERFORMANCE */}
          {employees.length > 0 && (

            <section>

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h2 className="text-xl font-bold text-[#101736]">
                    Employee Overview
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Individual training performance
                  </p>
                </div>

                <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500">
                  {employees.length} Employee
                  {employees.length !== 1 ? "s" : ""}
                </span>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {employees.map((employee) => {

                  const initial =
                    employee.name
                      .charAt(0)
                      .toUpperCase();

                  const score = Math.min(
                    Math.max(employee.averageScore, 0),
                    100
                  );

                  return (

                    <button
                      type="button"
                      onClick={() => openEmployee(employee)}
                      key={employee.id}
                      className="text-left w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
                    >

                      {/* CARD HEADER */}
                      <div className="p-6 border-b border-slate-100">

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex items-center gap-4 min-w-0">

                            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#101736] text-[#73C2FB] flex items-center justify-center text-lg font-bold">
                              {initial}
                            </div>

                            <div className="min-w-0">

                              <h3 className="text-lg font-bold text-[#101736] truncate">
                                {employee.name}
                              </h3>

                              <p className="text-sm text-slate-500 truncate mt-0.5">
                                {employee.email}
                              </p>

                            </div>

                          </div>

                          <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full bg-sky-50 text-[#1685c4] text-xs font-bold">
                            {employee.level}
                          </span>

                        </div>

                      </div>

                      {/* MAIN SCORE */}
                      <div className="p-6">

                        <div className="flex items-end justify-between mb-3">

                          <div>

                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                              Average Score
                            </p>

                            <p className="text-3xl font-bold text-[#101736] mt-1">
                              {employee.averageScore}%
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-xs text-slate-400">
                              Total Points
                            </p>

                            <p className="text-xl font-bold text-[#101736] mt-1">
                              {employee.totalPoints}
                            </p>

                          </div>

                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-[#73C2FB] rounded-full transition-all"
                            style={{
                              width: `${score}%`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between mt-2">

                          <span className="text-xs text-slate-400">
                            0%
                          </span>

                          <span className="text-xs font-medium text-slate-500">
                            Performance
                          </span>

                          <span className="text-xs text-slate-400">
                            100%
                          </span>

                        </div>

                      </div>

                      {/* STATS */}
                      <div className="px-6 pb-6">

                        <div className="grid grid-cols-3 gap-3">

                          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                            <p className="text-xs text-slate-400">
                              Completed
                            </p>

                            <p className="text-xl font-bold text-[#101736] mt-1">
                              {employee.questionsCompleted}
                            </p>

                          </div>

                          {/* <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

                            <p className="text-xs text-emerald-600">
                              Correct
                            </p>

                            <p className="text-xl font-bold text-emerald-700 mt-1">
                              {employee.correctAnswers}
                            </p>

                          </div> */}

                          {/* <div className="rounded-xl bg-red-50 border border-red-100 p-4">

                            <p className="text-xs text-red-500">
                              Wrong
                            </p>

                            <p className="text-xl font-bold text-red-600 mt-1">
                              {employee.wrongAnswers}
                            </p>

                          </div> */}

                        </div>

                      </div>

                      {/* CARD FOOTER */}
                      <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <span className="w-2 h-2 rounded-full bg-[#73C2FB]" />

                          <span className="text-xs font-medium text-slate-500">
                            Training Performance
                          </span>

                        </div>

                        <span className="text-xs text-slate-400">
                          ID #{employee.id}
                        </span>

                      </div>

                    </button>

                  );
                })}

              </div>

            </section>

          )}

          {selectedEmployee && (
            <section className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#101736]">
                    {selectedEmployee.name}&apos;s Answers
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Review category, question and employee answer. Correct answers and points are not shown here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="text-sm font-semibold text-slate-500 hover:text-[#101736]"
                >
                  Close
                </button>
              </div>

              {attempts.length === 0 ? (
                <p className="p-8 text-sm text-slate-500">No answers submitted yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attempts.map((attempt) => (
                    <div key={attempt.id} className="p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EAF7FF] text-[#2188C7] text-xs font-semibold">
                          {attempt.question.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(attempt.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#101736]">
                        {attempt.question.question}
                      </h3>
                      <div className="mt-3 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Employee Answer
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {attempt.answer}
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-[#101736] mb-2">
                          Admin Remark
                        </label>
                        <textarea
                          rows={3}
                          value={remarks[attempt.id] || ""}
                          onChange={(event) =>
                            setRemarks((current) => ({
                              ...current,
                              [attempt.id]: event.target.value,
                            }))
                          }
                          placeholder="Write a remark for this employee..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4AA8E8] focus:ring-2 focus:ring-sky-100"
                        />
                        <div className="mt-3 flex items-center justify-between gap-3">
                          {attempt.feedback && (
                            <span className="text-xs font-semibold text-green-700">
                              Remark saved
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => saveRemark(attempt.id)}
                            disabled={savingAttemptId === attempt.id}
                            className="ml-auto rounded-lg bg-[#101736] px-4 py-2 text-sm font-semibold text-white hover:bg-[#18204A] disabled:opacity-60"
                          >
                            {savingAttemptId === attempt.id ? "Saving..." : "Save Remark"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* FOOTER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 px-1">

            <p className="text-xs text-slate-400">
              Employee performance is based on completed training activities.
            </p>

            <p className="text-xs font-medium text-slate-400">
              Heera Agro • Training System
            </p>

          </div>

        </div>
      </main>
    </AdminProtection>
  );
}