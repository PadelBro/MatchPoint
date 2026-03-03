import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {RATING_OPTIONS} from "../../model/player/RatingOptions";

type FieldErrors = Partial<Record<
    | "username"
    | "rating"
    | "homeAddress"
    | "playtomicProfileUrl"
    | "gender"
    | "hand"
    | "courtSide"
    | "form",
    string
>>;

export function PlayerRegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        rating: "",
        homeAddress: "",
        playtomicProfileUrl: "",
        gender: "",
        hand: "",
        courtSide: "",
    });

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
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setForm({ ...form, [field]: e.target.value });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
        };

    const validate = (): FieldErrors => {
        const newErrors: FieldErrors = {};

        if (!form.username.trim() || form.username.trim().length < 3 || form.username.trim().length > 30)
            newErrors.username = "Name: 3-30 chars";

        if (!form.rating) newErrors.rating = "Rating required";
        if (!form.gender) newErrors.gender = "Gender required";
        if (!form.hand) newErrors.hand = "Hand required";
        if (!form.courtSide) newErrors.courtSide = "Court side required";

        if (form.playtomicProfileUrl.trim()) {
            try { new URL(form.playtomicProfileUrl); }
            catch { newErrors.playtomicProfileUrl = "Invalid URL"; }
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);

        try {
            const res = await fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username.trim(),
                    rating: form.rating,
                    homeAddress: form.homeAddress.trim() || undefined,
                    playtomicProfileUrl: form.playtomicProfileUrl.trim() || undefined,
                    gender: form.gender,
                    hand: form.hand,
                    courtSide: form.courtSide,
                }),
            });

            if (!res.ok) throw new Error("Failed to create player");

            const player = await res.json();
            navigate(`/players/${player.id}`);
        } catch {
            setErrors({ form: "Failed to submit" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-5"
                >
                    {/* Compact header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-100/50 bg-clip-text text-transparent drop-shadow-xl mb-2">
                            Register Player
                        </h1>
                    </div>

                    {errors.form && (
                        <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                            {errors.form}
                        </div>
                    )}

                    {/* Compact fields */}
                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={handleChange("username")}
                                className={inputClass(!!errors.username)}
                                placeholder="John Doe"
                                maxLength={30}
                            />
                            {errors.username && <p className="text-red-300 text-xs mt-1.5">{errors.username}</p>}
                        </div>

                        {/* Rating */}
                        <div>
                            <label className={labelClass}>Rating *</label>
                            <select
                                value={form.rating}
                                onChange={handleChange("rating")}
                                className={inputClass(!!errors.rating)}
                            >
                                <option value="">Select</option>
                                {RATING_OPTIONS.map(rating => (
                                    <option key={rating} value={rating}>{rating.toFixed(1)}</option>
                                ))}
                            </select>
                            {errors.rating && <p className="text-red-300 text-xs mt-1.5">{errors.rating}</p>}
                        </div>

                        {/* City */}
                        <div>
                            <label className={labelClass}>City</label>
                            <input
                                type="text"
                                value={form.homeAddress}
                                onChange={handleChange("homeAddress")}
                                className={inputClass()}
                                placeholder="Amsterdam"
                            />
                        </div>

                        {/* Profile grid - 1 row mobile, 3col desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Gender *</label>
                                <select value={form.gender} onChange={handleChange("gender")} className={inputClass(!!errors.gender)}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.gender && <p className="text-red-300 text-xs mt-1.5">{errors.gender}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Hand *</label>
                                <select value={form.hand} onChange={handleChange("hand")} className={inputClass(!!errors.hand)}>
                                    <option value="">Select</option>
                                    <option value="right">Right</option>
                                    <option value="left">Left</option>
                                </select>
                                {errors.hand && <p className="text-red-300 text-xs mt-1.5">{errors.hand}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Court *</label>
                                <select value={form.courtSide} onChange={handleChange("courtSide")} className={inputClass(!!errors.courtSide)}>
                                    <option value="">Select</option>
                                    <option value="right">Right</option>
                                    <option value="left">Left</option>
                                </select>
                                {errors.courtSide && <p className="text-red-300 text-xs mt-1.5">{errors.courtSide}</p>}
                            </div>
                        </div>

                        {/* Playtomic */}
                        <div>
                            <label className={labelClass}>Playtomic URL</label>
                            <input
                                type="url"
                                value={form.playtomicProfileUrl}
                                onChange={handleChange("playtomicProfileUrl")}
                                className={inputClass(!!errors.playtomicProfileUrl)}
                                placeholder="playtomic.com/..."
                            />
                            {errors.playtomicProfileUrl && <p className="text-red-300 text-xs mt-1.5">{errors.playtomicProfileUrl}</p>}
                        </div>
                    </div>

                    {/* Compact submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide"
                    >
                        {submitting ? "Creating..." : "Register Player"}
                    </button>
                </form>
            </div>
        </div>
    );
}
