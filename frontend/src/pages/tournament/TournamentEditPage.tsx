import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tournament } from "../types";

interface TournamentForm {
    name: string;
    description: string;
    city: string;
    prizes: string;
    startDate: string;
    endDate: string;
    organizerIds: string[];
    status: "pending" | "active" | "completed";
    minRating: string;
    maxRating: string;
}

type FieldErrors = Partial<Record<keyof TournamentForm, string>>;

const RATING_OPTIONS = [
    "0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
    "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0"
];

export function TournamentEditPage() {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<TournamentForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});

    useEffect(() => {
        if (!tournamentId) return;

        fetch(`/api/tournaments/${tournamentId}`)
            .then(res => {
                if (!res.ok) throw new Error("Tournament not found");
                return res.json();
            })
            .then((t: Tournament) => {
                setForm({
                    name: t.name,
                    description: t.description ?? "",
                    city: t.city,
                    prizes: t.prizes ?? "",
                    startDate: new Date(t.startDate).toISOString().slice(0, 16),
                    endDate: new Date(t.endDate).toISOString().slice(0, 16),
                    organizerIds: t.organizerIds,
                    status: t.status,
                    minRating: t.minRating || "",
                    maxRating: t.maxRating || "",
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [tournamentId]);

    const inputClass = (hasError?: boolean) =>
        `w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all border focus:outline-none focus:ring-2 ${
            hasError
                ? "border-red-400 bg-red-50/50 focus:ring-red-200"
                : "border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-emerald-200"
        }`;

    const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

    const update = (key: keyof TournamentForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm({ ...form!, [key]: e.target.value });
            if (errors[key]) setErrors({ ...errors, [key]: undefined });
        };

    const validate = (): FieldErrors => {
        const newErrors: FieldErrors = {};
        if (!form?.name.trim()) newErrors.name = "Name required";
        if (!form?.city.trim()) newErrors.city = "City required";
        if (!form?.startDate) newErrors.startDate = "Start required";
        if (!form?.endDate) newErrors.endDate = "End required";
        if (!form?.minRating) newErrors.minRating = "Min rating required";
        if (!form?.maxRating) newErrors.maxRating = "Max rating required";

        if (form?.minRating && form?.maxRating) {
            const min = parseFloat(form.minRating);
            const max = parseFloat(form.maxRating);
            if (min >= max) newErrors.maxRating = "Max > Min";
        }

        if (form?.startDate && form?.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (start >= end) newErrors.endDate = "End > Start";
        }

        return newErrors;
    };

    const submit = async () => {
        if (!form) return;

        const fieldErrors = validate();
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) return;

        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/tournaments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: tournamentId,
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    city: form.city.trim(),
                    prizes: form.prizes.trim() || undefined,
                    startDate: new Date(form.startDate).toISOString(),
                    endDate: new Date(form.endDate).toISOString(),
                    status: form.status,
                    minRating: form.minRating,
                    maxRating: form.maxRating,
                    organizerIds: form.organizerIds,
                }),
            });

            if (!res.ok) {
                const body = await res.text();
                throw new Error(body || "Update failed");
            }

            navigate(`/tournaments/${tournamentId}`);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                Loading...
            </div>
        );
    }

    if (!form || error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                {error || "Tournament not found"}
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
                <div className="w-full max-w-xl backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-5">

                    {/* Compact header */}
                    <div className="text-center mb-6 pb-4 border-b border-white/20">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-100/50 bg-clip-text text-transparent drop-shadow-xl">
                            Edit Tournament
                        </h1>
                    </div>

                    {error && (
                        <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className={labelClass}>Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={update("name")}
                            className={inputClass(!!errors.name)}
                            placeholder="Summer Padel Cup"
                        />
                        {errors.name && <p className="text-red-300 text-xs mt-1.5">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={update("description")}
                            className={inputClass()}
                            placeholder="Tournament details..."
                        />
                    </div>

                    {/* City + Prizes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>City *</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={update("city")}
                                className={inputClass(!!errors.city)}
                                placeholder="Amsterdam"
                            />
                            {errors.city && <p className="text-red-300 text-xs mt-1.5">{errors.city}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Prizes</label>
                            <input
                                type="text"
                                value={form.prizes}
                                onChange={update("prizes")}
                                className={inputClass()}
                                placeholder="€500 + racket"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Start *</label>
                            <input
                                type="datetime-local"
                                value={form.startDate}
                                onChange={update("startDate")}
                                className={inputClass(!!errors.startDate)}
                            />
                            {errors.startDate && <p className="text-red-300 text-xs mt-1.5">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>End *</label>
                            <input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={update("endDate")}
                                className={inputClass(!!errors.endDate)}
                            />
                            {errors.endDate && <p className="text-red-300 text-xs mt-1.5">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Rating Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Min Rating *</label>
                            <select
                                value={form.minRating}
                                onChange={update("minRating")}
                                className={inputClass(!!errors.minRating)}
                            >
                                <option value="">Select</option>
                                {RATING_OPTIONS.map(rating => (
                                    <option key={rating} value={rating}>{rating}</option>
                                ))}
                            </select>
                            {errors.minRating && <p className="text-red-300 text-xs mt-1.5">{errors.minRating}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Max Rating *</label>
                            <select
                                value={form.maxRating}
                                onChange={update("maxRating")}
                                className={inputClass(!!errors.maxRating)}
                            >
                                <option value="">Select</option>
                                {RATING_OPTIONS.map(rating => (
                                    <option key={rating} value={rating}>{rating}</option>
                                ))}
                            </select>
                            {errors.maxRating && <p className="text-red-300 text-xs mt-1.5">{errors.maxRating}</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(`/tournaments/${tournamentId}`)}
                            className="flex-1 px-6 py-3 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl disabled:opacity-50"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            disabled={saving}
                            onClick={submit}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
