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
                if (!res.ok) {
                    throw new Error("Tournament not found");
                }
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
        `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            hasError
                ? "border-red-500 focus:ring-red-400 bg-red-50"
                : "border-gray-300 focus:ring-blue-400 hover:border-blue-300"
        }`;

    const update = (key: keyof TournamentForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm({ ...form!, [key]: e.target.value });
            // Clear field error on change
            if (errors[key]) {
                setErrors({ ...errors, [key]: undefined });
            }
        };

    const validate = (): FieldErrors => {
        const newErrors: FieldErrors = {};
        if (!form?.name.trim()) newErrors.name = "Name is required";
        if (!form?.city.trim()) newErrors.city = "City is required";
        if (!form?.startDate) newErrors.startDate = "Start date is required";
        if (!form?.endDate) newErrors.endDate = "End date is required";
        if (!form?.minRating) newErrors.minRating = "Min rating required";
        if (!form?.maxRating) newErrors.maxRating = "Max rating required";

        // Min < Max rating validation
        if (form?.minRating && form?.maxRating) {
            const min = parseFloat(form.minRating);
            const max = parseFloat(form.maxRating);
            if (min >= max) newErrors.maxRating = "Max must be higher than min";
        }

        // Date validation
        if (form?.startDate && form?.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (start >= end) newErrors.endDate = "End date must be after start date";
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
            const res = await fetch(`/api/tournaments/`, {
                method: "POST",  // Changed from POST
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
                    minRating: form.minRating,     // ✅ New fields
                    maxRating: form.maxRating,     // ✅ New fields
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
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Tournament</h1>
                    <p className="text-gray-600">Update tournament details</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tournament Name *
                    </label>
                    <input
                        className={inputClass(!!errors.name)}
                        value={form.name}
                        onChange={update("name")}
                        placeholder="Enter tournament name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        rows={3}
                        className={inputClass()}
                        value={form.description}
                        onChange={update("description")}
                        placeholder="Optional tournament description"
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                    </label>
                    <input
                        className={inputClass(!!errors.city)}
                        value={form.city}
                        onChange={update("city")}
                        placeholder="e.g. Amsterdam"
                    />
                    {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* Prizes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prizes</label>
                    <input
                        className={inputClass()}
                        value={form.prizes}
                        onChange={update("prizes")}
                        placeholder="e.g. €500 + racket"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *
                        </label>
                        <input
                            type="datetime-local"
                            className={inputClass(!!errors.startDate)}
                            value={form.startDate}
                            onChange={update("startDate")}
                        />
                        {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date *
                        </label>
                        <input
                            type="datetime-local"
                            className={inputClass(!!errors.endDate)}
                            value={form.endDate}
                            onChange={update("endDate")}
                        />
                        {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
                    </div>
                </div>

                {/* Rating Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Rating *
                        </label>
                        <select
                            className={inputClass(!!errors.minRating)}
                            value={form.minRating}
                            onChange={update("minRating")}
                        >
                            <option value="">Select...</option>
                            {RATING_OPTIONS.map(rating => (
                                <option key={rating} value={rating}>{rating}</option>
                            ))}
                        </select>
                        {errors.minRating && <p className="text-red-600 text-sm mt-1">{errors.minRating}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Rating *
                        </label>
                        <select
                            className={inputClass(!!errors.maxRating)}
                            value={form.maxRating}
                            onChange={update("maxRating")}
                        >
                            <option value="">Select...</option>
                            {RATING_OPTIONS.map(rating => (
                                <option key={rating} value={rating}>{rating}</option>
                            ))}
                        </select>
                        {errors.maxRating && <p className="text-red-600 text-sm mt-1">{errors.maxRating}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/tournaments/${tournamentId}`)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        onClick={submit}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
