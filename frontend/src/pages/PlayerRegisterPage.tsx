import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function PlayerRegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [ratingZone, setRatingZone] = useState("");
    const [homeAddress, setHomeAddress] = useState("");
    const [playtomicProfileUrl, setPlaytomicProfileUrl] = useState("");
    const [gender, setGender] = useState("");
    const [hand, setHand] = useState("");
    const [courtSide, setCourtSide] = useState("");

    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: string[] = [];
        if (!username.trim()) newErrors.push("Name is required");
        if (!ratingZone) newErrors.push("Rating zone is required");
        if (!gender) newErrors.push("Gender is required");
        if (!hand) newErrors.push("Hand is required");
        if (!courtSide) newErrors.push("Court side is required");

        setErrors(newErrors);
        if (newErrors.length > 0) return;

        setSubmitting(true);

        try {
            const res = await fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    ratingZone,
                    homeAddress,
                    playtomicProfileUrl: playtomicProfileUrl || undefined,
                    hand,
                    courtSide,
                    gender,
                }),
            });

            if (!res.ok) throw new Error("Failed to create player");

            const player = await res.json();
            // redirect to the newly created player profile
            navigate(`/players/${player.id}`);
        } catch (err) {
            console.error(err);
            setErrors(["Failed to submit form"]);
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
                <h1 className="text-2xl font-bold text-gray-900 text-center">Register Player</h1>

                {errors.length > 0 && (
                    <div className="text-red-600 space-y-1">
                        {errors.map((err, i) => (
                            <div key={i}>{err}</div>
                        ))}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />

                <select
                    value={ratingZone}
                    onChange={e => setRatingZone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                >
                    <option value="">Select Rating Zone</option>
                    <option value="0.0-0.5">0.0–0.5</option>
                    <option value="0.5-1.0">0.5–1.0</option>
                    <option value="1.0-1.5">1.0–1.5</option>
                    <option value="1.5-2.0">1.5–2.0</option>
                    <option value="2.0-2.5">2.0–2.5</option>
                    <option value="2.5-3.0">2.5–3.0</option>
                    <option value="3.0-3.5">3.0–3.5</option>
                    <option value="3.5-4.0">3.5–4.0</option>
                    <option value="4.0-4.5">4.0–4.5</option>
                    <option value="4.5-5.0">4.5–5.0</option>
                    <option value="5.0-5.5">5.0–5.5</option>
                    <option value="5.5-6.0">5.5–6.0</option>
                    <option value="6.0-6.5">6.0–6.5</option>
                    <option value="6.5-7.0">6.5–7.0</option>
                </select>

                <input
                    type="text"
                    placeholder="City"
                    value={homeAddress}
                    onChange={e => setHomeAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />

                <input
                    type="url"
                    placeholder="Playtomic profile URL"
                    value={playtomicProfileUrl}
                    onChange={e => setPlaytomicProfileUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />

                <select
                    value={hand}
                    onChange={e => setHand(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                >
                    <option value="">Select Dominant Hand</option>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                </select>

                <select
                    value={courtSide}
                    onChange={e => setCourtSide(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                >
                    <option value="">Select preferable court side</option>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                </select>

                <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded"
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Register"}
                </button>
            </form>
        </div>
    );
}
