import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {RATING_OPTIONS} from "../../model/player/RatingOptions";
import {Tournament} from "../../model/tournament/Tournament";

type FieldErrors = Partial<Record<keyof Omit<Tournament, 'id'> | "form", string>>;

export function TournamentCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<Omit<Tournament, 'id'>>({
        name: "",
        description: "",
        city: "",
        prizes: "",
        startDate: NaN,
        endDate: NaN,
        organizerIds: ["6cf40eff-f53f-4766-bae8-340c2eb72042"],
        status: "pending",
        minRating: NaN,
        maxRating: NaN,
    });

    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const inputClass = (hasError?: boolean) =>
        `w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all border focus:outline-none focus:ring-2 ${
            hasError
                ? "border-red-400 bg-red-50/50 focus:ring-red-200"
                : "border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-emerald-200"
        }`;

    const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

    const handleChange = (field: 'name' | 'description' | 'city' | 'prizes') =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm({ ...form, [field]: e.target.value });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
        };

    const handleDate = (field: 'startDate' | 'endDate') =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm({ ...form, [field]: e.target.value ? new Date(e.target.value).getTime() : NaN });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
        };

    const handleRating = (field: 'minRating' | 'maxRating') =>
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setForm({ ...form, [field]: e.target.value !== "" ? Number(e.target.value) : NaN });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
        };

    const validate = (): FieldErrors => {
        const newErrors: FieldErrors = {};
        if (!form.name.trim()) newErrors.name = "Name required";
        if (!form.city.trim()) newErrors.city = "City required";
        if (!form.startDate || isNaN(form.startDate)) newErrors.startDate = "Start date required";
        if (!form.endDate || isNaN(form.endDate)) newErrors.endDate = "End date required";
        if (form.minRating == null || isNaN(form.minRating)) newErrors.minRating = "Min rating required";
        if (form.maxRating == null || isNaN(form.maxRating)) newErrors.maxRating = "Max rating required";

        if (!isNaN(form.minRating) && !isNaN(form.maxRating)) {
            if (form.minRating >= form.maxRating) newErrors.maxRating = "Max > Min";
        }

        if (!isNaN(form.startDate) && !isNaN(form.endDate)) {
            if (form.startDate >= form.endDate) newErrors.endDate = "End > Start";
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
            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description?.trim() || undefined,
                    city: form.city.trim(),
                    prizes: form.prizes?.trim() || undefined,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    organizerIds: form.organizerIds,
                    status: form.status,
                    minRating: form.minRating,
                    maxRating: form.maxRating,
                }),
            });

            if (!res.ok) {
                const body = await res.text();
                throw new Error(body || "Failed to create");
            }

            const tournament = await res.json();
            navigate(`/tournaments/${tournament.id}`);
        } catch (err: any) {
            setErrors({ form: err.message });
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
                    className="w-full max-w-md backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-4"
                >
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-100/50 bg-clip-text text-transparent drop-shadow-xl">
                            New Tournament
                        </h1>
                    </div>

                    {errors.form && (
                        <div className="text-red-300 text-sm p-2 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                            {errors.form}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className={labelClass}>Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={handleChange("name")}
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
                            value={form.description ?? ""}
                            onChange={handleChange("description")}
                            className={inputClass()}
                            placeholder="2x doubles tournament..."
                        />
                    </div>

                    {/* City + Prizes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>City *</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={handleChange("city")}
                                className={inputClass(!!errors.city)}
                                placeholder="Amsterdam"
                            />
                            {errors.city && <p className="text-red-300 text-xs mt-1.5">{errors.city}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Prizes</label>
                            <input
                                type="text"
                                value={form.prizes ?? ""}
                                onChange={handleChange("prizes")}
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
                                value={form.startDate && !isNaN(form.startDate) ? new Date(form.startDate).toISOString().slice(0, 16) : ""}
                                onChange={handleDate("startDate")}
                                className={inputClass(!!errors.startDate)}
                            />
                            {errors.startDate && <p className="text-red-300 text-xs mt-1.5">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>End *</label>
                            <input
                                type="datetime-local"
                                value={form.endDate && !isNaN(form.endDate) ? new Date(form.endDate).toISOString().slice(0, 16) : ""}
                                onChange={handleDate("endDate")}
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
                                value={form.minRating != null && !isNaN(form.minRating) ? form.minRating : ""}
                                onChange={handleRating("minRating")}
                                className={inputClass(!!errors.minRating)}
                            >
                                <option value="">Select</option>
                                {RATING_OPTIONS.map(rating => (
                                    <option key={rating} value={rating}>{rating.toFixed(1)}</option>
                                ))}
                            </select>
                            {errors.minRating && <p className="text-red-300 text-xs mt-1.5">{errors.minRating}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Max Rating *</label>
                            <select
                                value={form.maxRating != null && !isNaN(form.maxRating) ? form.maxRating : ""}
                                onChange={handleRating("maxRating")}
                                className={inputClass(!!errors.maxRating)}
                            >
                                <option value="">Select</option>
                                {RATING_OPTIONS.map(rating => (
                                    <option key={rating} value={rating}>{rating.toFixed(1)}</option>
                                ))}
                            </select>
                            {errors.maxRating && <p className="text-red-300 text-xs mt-1.5">{errors.maxRating}</p>}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide"
                    >
                        {submitting ? "Creating..." : "Create Tournament"}
                    </button>
                </form>
            </div>
        </div>
    );
}
