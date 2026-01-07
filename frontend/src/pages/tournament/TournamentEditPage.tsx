import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tournament } from "../types";

interface TournamentForm {
    name: string;
    description: string;
    city: string;
    prizes: string;
    startDate: string;
    endDate: string;
    status: Tournament["status"];
    ratingZones: string[];
}

export function TournamentEditPage() {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<TournamentForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tournamentId) return;

        fetch(`/api/tournaments/${tournamentId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Not found");
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
                    status: t.status,
                    ratingZones: t.ratingZones,
                });
            })
            .catch(() => setError("Failed to load tournament"))
            .finally(() => setLoading(false));
    }, [tournamentId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Tournament not found
            </div>
        );
    }

    const update =
        (key: keyof TournamentForm) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setForm({ ...form, [key]: e.target.value });
            };

    const submit = async () => {
        if (!form) return;

        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: tournamentId,
                    name: form.name,
                    description: form.description || undefined,
                    city: form.city,
                    prizes: form.prizes || undefined,
                    startDate: new Date(form.startDate).toISOString(),
                    endDate: new Date(form.endDate).toISOString(),
                    status: form.status,
                    ratingZones: form.ratingZones,
                    organizerIds: [
                        "6cf40eff-f53f-4766-bae8-340c2eb72042" // TEMP until auth
                    ],
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

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div className="relative z-10 bg-white bg-opacity-90 p-6 rounded-xl shadow-lg max-w-md w-full mx-4 space-y-2">
                <h1 className="text-xl font-bold">Edit tournament</h1>

                {error && (
                    <div className="text-red-600">
                        {error}
                    </div>
                )}

                <input
                    className="w-full p-2 border rounded"
                    value={form.name}
                    onChange={update("name")}
                />

                <textarea
                    className="w-full p-2 border rounded"
                    value={form.description}
                    onChange={update("description")}
                />

                <input
                    className="w-full p-2 border rounded"
                    value={form.city}
                    onChange={update("city")}
                />

                <input
                    className="w-full p-2 border rounded"
                    value={form.prizes}
                    onChange={update("prizes")}
                />

                <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={update("startDate")}
                />

                <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={update("endDate")}
                />

                <button
                    disabled={saving}
                    onClick={submit}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </div>
    );
}
