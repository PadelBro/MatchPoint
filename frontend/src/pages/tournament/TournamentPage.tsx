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
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
    }

    if (!tournament) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Tournament not found</div>;
    }

    const formatDate = (date: string | number) =>
        new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    const getStatusBadge = (status: Tournament['status']) => {
        const colors = {
            pending: 'bg-gray-500',
            active: 'bg-green-500',
            completed: 'bg-blue-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div className="relative z-10 bg-white bg-opacity-95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 space-y-6">

                {/* Header with Edit button */}
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            {tournament.name}
                        </h1>
                        <div className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusBadge(tournament.status)}`}>
                            {tournament.status.toUpperCase()}
                        </div>
                    </div>

                    {canEdit && (
                        <button
                            onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Edit Tournament
                        </button>
                    )}
                </div>

                {/* Description */}
                {tournament.description && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-700 leading-relaxed">{tournament.description}</p>
                    </div>
                )}

                {/* NEW: City + Dates Layout */}
                <div className="space-y-4">
                    {/* City - Top level */}
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">City</p>
                        <p className="text-2xl font-bold text-gray-900">{tournament.city}</p>
                    </div>

                    {/* Start + End Dates - Same row below city */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Start Date</p>
                            <p className="text-xl font-semibold text-gray-900">{formatDate(tournament.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">End Date</p>
                            <p className="text-xl font-semibold text-gray-900">{formatDate(tournament.endDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Rating Range */}
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-200/50 rounded-2xl">
                    <p className="text-sm font-medium text-emerald-800 mb-3">Rating Range</p>
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-700">{tournament.minRating}</div>
                            <div className="text-xs text-emerald-600 uppercase tracking-wide">Min</div>
                        </div>
                        <div className="flex-1 mx-6">
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-teal-700">{tournament.maxRating}</div>
                            <div className="text-xs text-teal-600 uppercase tracking-wide">Max</div>
                        </div>
                    </div>
                </div>

                {/* Prizes */}
                {tournament.prizes && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="font-semibold text-amber-800 mb-2">🏆 Prizes</p>
                        <p className="text-lg text-amber-900">{tournament.prizes}</p>
                    </div>
                )}

                {/* Back Button */}
                <div className="pt-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        ← Back to Main page
                    </button>
                </div>
            </div>
        </div>
    );
}
