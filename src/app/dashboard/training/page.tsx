"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import EmployeeProtection from "@/components/EmployeeProtection";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Question = {
  id: number;
  question: string;
  type: string;
  category: string;
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  points: number;
};

function TrainingPageContent() {
  const searchParams = useSearchParams();

  const category =
    searchParams.get("category") || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState({
    submitted: 0,
    total: 0,
  });

  const loadQuestions = async () => {
    if (!category) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/training?category=${encodeURIComponent(category)}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load training questions."
        );
        return;
      }

      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
      setError("Unable to load training questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category]);

  const currentQuestion = questions[currentIndex];

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    if (!answer.trim()) {
      setError("Please write your answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/training/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to submit answer."
        );
        return;
      }

      setSuccess("Answer submitted successfully.");

      const newSubmitted = results.submitted + 1;

      setResults({
        submitted: newSubmitted,
        total: questions.length,
      });

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
      } else {
        setCompleted(true);
        setAnswer("");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EmployeeProtection>
      <main className="min-h-screen bg-[#f5f8fc]">

        {/* HEADER */}
        <header className="bg-[#101736] text-white">
          <div className="max-w-4xl mx-auto px-6 py-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-[#73C2FB] font-bold">
                  Employee Learning
                </p>

                <h1 className="text-xl md:text-2xl font-bold mt-1">
                  {category || "Training"}
                </h1>

              </div>

              <a
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-semibold"
              >
                Dashboard
              </a>

            </div>

          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* NO CATEGORY */}
          {!category && !loading && (

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">

              <div className="text-4xl">
                📚
              </div>

              <h2 className="text-xl font-bold text-[#101736] mt-4">
                Select Training
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Please select a training category from your dashboard.
              </p>

              <a
                href="/dashboard"
                className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#101736] text-white font-semibold"
              >
                Back to Dashboard
              </a>

            </div>

          )}

          {/* LOADING */}
          {loading && (

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">

              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#73C2FB] rounded-full animate-spin mx-auto" />

              <p className="text-sm text-slate-500 mt-4">
                Loading questions...
              </p>

            </div>

          )}

          {/* ERROR */}
          {error && !loading && (

            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
              {error}
            </div>

          )}

          {/* COMPLETED */}
          {!loading && category && completed && (

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-[#101736] mt-5">
                Training Completed
              </h2>

              <p className="text-slate-500 mt-2">
                All available questions in this category have been submitted.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-7">

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Questions
                  </p>

                  <p className="text-2xl font-bold text-[#101736] mt-1">
                    {results.total}
                  </p>
                </div>

                <div className="bg-sky-50 rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Submitted
                  </p>

                  <p className="text-2xl font-bold text-[#1685c4] mt-1">
                    {results.submitted}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-7">

                <a
                  href="/dashboard/performance"
                  className="px-6 py-3 rounded-xl bg-[#101736] text-white font-semibold"
                >
                  My Performance
                </a>

                <a
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Dashboard
                </a>

              </div>

            </div>

          )}

          {/* NO QUESTIONS */}
          {!loading &&
            category &&
            !completed &&
            !currentQuestion &&
            !error && (

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">

                <div className="text-4xl">
                  🎉
                </div>

                <h2 className="text-xl font-bold text-[#101736] mt-4">
                  No New Questions
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  You have already completed all available questions in this category.
                </p>

                <a
                  href="/dashboard"
                  className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#101736] text-white font-semibold"
                >
                  Back to Dashboard
                </a>

              </div>

            )}

          {/* QUESTION */}
          {!loading &&
            currentQuestion &&
            !completed && (

              <div>

                {/* PROGRESS */}
                <div className="flex items-center justify-between mb-3">

                  <p className="text-sm font-semibold text-slate-600">
                    Question {currentIndex + 1} of{" "}
                    {questions.length}
                  </p>

                  <span className="text-xs font-bold text-[#1685c4]">
                    {Math.round(
                      ((currentIndex + 1) /
                        questions.length) *
                        100
                    )}
                    %
                  </span>

                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">

                  <div
                    className="h-full bg-[#73C2FB] rounded-full transition-all"
                    style={{
                      width: `${
                        ((currentIndex + 1) /
                          questions.length) *
                        100
                      }%`,
                    }}
                  />

                </div>

                {/* QUESTION CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                  <div className="bg-[#101736] px-6 py-5">

                    <div className="flex items-center justify-between gap-4">

                      <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-[#73C2FB]">
                        {category}
                      </span>

                      <span className="text-xs text-slate-300">
                        Answer required
                      </span>

                    </div>

                  </div>

                  <div className="p-6 md:p-8">

                    <h2 className="text-xl md:text-2xl font-bold text-[#101736] leading-8">
                      {currentQuestion.question}
                    </h2>

                    <div className="mt-8">

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Your Answer
                      </label>

                      <textarea
                        value={answer}
                        onChange={(e) =>
                          setAnswer(e.target.value)
                        }
                        rows={8}
                        placeholder="Write your answer here..."
                        disabled={submitting}
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#73C2FB] focus:border-[#73C2FB] resize-none leading-7 text-slate-700 disabled:bg-slate-50"
                      />

                      <p className="text-xs text-slate-400 mt-2">
                        Explain your answer clearly and professionally.
                      </p>

                    </div>

                    {success && (

                      <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                        ✓ {success}
                      </div>

                    )}

                    <button
                      onClick={submitAnswer}
                      disabled={submitting}
                      className="w-full mt-6 py-3.5 rounded-xl bg-[#101736] hover:bg-[#1d274d] text-white font-bold transition disabled:opacity-50"
                    >
                      {submitting
                        ? "Submitting Answer..."
                        : currentIndex + 1 === questions.length
                        ? "Submit & Finish"
                        : "Submit Answer & Continue"}
                    </button>

                  </div>

                </div>

              </div>

            )}

        </div>

      </main>
    </EmployeeProtection>
  );
}

export default function TrainingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f8fc] flex items-center justify-center">
          <p className="text-sm text-slate-500">Loading training...</p>
        </main>
      }
    >
      <TrainingPageContent />
    </Suspense>
  );
}