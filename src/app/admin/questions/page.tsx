"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import AdminProtection from "@/components/AdminProtection";
import { useEffect, useState } from "react";

type Question = {
  id: number;
  question: string;
  type: string;
  category: string;
  status: string;
  createdAt: string;
};

const categories = [
  {
    name: "Product Knowledge",
    icon: "📦",
    description: "Products, features, usage and product knowledge",
  },
  {
    name: "Customer Handling",
    icon: "🤝",
    description: "Customer communication and problem handling",
  },
  {
    name: "Sales",
    icon: "💼",
    description: "Sales process, conversion and communication",
  },
  {
    name: "Technical",
    icon: "⚙️",
    description: "Technical knowledge and product solutions",
  },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const [questionText, setQuestionText] = useState("");
  const [bulkText, setBulkText] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/questions", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load questions.");
        return;
      }

      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
      setError("Unable to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const resetForm = () => {
    setQuestionText("");
    setEditingId(null);
    setShowAdd(false);
  };

  const addQuestion = async () => {
    if (!selectedCategory) {
      setError("Please select a category first.");
      return;
    }

    if (!questionText.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionText.trim(),
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add question.");
        return;
      }

      setMessage("Question added successfully.");
      resetForm();
      await loadQuestions();
    } catch (error) {
      console.error(error);
      setError("Unable to add question.");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = async () => {
    if (!editingId) return;

    if (!questionText.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/questions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          question: questionText.trim(),
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update question.");
        return;
      }

      setMessage("Question updated successfully.");
      resetForm();
      await loadQuestions();
    } catch (error) {
      console.error(error);
      setError("Unable to update question.");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/questions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete question.");
        return;
      }

      setMessage("Question deleted successfully.");
      await loadQuestions();
    } catch (error) {
      console.error(error);
      setError("Unable to delete question.");
    }
  };

  const toggleStatus = async (
    id: number,
    currentStatus: string
  ) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/questions/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status:
            currentStatus === "ACTIVE"
              ? "INACTIVE"
              : "ACTIVE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update status.");
        return;
      }

      setMessage("Question status updated.");
      await loadQuestions();
    } catch (error) {
      console.error(error);
      setError("Unable to update question status.");
    }
  };

  const editQuestion = (question: Question) => {
    setSelectedCategory(question.category);
    setQuestionText(question.question);
    setEditingId(question.id);
    setShowAdd(true);
    setShowBulk(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const parseBulkQuestions = () => {
    return bulkText
      .split(/\n+/)
      .map((line) =>
        line
          .replace(/^\s*\d+[\.\)\-:]\s*/, "")
          .trim()
      )
      .filter((line) => line.length > 0);
  };

  const addBulkQuestions = async () => {
    if (!selectedCategory) {
      setError("Please select a category first.");
      return;
    }

    const parsedQuestions = parseBulkQuestions();

    if (parsedQuestions.length === 0) {
      setError("Please paste at least one question.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: parsedQuestions.map((question) => ({
            question,
            category: selectedCategory,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add bulk questions.");
        return;
      }

      setMessage(
        `${data.questions?.length || parsedQuestions.length} questions added successfully.`
      );

      setBulkText("");
      setShowBulk(false);

      await loadQuestions();
    } catch (error) {
      console.error(error);
      setError("Unable to add bulk questions.");
    } finally {
      setSaving(false);
    }
  };

  const categoryQuestions = questions.filter(
    (question) => question.category === selectedCategory
  );

  return (
    <AdminProtection>
      <main className="min-h-screen bg-[#f5f8fc]">

        {/* HEADER */}
        <header className="bg-[#101736] text-white">
          <div className="max-w-7xl mx-auto px-6 py-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#73C2FB] font-bold">
                  Admin Panel
                </p>

                <h1 className="text-2xl md:text-3xl font-bold mt-1">
                  Question Management
                </h1>

                <p className="text-sm text-slate-300 mt-1">
                  Create and manage employee training questions
                </p>
              </div>

              <button
                onClick={loadQuestions}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-semibold transition"
              >
                ↻ Refresh
              </button>

            </div>

          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* MESSAGES */}
          {message && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-4 text-sm font-medium">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
              ! {error}
            </div>
          )}

          {/* CATEGORY VIEW */}
          {!selectedCategory && (

            <div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#101736]">
                  Training Categories
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Select a category to manage its questions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {categories.map((category) => {

                  const count = questions.filter(
                    (question) =>
                      question.category === category.name
                  ).length;

                  const activeCount = questions.filter(
                    (question) =>
                      question.category === category.name &&
                      question.status === "ACTIVE"
                  ).length;

                  return (
                    <button
                      key={category.name}
                      onClick={() =>
                        setSelectedCategory(category.name)
                      }
                      className="text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#73C2FB] transition group"
                    >

                      <div className="flex items-start justify-between">

                        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl group-hover:bg-[#73C2FB]/20 transition">
                          {category.icon}
                        </div>

                        <span className="text-[#4AA8E8] text-2xl">
                          →
                        </span>

                      </div>

                      <h3 className="text-lg font-bold text-[#101736] mt-5">
                        {category.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {category.description}
                      </p>

                      <div className="flex gap-3 mt-5">

                        <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                          {count} Questions
                        </span>

                        <span className="px-3 py-1.5 bg-emerald-50 rounded-lg text-xs font-semibold text-emerald-700">
                          {activeCount} Active
                        </span>

                      </div>

                    </button>
                  );
                })}

              </div>

            </div>

          )}

          {/* SELECTED CATEGORY */}
          {selectedCategory && (

            <div>

              {/* TOP */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">

                <div className="flex items-center gap-4">

                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      resetForm();
                      setShowBulk(false);
                    }}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-lg"
                  >
                    ←
                  </button>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-[#4AA8E8]">
                      Category
                    </p>

                    <h2 className="text-2xl font-bold text-[#101736]">
                      {selectedCategory}
                    </h2>

                  </div>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() => {
                      resetForm();
                      setShowAdd(true);
                      setShowBulk(false);
                    }}
                    className="px-5 py-3 rounded-xl bg-[#101736] hover:bg-[#1d274d] text-white font-semibold transition"
                  >
                    + Add Question
                  </button>

                  <button
                    onClick={() => {
                      setShowBulk(true);
                      setShowAdd(false);
                      setError("");
                      setMessage("");
                    }}
                    className="px-5 py-3 rounded-xl bg-[#73C2FB] hover:bg-[#4AA8E8] text-[#101736] font-bold transition"
                  >
                    + Bulk Add
                  </button>

                </div>

              </div>

              {/* ADD SINGLE QUESTION */}
              {showAdd && (

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">

                  <div className="flex items-center justify-between mb-5">

                    <div>
                      <h3 className="text-lg font-bold text-[#101736]">
                        {editingId
                          ? "Edit Question"
                          : "Add New Question"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Employee will answer this question using a text box.
                      </p>
                    </div>

                    <button
                      onClick={resetForm}
                      className="text-slate-400 hover:text-slate-700 text-xl"
                    >
                      ×
                    </button>

                  </div>

                  <div className="mb-5">

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category
                    </label>

                    <input
                      value={selectedCategory}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Question
                    </label>

                    <textarea
                      value={questionText}
                      onChange={(e) =>
                        setQuestionText(e.target.value)
                      }
                      rows={5}
                      placeholder="Enter your training question..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#73C2FB] focus:border-[#73C2FB] resize-none"
                    />

                  </div>

                  <div className="flex justify-end gap-3 mt-5">

                    <button
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={
                        editingId
                          ? updateQuestion
                          : addQuestion
                      }
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-[#101736] hover:bg-[#1d274d] text-white font-semibold disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Question"
                        : "Add Question"}
                    </button>

                  </div>

                </div>

              )}

              {/* BULK ADD */}
              {showBulk && (

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">

                  <div className="flex items-start justify-between gap-4 mb-5">

                    <div>

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-xl">
                          📋
                        </div>

                        <div>

                          <h3 className="text-lg font-bold text-[#101736]">
                            Bulk Add Questions
                          </h3>

                          <p className="text-sm text-slate-500">
                            Add multiple questions at once
                          </p>

                        </div>

                      </div>

                    </div>

                    <button
                      onClick={() => {
                        setShowBulk(false);
                        setBulkText("");
                      }}
                      className="text-slate-400 hover:text-slate-700 text-xl"
                    >
                      ×
                    </button>

                  </div>

                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-5">

                    <p className="text-sm font-bold text-[#101736]">
                      Selected Category: {selectedCategory}
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Paste one question per line. Numbering is optional.
                    </p>

                  </div>

                  <textarea
                    value={bulkText}
                    onChange={(e) =>
                      setBulkText(e.target.value)
                    }
                    rows={12}
                    placeholder={`1. ठिबक सिंचनाचे मुख्य फायदे कोणते आहेत?

2. शेतामध्ये फिल्टरचा वापर का केला जातो?

3. PRV चा उपयोग काय आहे?

4. ग्राहकाने उत्पादनाबद्दल माहिती विचारल्यास तुम्ही कसे उत्तर द्याल?`}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#73C2FB] focus:border-[#73C2FB] resize-y font-medium leading-7"
                  />

                  {bulkText.trim() && (

                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">

                      <div className="flex items-center justify-between">

                        <span className="text-sm font-semibold text-slate-600">
                          Questions detected
                        </span>

                        <span className="text-lg font-bold text-[#101736]">
                          {parseBulkQuestions().length}
                        </span>

                      </div>

                    </div>

                  )}

                  <div className="flex justify-end gap-3 mt-5">

                    <button
                      onClick={() => {
                        setShowBulk(false);
                        setBulkText("");
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={addBulkQuestions}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-[#73C2FB] hover:bg-[#4AA8E8] text-[#101736] font-bold disabled:opacity-50"
                    >
                      {saving
                        ? "Adding..."
                        : "Add All Questions"}
                    </button>

                  </div>

                </div>

              )}

              {/* QUESTIONS */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

                  <div>

                    <h3 className="text-lg font-bold text-[#101736]">
                      Questions
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {categoryQuestions.length} questions in this category
                    </p>

                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-sky-50 text-[#1685c4] text-xs font-bold">
                    {categoryQuestions.filter(
                      (q) => q.status === "ACTIVE"
                    ).length} Active
                  </span>

                </div>

                {loading ? (

                  <div className="p-10 text-center text-slate-500">
                    Loading questions...
                  </div>

                ) : categoryQuestions.length === 0 ? (

                  <div className="p-12 text-center">

                    <div className="text-4xl">
                      📝
                    </div>

                    <h3 className="text-lg font-bold text-[#101736] mt-4">
                      No Questions Yet
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Add your first question to this category.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {categoryQuestions.map((question, index) => (

                      <div
                        key={question.id}
                        className="p-6 hover:bg-slate-50/70 transition"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                          <div className="flex gap-4 min-w-0">

                            <div className="w-9 h-9 shrink-0 rounded-lg bg-[#101736] text-[#73C2FB] flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>

                            <div>

                              <p className="text-base font-semibold text-[#101736] leading-7">
                                {question.question}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-3">

                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    question.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {question.status}
                                </span>

                                <span className="px-2.5 py-1 rounded-full bg-sky-50 text-[#1685c4] text-xs font-bold">
                                  Answer Box
                                </span>

                              </div>

                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2 shrink-0">

                            <button
                              onClick={() =>
                                editQuestion(question)
                              }
                              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white hover:border-[#73C2FB]"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                toggleStatus(
                                  question.id,
                                  question.status
                                )
                              }
                              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white"
                            >
                              {question.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              onClick={() =>
                                deleteQuestion(question.id)
                              }
                              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

          )}

        </div>

      </main>
    </AdminProtection>
  );
}