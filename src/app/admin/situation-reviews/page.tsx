"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import AdminProtection from "@/components/AdminProtection";
import { useEffect, useState } from "react";

type Review = {
  id: number;
  employeeId: number;
  questionId: number;
  answer: string;
  score: number;
  points: number;
  feedback: string | null;
  reviewStatus: string | null;
  reviewedAt: string | null;
  date: string;

  employee: {
    id: number;
    name: string;
    email: string;
  };

  question: {
    id: number;
    question: string;
    category: string;
    expectedAnswer: string | null;
    explanation: string | null;
    points: number;
  };
};

export default function SituationReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPoints, setSelectedPoints] = useState<
    Record<number, number>
  >({});

  const [feedback, setFeedback] = useState<
    Record<number, string>
  >({});

  const [submittingId, setSubmittingId] = useState<number | null>(
    null
  );

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/situation-reviews",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          window.location.href = "/";
          return;
        }

        setError(
          data.message || "Failed to load situation reviews."
        );

        return;
      }

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Situation reviews error:", error);

      setError(
        "Unable to load situation reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleEvaluation = async (reviewId: number) => {
    const points = selectedPoints[reviewId];

    if (points === undefined) {
      setError("Please select points before submitting.");
      return;
    }

    setSubmittingId(reviewId);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/situation-reviews",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attemptId: reviewId,
            points,
            feedback:
              feedback[reviewId]?.trim() || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to evaluate situation answer."
        );

        return;
      }

      // Remove reviewed item from the pending list
      setReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );

      // Remove stored form values
      setSelectedPoints((prev) => {
        const updated = { ...prev };
        delete updated[reviewId];
        return updated;
      });

      setFeedback((prev) => {
        const updated = { ...prev };
        delete updated[reviewId];
        return updated;
      });
    } catch (error) {
      console.error(
        "Evaluation submit error:",
        error
      );

      setError(
        "Unable to submit evaluation."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading situation reviews...
        </p>
      </main>
    );
  }

  return (
    <AdminProtection>
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Situation Reviews
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Review employee situation-based answers
              </p>
            </div>

            <button
              type="button"
              onClick={loadReviews}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium"
            >
              Refresh
            </button>

          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* No Reviews */}
        {reviews.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">

            <div className="text-4xl mb-4">
              ✓
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No Pending Reviews
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no situation answers waiting for review.
            </p>

          </div>
        )}

        {/* Reviews */}
        <div className="space-y-6">

          {reviews.map((review) => (

            <div
              key={review.id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >

              {/* Review Header */}
              <div className="border-b bg-gray-50 px-6 py-5">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <h2 className="text-lg font-semibold text-gray-900">
                      {review.employee.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {review.employee.email}
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {review.question.category}
                    </span>

                    <span className="inline-flex px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                      Pending Review
                    </span>

                  </div>

                </div>

              </div>

              {/* Review Content */}
              <div className="p-6 space-y-6">

                {/* Question */}
                <div>

                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    QUESTION
                  </p>

                  <div className="bg-gray-50 border rounded-lg p-4">
                    <p className="text-gray-900 leading-relaxed">
                      {review.question.question}
                    </p>
                  </div>

                </div>

                {/* Employee Answer */}
                <div>

                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    EMPLOYEE ANSWER
                  </p>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">

                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {review.answer}
                    </p>

                  </div>

                </div>

                {/* Expected Answer */}
                <div>

                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    EXPECTED ANSWER
                  </p>

                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">

                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {review.question.expectedAnswer ||
                        "No expected answer provided."}
                    </p>

                  </div>

                </div>

                {/* Explanation */}
                <div>

                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    EXPLANATION
                  </p>

                  <div className="bg-gray-50 border rounded-lg p-4">

                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {review.question.explanation ||
                        "No explanation provided."}
                    </p>

                  </div>

                </div>

                {/* Evaluation */}
                <div className="border-t pt-6">

                  <h3 className="text-lg font-semibold text-gray-900">
                    Admin Evaluation
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Select points based on the quality of the employee&apos;s answer.
                  </p>

                  {/* Points */}
                  <div className="mt-5">

                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Points
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                      {[20, 10, 5, 0].map((points) => (

                        <button
                          key={points}
                          type="button"
                          onClick={() => {
                            setSelectedPoints((prev) => ({
                              ...prev,
                              [review.id]: points,
                            }));

                            setError("");
                          }}
                          className={`border rounded-lg px-4 py-3 font-semibold transition ${
                            selectedPoints[review.id] ===
                            points
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-gray-50"
                          }`}
                        >
                          {points} Points
                        </button>

                      ))}

                    </div>

                  </div>

                  {/* Feedback */}
                  <div className="mt-5">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback
                    </label>

                    <textarea
                      value={feedback[review.id] || ""}
                      onChange={(e) => {
                        setFeedback((prev) => ({
                          ...prev,
                          [review.id]: e.target.value,
                        }));

                        setError("");
                      }}
                      rows={5}
                      placeholder="Enter feedback for the employee..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                  </div>

                  {/* Submit */}
                  <div className="flex justify-end mt-5">

                    <button
                      type="button"
                      onClick={() =>
                        handleEvaluation(review.id)
                      }
                      disabled={
                        submittingId === review.id
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingId === review.id
                        ? "Submitting..."
                        : "Submit Evaluation"}
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
    </AdminProtection>
  );
  
}