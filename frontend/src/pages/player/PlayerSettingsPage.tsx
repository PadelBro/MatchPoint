import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { RATING_OPTIONS } from "../../model/player/RatingOptions";
import type { Player } from "../../model/player/Player";
import { getErrorMessage } from "../../utils/apiError";

type PlayerForm = {
    rating: string;
    gender: string;
    hand: string;
    courtSide: string;
};

type FormErrors = Partial<Record<keyof PlayerForm | "form", string>>;

const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 border focus:outline-none focus:ring-2 ${
        hasError
            ? "border-red-400 bg-red-50/50 focus:ring-red-200"
            : "border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-emerald-200"
    }`;

const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

export function PlayerSettingsPage() {
    const { user } = useUser();
    const navigate = useNavigate();

    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<PlayerForm>({ rating: "", gender: "", hand: "", courtSide: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }

        fetch(`/api/players?userId=${user.id}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json() as Promise<Player>;
            })
            .then(p => {
                setPlayer(p);
                setForm({
                    rating: String(p.rating),
                    gender: p.gender,
                    hand: p.hand,
                    courtSide: p.courtSide,
                });
            })
            .catch(() => setPlayer(null))
            .finally(() => setLoading(false));
    }, [user]);

    const handleChange = (field: keyof PlayerForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setForm({ ...form, [field]: e.target.value });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
            setSaved(false);
        };

    const validate = (): FormErrors => {
        const e: FormErrors = {};
        if (!form.rating)    e.rating    = "Required";
        if (!form.gender)    e.gender    = "Required";
        if (!form.hand)      e.hand      = "Required";
        if (!form.courtSide) e.courtSide = "Required";
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: player?.id,
                    userId: user!.id,
                    rating: form.rating,
                    gender: form.gender,
                    hand: form.hand,
                    courtSide: form.courtSide,
                }),
            });

            if (!res.ok) {
                setErrors({ form: await getErrorMessage(res, "Failed to save") });
                return;
            }

            const updated = await res.json() as Player;
            setPlayer(updated);
            setSaved(true);
        } catch {
            setErrors({ form: "Failed to connect. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60" />

            <div className="relative z-10 px-4 py-12">
                <div className="max-w-lg mx-auto">

                    <Link to="/"
                          className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>

                    <div className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8">
                        <h1 className="text-2xl font-black text-white text-center mb-2">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-white/50 text-sm text-center mb-8">Player Settings</p>

                        {loading ? (
                            <p className="text-white/60 text-center py-8">Loading...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {errors.form && (
                                    <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                                        {errors.form}
                                    </div>
                                )}

                                {saved && (
                                    <div className="text-emerald-300 text-sm p-2.5 bg-emerald-900/20 backdrop-blur rounded-xl border border-emerald-500/30">
                                        Saved successfully
                                    </div>
                                )}

                                {!player && (
                                    <div className="text-yellow-300 text-sm p-2.5 bg-yellow-900/20 backdrop-blur rounded-xl border border-yellow-500/30">
                                        No player profile yet — fill in the details below to create one.
                                    </div>
                                )}

                                <div>
                                    <label className={labelClass}>Rating *</label>
                                    <select value={form.rating} onChange={handleChange("rating")}
                                            className={inputClass(!!errors.rating)}>
                                        <option value="">Select</option>
                                        {RATING_OPTIONS.map(r => (
                                            <option key={r} value={r}>{r.toFixed(1)}</option>
                                        ))}
                                    </select>
                                    {errors.rating && <p className="text-red-300 text-xs mt-1">{errors.rating}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Gender *</label>
                                        <select value={form.gender} onChange={handleChange("gender")}
                                                className={inputClass(!!errors.gender)}>
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {errors.gender && <p className="text-red-300 text-xs mt-1">{errors.gender}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Hand *</label>
                                        <select value={form.hand} onChange={handleChange("hand")}
                                                className={inputClass(!!errors.hand)}>
                                            <option value="">Select</option>
                                            <option value="right">Right</option>
                                            <option value="left">Left</option>
                                        </select>
                                        {errors.hand && <p className="text-red-300 text-xs mt-1">{errors.hand}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Court *</label>
                                        <select value={form.courtSide} onChange={handleChange("courtSide")}
                                                className={inputClass(!!errors.courtSide)}>
                                            <option value="">Select</option>
                                            <option value="right">Right</option>
                                            <option value="left">Left</option>
                                        </select>
                                        {errors.courtSide && <p className="text-red-300 text-xs mt-1">{errors.courtSide}</p>}
                                    </div>
                                </div>

                                <button type="submit" disabled={submitting}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide mt-2">
                                    {submitting ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}