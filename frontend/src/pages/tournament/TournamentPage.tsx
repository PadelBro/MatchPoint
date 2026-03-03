import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {Tournament} from "../../model/tournament/Tournament";

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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    const getStatusBadge = (status: Tournament['status']) => {
        const colors = {
            pending: 'bg-gray-500',
            active: 'bg-emerald-500',
            completed: 'bg-blue-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
                <div className="w-full max-w-xl backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-5">

                    {/* Back button */}
                    <button
                        onClick={() => navigate('/tournaments')}
                        className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Tournaments
                    </button>

                    {/* Profile card - Compact glassmorphism */}
                    <div className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-6 max-h-[85vh] overflow-y-auto">

                        {/* Header */}
                        <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/20">
                            <div>
                                <h1 className="text-3xl font-black text-white drop-shadow-lg leading-tight">
                                    {tournament.name}
                                </h1>
                                <div className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg ${getStatusBadge(tournament.status)}`}>
                                    {tournament.status.toUpperCase()}
                                </div>
                            </div>

                            {canEdit && (
                                <button
                                    onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                                    className="px-5 py-2.5 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        {tournament.description && (
                            <div className="bg-white/20 backdrop-blur p-4 rounded-xl border border-white/30">
                                <p className="text-white/95 leading-relaxed text-sm">{tournament.description}</p>
                            </div>
                        )}

                        {/* Compact info grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                            <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200 mb-1 block">City</span>
                                <span className="text-xl font-bold block">{tournament.city}</span>
                            </div>

                            <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200 mb-3 block">Dates</span>
                                <div className="space-y-2 text-left">
                                    <div className="flex items-center gap-2 text-sm font-medium text-white/95">
                                        <span>Start:</span>
                                        <span className="font-semibold">{formatDate(tournament.startDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-white/95">
                                        <span>End:</span>
                                        <span className="font-semibold">{formatDate(tournament.endDate)}</span>
                                    </div>
                                </div>
                            </div>


                            {/* Rating Range */}
                            <div className="md:col-span-2 p-4 bg-emerald-500/10 backdrop-blur border border-emerald-300/50 rounded-xl">
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300 mb-2 block">Rating Range</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-emerald-200">{tournament.minRating.toFixed(1)}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="w-full h-1.5 bg-white/30 rounded-full">
                                            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full w-full" />
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-teal-200">{tournament.maxRating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Prizes */}
                        {tournament.prizes && (
                            <div className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30">
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200 mb-2 block">Prizes</span>
                                <p className="text-white/95 text-sm leading-relaxed">{tournament.prizes}</p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => navigate('/tournaments')}
                                className="flex-1 px-6 py-3 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl"
                            >
                                All Tournaments
                            </button>
                            {canEdit && (
                                <button
                                    onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                                    className="flex-1 px-6 py-3 bg-emerald-500/80 backdrop-blur text-white font-semibold rounded-xl hover:bg-emerald-600/90 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-400/50"
                                >
                                    Edit Tournament
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
