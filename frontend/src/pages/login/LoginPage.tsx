import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

type FieldErrors = Partial<Record<"email" | "password" | "form", string>>;

export function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useUser();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const inputClass = (hasError?: boolean) =>
        `w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 border focus:outline-none focus:ring-2 ${
            hasError
                ? "border-red-400 bg-red-50/50 focus:ring-red-200"
                : "border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-emerald-200"
        }`;

    const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

    const handleChange = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm({ ...form, [field]: e.target.value });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
        };

    const validate = (): FieldErrors => {
        const e: FieldErrors = {};
        if (!form.email.trim()) e.email = "Required";
        if (!form.password) e.password = "Required";
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                }),
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => "");
                setErrors({ form: msg || "Invalid email or password" });
                return;
            }

            const data = await res.json();
            setUser({ id: data.id, firstName: data.firstName, lastName: data.lastName, token: data.token });
            navigate("/");
        } catch {
            setErrors({ form: "Failed to connect. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60" />

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-5"
                >
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-100/50 bg-clip-text text-transparent drop-shadow-xl mb-2">
                            Log In
                        </h1>
                        <p className="text-white/60 text-sm">Welcome back</p>
                    </div>

                    {errors.form && (
                        <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                            {errors.form}
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={handleChange("email")}
                            className={inputClass(!!errors.email)}
                            placeholder="john@example.com"
                            autoComplete="email"
                        />
                        {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={handleChange("password")}
                            className={inputClass(!!errors.password)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide"
                    >
                        {submitting ? "Logging in..." : "Log In"}
                    </button>

                    <p className="text-center text-white/50 text-sm pt-2">
                        No account?{" "}
                        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
