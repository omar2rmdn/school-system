import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import api from "../lib/api";
import type { AuthState } from "../types";
import { useAuth } from "../store/auth/context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await api.post<{ message: string; data: AuthState }>(
        "/users/login",
        {
          email,
          password,
        },
      );

      if (res.data.data.user.role !== "admin") {
        setAuth(null);
        await api.post("/users/logout");
        setError("Only admin accounts can access this dashboard");
        return;
      }

      setAuth(res.data.data);
      setMessage(res.data.message || "Login successful");
      setEmail("");
      setPassword("");
      navigate(from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-screen *:flex-1">
      <div className="hidden flex-col justify-center gap-4 bg-indigo-950 p-16 lg:flex">
        <h1 className="text-5xl font-bold text-white">
          School <br /> Management System
        </h1>
        <p className="max-w-xl text-lg text-gray-400">
          Streamline academic operations, manage staff and students, and access
          the admin dashboard securely from one place.
        </p>
      </div>

      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-32">
        <h1 className="mb-8 text-center text-4xl font-semibold lg:text-5xl">
          Login to Continue
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && (
            <div
              className="mb-6 rounded bg-red-100 p-3 text-center text-red-600"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="mb-6 rounded bg-green-100 p-3 text-center text-green-700"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <label className="text-lg" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            required
            id="email"
            className="mt-1.5 mb-6 w-full rounded bg-gray-200 p-3 outline-0"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter your email"
          />

          <label className="text-lg" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            required
            id="password"
            className="mt-1.5 mb-6 w-full rounded bg-gray-200 p-3 outline-0"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className="cursor-pointer rounded bg-indigo-950 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-indigo-950/70"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}
