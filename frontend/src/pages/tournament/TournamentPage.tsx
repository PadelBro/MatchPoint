import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tournament } from "../types";

export function TournamentPage() {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    const canEdit = true; // TODO(auth): replace with AuthContext + organizer check

    useEffect(() => {
        if (!tournamentId) return;

        fetch(`/api/tournaments/${tournamentId}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then(setTournament)
            .catch(() => setTournament(null))
            .finally(() => setLoading(false));
    }, [tournamentId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!tournament) {
        return <div className="min-h-screen flex items-center justify-center">Tournament not found</div>;
    }

    const formatDate = (ms: number) =>
        new Date(ms).toLocaleString();

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div className="relative z-10 bg-white bg-opacity-90 p-6 rounded-xl shadow-lg max-w-md w-full mx-4 space-y-2">
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {tournament.name}
                    </h1>

                    {canEdit && (
                        <button
                            onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {tournament.description && <p>{tournament.description}</p>}

                <p><strong>City:</strong> {tournament.city}</p>
                <p><strong>Status:</strong> {tournament.status}</p>
                <p><strong>Start:</strong> {formatDate(tournament.startDate)}</p>
                <p><strong>End:</strong> {formatDate(tournament.endDate)}</p>

                {tournament.prizes && (
                    <p><strong>Prizes:</strong> {tournament.prizes}</p>
                )}

                <p>
                    <strong>Rating zones:</strong>{" "}
                    {tournament.ratingZones.join(", ")}
                </p>
            </div>
        </div>
    );
}
