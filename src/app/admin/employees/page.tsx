"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import AdminProtection from "@/components/AdminProtection";
import { useEffect, useState } from "react";

type Employee = {
  id: number;
  name: string;
  email: string;
  role: "EMPLOYEE";
  createdAt: string;
};

type FormData = {
  name: string;
  email: string;
  password: string;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  password: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>(emptyForm);

  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [message, setMessage] = useState("");

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const response = await fetch("/api/employees");
      const data = await response.json();

      if (response.ok) {
        setEmployees(data.employees || []);
      } else {
        setMessage(data.message || "Failed to load employees.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load employees.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingId(employee.id);

    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
    });

    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
  };

  const handleSave = async () => {
    setMessage("");

    if (!formData.name.trim()) {
      setMessage("Please enter employee name.");
      return;
    }

    if (!formData.email.trim()) {
      setMessage("Please enter employee email.");
      return;
    }

    if (!editingId && !formData.password.trim()) {
      setMessage("Please enter password.");
      return;
    }

    if (!editingId && formData.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? {
          id: editingId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
        : formData;

      const response = await fetch("/api/employees", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      setMessage(
        editingId
          ? "Employee updated successfully."
          : "Employee created successfully."
      );

      setFormData(emptyForm);
      setEditingId(null);

      await loadEmployees();

      setTimeout(() => {
        setShowForm(false);
        setMessage("");
      }, 800);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete employee.");
        return;
      }

      await loadEmployees();
    } catch (error) {
      console.error(error);
      alert("Unable to delete employee.");
    }
  };

  return (
    <AdminProtection>
      <main className="min-h-screen bg-[#f5f8fc] text-[#101736]">

        {/* TOP HEADER */}
        <header className="bg-[#101736] text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-[#73C2FB] flex items-center justify-center text-[#101736] shadow-lg">
                  <svg
                    width="25"
                    height="25"
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

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#73C2FB] font-semibold">
                    Admin Panel
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold mt-1">
                    Employee Management
                  </h1>

                  <p className="text-sm text-slate-300 mt-1">
                    Manage employees and training access
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center justify-center gap-2 bg-[#73C2FB] hover:bg-[#4AA8E8] text-[#101736] px-5 py-3 rounded-xl font-bold transition shadow-lg"
              >
                <span className="text-xl leading-none">+</span>
                Add Employee
              </button>

            </div>

          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Total Employees
                  </p>

                  <h2 className="text-3xl font-bold text-[#101736] mt-2">
                    {employees.length}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Registered employees
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#4AA8E8] flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
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

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Employee Access
                  </p>

                  <h2 className="text-3xl font-bold text-[#101736] mt-2">
                    {employees.length}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Training system users
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Latest Employee
                  </p>

                  <h2 className="text-lg font-bold text-[#101736] mt-2 truncate max-w-[190px]">
                    {employees.length > 0
                      ? [...employees].sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )[0].name
                      : "No employees"}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Recently added to the system
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 8v4l3 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>

              </div>
            </div>

          </div>

          {/* ADD / EDIT FORM */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 overflow-hidden">

              <div className="bg-[#101736] px-6 py-5 flex items-center justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#73C2FB] font-semibold">
                    Employee Account
                  </p>

                  <h2 className="text-xl font-bold text-white mt-1">
                    {editingId
                      ? "Edit Employee"
                      : "Add New Employee"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  ✕
                </button>

              </div>

              <div className="p-6">

                {message && (
                  <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-[#101736] mb-2">
                      Employee Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter employee name"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm outline-none transition focus:border-[#73C2FB] focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-semibold text-[#101736] mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="employee@heeraagro.com"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm outline-none transition focus:border-[#73C2FB] focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-sm font-semibold text-[#101736] mb-2">
                      {editingId
                        ? "New Password"
                        : "Password"}
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={
                        editingId
                          ? "Leave blank to keep current password"
                          : "Enter password"
                      }
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm outline-none transition focus:border-[#73C2FB] focus:ring-4 focus:ring-sky-100"
                    />

                    {!editingId && (
                      <p className="text-xs text-slate-400 mt-2">
                        Minimum 6 characters
                      </p>
                    )}
                  </div>

                  {/* ROLE */}
                  <div>
                    <label className="block text-sm font-semibold text-[#101736] mb-2">
                      Account Role
                    </label>

                    <div className="w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#73C2FB] flex items-center justify-center text-[#101736] text-sm font-bold">
                        E
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-[#101736]">
                          Employee
                        </p>
                        <p className="text-xs text-slate-400">
                          Training system access
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* FORM BUTTONS */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-6 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-[#101736] hover:bg-[#1a2245] text-white font-semibold transition disabled:opacity-60"
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                        ? "Update Employee"
                        : "Create Employee"}
                  </button>

                </div>

              </div>
            </div>
          )}

          {/* EMPLOYEE LIST */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* LIST HEADER */}
            <div className="px-6 py-5 border-b border-slate-200">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <div className="flex items-center gap-3">

                    <h2 className="text-xl font-bold text-[#101736]">
                      Employees
                    </h2>

                    <span className="px-2.5 py-1 rounded-full bg-sky-50 text-[#4AA8E8] text-xs font-bold">
                      {employees.length}
                    </span>

                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    View and manage employee accounts
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadEmployees}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#101736] hover:bg-slate-50 transition"
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
                  Refresh
                </button>

              </div>

            </div>

            {/* LOADING */}
            {loadingEmployees ? (
              <div className="py-20 text-center">

                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#73C2FB] rounded-full animate-spin mx-auto" />

                <p className="text-sm text-slate-500 mt-4">
                  Loading employees...
                </p>

              </div>
            ) : employees.length === 0 ? (
              /* EMPTY */
              <div className="py-20 text-center px-6">

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

                <h3 className="text-lg font-bold text-[#101736] mt-5">
                  No Employees Yet
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Create your first employee account to get started.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#101736] text-white text-sm font-semibold hover:bg-[#1a2245]"
                >
                  + Add Employee
                </button>

              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-[#f8fafc]">
                      <tr>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">
                          Employee
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">
                          Email
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">
                          Role
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">
                          Created
                        </th>

                        <th className="text-right px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {employees.map((employee) => {

                        const initial =
                          employee.name
                            .charAt(0)
                            .toUpperCase();

                        return (
                          <tr
                            key={employee.id}
                            className="border-t border-slate-100 hover:bg-slate-50/70 transition"
                          >

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="w-11 h-11 rounded-xl bg-[#101736] text-[#73C2FB] flex items-center justify-center font-bold">
                                  {initial}
                                </div>

                                <div>
                                  <p className="font-bold text-[#101736]">
                                    {employee.name}
                                  </p>

                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Employee ID #{employee.id}
                                  </p>
                                </div>

                              </div>

                            </td>

                            <td className="px-6 py-5">
                              <span className="text-sm text-slate-600">
                                {employee.email}
                              </span>
                            </td>

                            <td className="px-6 py-5">

                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 text-[#1685c4] text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#73C2FB]" />
                                Employee
                              </span>

                            </td>

                            <td className="px-6 py-5">
                              <span className="text-sm text-slate-500">
                                {new Date(
                                  employee.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </td>

                            <td className="px-6 py-5">

                              <div className="flex items-center justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(employee)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-[#101736] text-sm font-semibold hover:bg-slate-200 transition"
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(employee.id)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                  </svg>
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden divide-y divide-slate-100">

                  {employees.map((employee) => {

                    const initial =
                      employee.name
                        .charAt(0)
                        .toUpperCase();

                    return (
                      <div
                        key={employee.id}
                        className="p-5"
                      >

                        <div className="flex items-start gap-3">

                          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#101736] text-[#73C2FB] flex items-center justify-center font-bold">
                            {initial}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div>
                                <h3 className="font-bold text-[#101736]">
                                  {employee.name}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                  ID #{employee.id}
                                </p>
                              </div>

                              <span className="shrink-0 px-2.5 py-1 rounded-full bg-sky-50 text-[#1685c4] text-[11px] font-bold">
                                Employee
                              </span>

                            </div>

                            <p className="text-sm text-slate-600 mt-3 break-all">
                              {employee.email}
                            </p>

                            <p className="text-xs text-slate-400 mt-2">
                              Created{" "}
                              {new Date(
                                employee.createdAt
                              ).toLocaleDateString()}
                            </p>

                            <div className="flex gap-2 mt-4">

                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(employee)
                                }
                                className="flex-1 px-3 py-2.5 rounded-lg bg-slate-100 text-[#101736] text-sm font-semibold"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(employee.id)
                                }
                                className="flex-1 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold"
                              >
                                Delete
                              </button>

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              </>
            )}

          </section>

          {/* FOOTER INFO */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 px-1">

            <p className="text-xs text-slate-400">
              Employee accounts are used for internal training.
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