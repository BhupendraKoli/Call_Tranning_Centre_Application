"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin";
        return;
      }

      if (data.user?.role === "EMPLOYEE") {
        window.location.href = "/dashboard";
        return;
      }

      setError("Invalid user role.");
      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] flex">

      {/* =========================================================
          LEFT SIDE - BRANDING
      ========================================================= */}
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#101736] text-white">

        {/* Decorative Background */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#73C2FB]/10" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-[#73C2FB]/10" />

        <div className="absolute -bottom-48 left-1/4 w-[600px] h-[600px] rounded-full bg-[#73C2FB]/5" />

        {/* Small Decorative Circles */}
        <div className="absolute top-24 right-24 h-4 w-4 rounded-full bg-[#73C2FB]" />
        <div className="absolute top-32 right-36 h-2 w-2 rounded-full bg-white/60" />
        <div className="absolute bottom-32 left-24 h-3 w-3 rounded-full bg-[#73C2FB]" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

          {/* -----------------------------------------------------
              Logo
          ----------------------------------------------------- */}
          <img
            src="/logo.png"
            alt="Heera Agro"
            className="absolute top-4 left-4 h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] "

            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {/* <div>
            <div className="inline-flex items-center rounded-2xl bg-white px-5 py-3 shadow-xl">

              <img
                src="/logo.png"
                alt="Heera Agro"
                 className="absolute top-4 left-4 h-14 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

            </div>

            <div className="mt-6 h-1 w-20 rounded-full bg-[#73C2FB]" />
          </div> */}

          {/* -----------------------------------------------------
              Main Content
          ----------------------------------------------------- */}
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#73C2FB]/30 bg-[#73C2FB]/10 px-4 py-2 text-sm text-[#DDF3FF]">

              <span className="h-2 w-2 rounded-full bg-[#73C2FB]" />

              Internal Training Portal

            </div>

            {/* Heading */}
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight tracking-tight">

              Welcome to

              <span className="block text-[#73C2FB]">
                Training Portal
              </span>

            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-lg xl:text-xl leading-relaxed text-gray-200">

              Empowering our team with knowledge, skills and confidence
              to deliver better customer support.

            </p>

            {/* -----------------------------------------------------
                Feature Cards
            ----------------------------------------------------- */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">

              {/* Learn */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-2xl">
                  📚
                </div>

                <p className="mt-3 text-sm font-semibold text-white">
                  Learn
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Build knowledge
                </p>

              </div>

              {/* Improve */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-2xl">
                  🎯
                </div>

                <p className="mt-3 text-sm font-semibold text-white">
                  Improve
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Develop skills
                </p>

              </div>

              {/* Grow */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#73C2FB]/15 text-2xl">
                  📈
                </div>

                <p className="mt-3 text-sm font-semibold text-white">
                  Grow
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Achieve more
                </p>

              </div>

            </div>

          </div>

          {/* -----------------------------------------------------
              Left Footer
          ----------------------------------------------------- */}
          <div className="flex items-center justify-between text-sm text-gray-400">

            <span>
              Heera Agro
            </span>

            <span>
              Internal Use Only
            </span>

          </div>

        </div>

      </section>


      {/* =========================================================
          RIGHT SIDE - LOGIN
      ========================================================= */}
      <section className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-white px-6 py-10">

        <div className="w-full max-w-md">

          {/* -----------------------------------------------------
              Mobile Logo
          ----------------------------------------------------- */}
          <div className="lg:hidden flex justify-center mb-8">

            <div className="rounded-2xl bg-white px-5 py-3 shadow-md border border-gray-100">

              <img
                src="/logo.png"
                alt="Heera Agro"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

            </div>

          </div>


          {/* -----------------------------------------------------
              Login Header
          ----------------------------------------------------- */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73C2FB]/15 text-2xl">

              🔐

            </div>

            <h2 className="mt-5 text-3xl font-bold text-[#101736]">

              Login

            </h2>

            <p className="mt-2 text-sm text-gray-500">

              Sign in to start your training

            </p>

          </div>


          {/* -----------------------------------------------------
              Login Form
          ----------------------------------------------------- */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* Employee Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#101736]"
              >
                Email ID
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ✉️
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email ID "
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-[#F7FAFC] py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-[#73C2FB] focus:bg-white focus:ring-4 focus:ring-[#73C2FB]/20"
                />

              </div>

            </div>


            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#101736]"
              >
                Password
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-[#F7FAFC] py-3.5 pl-12 pr-12 text-gray-900 outline-none transition focus:border-[#73C2FB] focus:bg-white focus:ring-4 focus:ring-[#73C2FB]/20"
                />

                {/* Eye Button */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#4AA8E8]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? "🙈" : "👁️"}

                </button>

              </div>

            </div>


            {/* -----------------------------------------------------
                Remember Me + Forgot Password
            ----------------------------------------------------- */}
            <div className="flex items-center justify-between">

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-[#73C2FB] focus:ring-[#73C2FB]"
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="text-sm font-medium text-[#2575B5] transition hover:text-[#101736]"
                onClick={() =>
                  alert(
                    "Please contact your administrator to reset your password."
                  )
                }
              >
                Forgot Password?
              </button>

            </div>


            {/* -----------------------------------------------------
                Error Message
            ----------------------------------------------------- */}
            {error && (

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                {error}

              </div>

            )}


            {/* -----------------------------------------------------
                Login Button
            ----------------------------------------------------- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#73C2FB] py-3.5 text-base font-bold text-[#101736] shadow-lg shadow-[#73C2FB]/20 transition duration-200 hover:bg-[#4AA8E8] hover:shadow-[#73C2FB]/30 focus:outline-none focus:ring-4 focus:ring-[#73C2FB]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (

                <span className="flex items-center justify-center gap-2">

                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#101736]/30 border-t-[#101736]" />

                  Signing in...

                </span>

              ) : (

                "Sign In"

              )}

            </button>

          </form>


          {/* -----------------------------------------------------
              Support
          ----------------------------------------------------- */}
          <div className="mt-8 text-center">

            <p className="text-sm text-gray-500">
              Having trouble logging in?
            </p>

            <p className="mt-1 text-sm font-semibold text-[#101736]">
              Login Issue? Contact Admin
            </p>

          </div>


          {/* -----------------------------------------------------
              Footer
          ----------------------------------------------------- */}
          <div className="mt-10 border-t border-gray-100 pt-5 text-center">

            <p className="text-xs text-gray-400">
              Internal Use Only
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Call Center Training Portal · Version 1.0
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}