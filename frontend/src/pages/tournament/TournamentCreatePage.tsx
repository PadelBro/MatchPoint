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
    ratingZones: string[];
}

type FieldErrors = Partial<Record<keyof TournamentForm | "form", string>>;

// Available rating zones
const RATING_ZONES = [
    "0.0-0.5","0.5-1.0","1.0-1.5","1.5-2.0","2.0-2.5","2.5-3.0",
    "3.0-3.5","3.5-4.0","4.0-4.5","4.5-5.0","5.0-5.5","5.5-6.0",
    "6.0-6.5","6.5-7.0"
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
        ratingZones: [],
    });

    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const inputClass = (hasError?: boolean) =>
        `w-full p-2 border rounded focus:outline-none transition ${
            hasError
                ? "border-red-500 focus:ring-2 focus:ring-red-400"
                : "border-gray-300 focus:ring-2 focus:ring-green-400"
        }`;

    const handleChange = (field: keyof TournamentForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm({ ...form, [field]: e.target.value });

    const handleRatingZonesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, opt => opt.value);
        setForm({ ...form, ratingZones: selected });
    };

    const validate = (): FieldErrors => {
        const newErrors: FieldErrors = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.startDate.trim()) newErrors.startDate = "Start date is required";
        if (!form.endDate.trim()) newErrors.endDate = "End date is required";
        if (form.ratingZones.length === 0) newErrors.ratingZones = "Select at least one rating zone";

        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (start >= end) newErrors.endDate = "End date must be after start date";
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

            const payload: TournamentForm = {
                ...form,
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                city: form.city.trim(),
                prizes: form.prizes.trim() || undefined,
                startDate: toIsoUtc(form.startDate),
                endDate: toIsoUtc(form.endDate),
            };

            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.errors?.join(", ") || "Failed to create tournament");
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
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />


            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md relative bg-white rounded-xl shadow p-6 space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">New Tournament</h1>

                {errors.form && <div className="text-red-600 text-sm text-center">{errors.form}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={handleChange("name")}
                        className={inputClass(!!errors.name)}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={form.description}
                        onChange={handleChange("description")}
                        className={inputClass()}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.city}
                        onChange={handleChange("city")}
                        className={inputClass(!!errors.city)}
                    />
                    {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Prizes</label>
                    <input
                        type="text"
                        value={form.prizes}
                        onChange={handleChange("prizes")}
                        className={inputClass()}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={handleChange("startDate")}
                        className={inputClass(!!errors.startDate)}
                    />
                    {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={handleChange("endDate")}
                        className={inputClass(!!errors.endDate)}
                    />
                    {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
                </div>

                {/* Multi-select for rating zones */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Rating Zones <span className="text-red-500">*</span>
                    </label>
                    <select
                        multiple
                        value={form.ratingZones}
                        onChange={handleRatingZonesChange}
                        className={inputClass(!!errors.ratingZones)}
                        size={6}
                    >
                        {RATING_ZONES.map(zone => (
                            <option key={zone} value={zone}>{zone}</option>
                        ))}
                    </select>
                    {errors.ratingZones && <p className="text-red-600 text-sm mt-1">{errors.ratingZones}</p>}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 rounded transition"
                >
                    {submitting ? "Creating..." : "Create Tournament"}
                </button>
            </form>
        </div>
    );
}
