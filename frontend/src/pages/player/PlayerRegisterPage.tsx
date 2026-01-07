import { useState } from "react";
import { useNavigate } from "react-router-dom";

type FieldErrors = Partial<Record<
    | "username"
    | "ratingZone"
    | "gender"
    | "hand"
    | "courtSide"
    | "playtomicProfileUrl"
    | "form",
    string
>>;

export function PlayerRegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [ratingZone, setRatingZone] = useState("");
    const [homeAddress, setHomeAddress] = useState("");
    const [playtomicProfileUrl, setPlaytomicProfileUrl] = useState("");
    const [gender, setGender] = useState("");
    const [hand, setHand] = useState("");
    const [courtSide, setCourtSide] = useState("");

    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const inputClass = (hasError?: boolean) =>
        `w-full p-2 border rounded focus:outline-none transition ${
            hasError
                ? "border-red-500 focus:ring-2 focus:ring-red-400"
                : "border-gray-300 focus:ring-2 focus:ring-green-400"
        }`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: FieldErrors = {};

        if (!username.trim())
            newErrors.username = "Name is required (3–30 characters)";
        else if (username.trim().length < 3 || username.trim().length > 30)
            newErrors.username = "Name must be between 3 and 30 characters";

        if (!ratingZone) newErrors.ratingZone = "Rating zone is required";
        if (!gender) newErrors.gender = "Gender is required";
        if (!hand) newErrors.hand = "Dominant hand is required";
        if (!courtSide) newErrors.courtSide = "Court side is required";

        if (playtomicProfileUrl.trim()) {
            try {
                new URL(playtomicProfileUrl);
            } catch {
                newErrors.playtomicProfileUrl = "Invalid URL format";
            }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);

        try {
            const res = await fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    ratingZone,
                    homeAddress: homeAddress.trim() || undefined,
                    playtomicProfileUrl: playtomicProfileUrl.trim() || undefined,
                    hand,
                    courtSide,
                    gender,
                }),
            });

            if (!res.ok) throw new Error("Failed to create player");

            const player = await res.json();
            navigate(`/players/${player.id}`);
        } catch (err) {
            console.error(err);
            setErrors({ form: "Failed to submit form. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-md bg-white bg-opacity-90 rounded-xl shadow p-6 space-y-4"
            >
                <h1 className="text-2xl font-bold text-gray-900 text-center">
                    Register Player
                </h1>

                {errors.form && (
                    <div className="text-red-600 text-sm text-center">
                        {errors.form}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className={inputClass(!!errors.username)}
                    />
                    {errors.username && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.username}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Must be between 3 and 30 characters.
                    </p>
                </div>

                {/* Rating Zone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Rating Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={ratingZone}
                        onChange={e => setRatingZone(e.target.value)}
                        className={inputClass(!!errors.ratingZone)}
                    >
                        <option value="">Select Rating Zone</option>
                        <option value="0.0-0.5">0.0 – 0.5</option>
                        <option value="0.5-1.0">0.5 – 1.0</option>
                        <option value="1.0-1.5">1.0 – 1.5</option>
                        <option value="1.5-2.0">1.5 – 2.0</option>
                        <option value="2.0-2.5">2.0 – 2.5</option>
                        <option value="2.5-3.0">2.5 – 3.0</option>
                        <option value="3.0-3.5">3.0 – 3.5</option>
                        <option value="3.5-4.0">3.5 – 4.0</option>
                        <option value="4.0-4.5">4.0 – 4.5</option>
                        <option value="4.5-5.0">4.5 – 5.0</option>
                        <option value="5.0-5.5">5.0 – 5.5</option>
                        <option value="5.5-6.0">5.5 – 6.0</option>
                        <option value="6.0-6.5">6.0 – 6.5</option>
                        <option value="6.5-7.0">6.5 – 7.0</option>
                    </select>
                    {errors.ratingZone && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.ratingZone}
                        </p>
                    )}
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        City
                    </label>
                    <input
                        type="text"
                        value={homeAddress}
                        onChange={e => setHomeAddress(e.target.value)}
                        className={inputClass()}
                    />
                </div>

                {/* Playtomic URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Playtomic Profile URL
                    </label>
                    <input
                        type="url"
                        value={playtomicProfileUrl}
                        onChange={e => setPlaytomicProfileUrl(e.target.value)}
                        className={inputClass(!!errors.playtomicProfileUrl)}
                    />
                    {errors.playtomicProfileUrl ? (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.playtomicProfileUrl}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">
                            Optional — link to your Playtomic profile
                        </p>
                    )}
                </div>

                {/* Hand */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Dominant Hand <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={hand}
                        onChange={e => setHand(e.target.value)}
                        className={inputClass(!!errors.hand)}
                    >
                        <option value="">Select dominant hand</option>
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                    </select>
                    {errors.hand && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.hand}
                        </p>
                    )}
                </div>

                {/* Court Side */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Preferred Court Side <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={courtSide}
                        onChange={e => setCourtSide(e.target.value)}
                        className={inputClass(!!errors.courtSide)}
                    >
                        <option value="">Select court side</option>
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                    </select>
                    {errors.courtSide && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.courtSide}
                        </p>
                    )}
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className={inputClass(!!errors.gender)}
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    {errors.gender && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.gender}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 rounded transition"
                >
                    {submitting ? "Submitting..." : "Register"}
                </button>
            </form>
        </div>
    );
}
