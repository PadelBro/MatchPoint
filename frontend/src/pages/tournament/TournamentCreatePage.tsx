import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

type FieldErrors = Partial<Record<keyof TournamentForm | "form", string>>;

const RATING_OPTIONS = [
    "0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
    "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0"
];

export function TournamentCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<TournamentForm>({
        name: "",
        description: "",
        city: "",
        prizes: "",
        startDate: "",
        endDate: "",
        organizerIds: ["6cf40eff-f53f-4766-bae8-340c2eb72042"],
        status: "pending",
        minRating: "",
        maxRating: "",
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

    const handleChange = (field: keyof TournamentForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setForm({ ...form, [field]: e.target.value });
            if (errors[field]) setErrors({ ...errors, [field]: undefined });
        };

    const validate = (): FieldErrors => {
        const newErrors: FieldErrors = {};
        if (!form.name.trim()) newErrors.name = "Name required";
        if (!form.city.trim()) newErrors.city = "City required";
        if (!form.startDate) newErrors.startDate = "Start date required";
        if (!form.endDate) newErrors.endDate = "End date required";
        if (!form.minRating) newErrors.minRating = "Min rating required";
        if (!form.maxRating) newErrors.maxRating = "Max rating required";

        if (form.minRating && form.maxRating) {
            const min = parseFloat(form.minRating);
            const max = parseFloat(form.maxRating);
            if (min >= max) newErrors.maxRating = "Max > Min";
        }

        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (start >= end) newErrors.endDate = "End > Start";
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
            const toIsoUtc = (dateStr: string) => new Date(dateStr).toISOString();

            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                city: form.city.trim(),
                prizes: form.prizes.trim() || undefined,
                startDate: toIsoUtc(form.startDate),
                endDate: toIsoUtc(form.endDate),
                organizerIds: form.organizerIds,
                status: form.status,
                minRating: form.minRating,
                maxRating: form.maxRating,
            };

            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.errors?.join(", ") || "Failed to create");
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
                    {/* Compact header */}
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
                            value={form.description}
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
                                value={form.prizes}
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
                                value={form.startDate}
                                onChange={handleChange("startDate")}
                                className={inputClass(!!errors.startDate)}
                            />
                            {errors.startDate && <p className="text-red-300 text-xs mt-1.5">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>End *</label>
                            <input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={handleChange("endDate")}
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
                                onChange={handleChange("minRating")}
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
                                onChange={handleChange("maxRating")}
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
