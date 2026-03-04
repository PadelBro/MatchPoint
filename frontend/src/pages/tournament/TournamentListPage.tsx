import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RATING_OPTIONS } from "../../model/player/RatingOptions";
import {STATUSES, Tournament, TournamentStatus} from "../../model/tournament/Tournament";
import { Filters } from "../../model/tournament/Filters";

const emptyFilters = (): Filters => ({
    city: "",
    status: null,
    startDate: null,
    endDate: null,
    minRating: null,
    maxRating: null,
    offset: 0,
    limit: 25,
});

const statusColor: Record<TournamentStatus, string> = {
    pending: "bg-yellow-400/20 text-yellow-200 border-yellow-400/40",
    active: "bg-emerald-400/20 text-emerald-200 border-emerald-400/40",
    completed: "bg-gray-400/20 text-gray-300 border-gray-400/40",
};

export function TournamentListPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Filters>(emptyFilters());
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const inputClass =
        "w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all border border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200 focus:outline-none";
    const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const body: Record<string, unknown> = {};
            if (filters.city.trim()) body.city = filters.city.trim();
            if (filters.status) body.status = filters.status;
            if (filters.startDate != null && !isNaN(filters.startDate)) body.startDate = filters.startDate;
            if (filters.endDate != null && !isNaN(filters.endDate)) body.endDate = filters.endDate;
            if (filters.minRating != null && !isNaN(filters.minRating)) body.minRating = filters.minRating;
            if (filters.maxRating != null && !isNaN(filters.maxRating)) body.maxRating = filters.maxRating;
            body.offset = filters.offset;
            body.limit = filters.limit;

            const res = await fetch("/api/tournaments/filter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error(await res.text() || "Search failed");
            setTournaments(await res.json());
            setSearched(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters(emptyFilters());
        setTournaments([]);
        setSearched(false);
        setError(null);
    };

    return (
        <div
            className="min-h-screen relative bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60" />

            <div className="relative z-10 px-4 py-8 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-100/50 bg-clip-text text-transparent drop-shadow-xl">
                        Tournaments
                    </h1>
                    <button
                        onClick={() => navigate("/")}
                        className="text-white/70 hover:text-white text-sm transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                {/* Filter panel */}
                <div className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* City */}
                        <div>
                            <label className={labelClass}>City</label>
                            <input
                                type="text"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                placeholder="Amsterdam"
                                className={inputClass}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className={labelClass}>Status</label>
                            <select
                                value={filters.status ?? ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value ? (e.target.value as TournamentStatus) : null,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="">Any</option>
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start date */}
                        <div>
                            <label className={labelClass}>From</label>
                            <input
                                type="datetime-local"
                                value={
                                    filters.startDate != null && !isNaN(filters.startDate)
                                        ? new Date(filters.startDate).toISOString().slice(0, 16)
                                        : ""
                                }
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        startDate: e.target.value ? new Date(e.target.value).getTime() : null,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        {/* End date */}
                        <div>
                            <label className={labelClass}>To</label>
                            <input
                                type="datetime-local"
                                value={
                                    filters.endDate != null && !isNaN(filters.endDate)
                                        ? new Date(filters.endDate).toISOString().slice(0, 16)
                                        : ""
                                }
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        endDate: e.target.value ? new Date(e.target.value).getTime() : null,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        {/* Min rating */}
                        <div>
                            <label className={labelClass}>Min Rating</label>
                            <select
                                value={filters.minRating != null && !isNaN(filters.minRating) ? filters.minRating : ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        minRating: e.target.value !== "" ? Number(e.target.value) : null,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="">Any</option>
                                {RATING_OPTIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r.toFixed(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Max rating */}
                        <div>
                            <label className={labelClass}>Max Rating</label>
                            <select
                                value={filters.maxRating != null && !isNaN(filters.maxRating) ? filters.maxRating : ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        maxRating: e.target.value !== "" ? Number(e.target.value) : null,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="">Any</option>
                                {RATING_OPTIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r.toFixed(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-5 py-3 rounded-xl border border-white/30 text-white/70 hover:text-white hover:border-white/50 transition-all"
                        >
                            Reset
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-300 text-sm p-2 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {searched && (
                    <div className="space-y-3">
                        {tournaments.length === 0 ? (
                            <p className="text-white/60 text-center py-8">No tournaments found.</p>
                        ) : (
                            tournaments.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => navigate(`/tournaments/${t.id}`)}
                                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 cursor-pointer hover:bg-white/20 hover:border-white/40 transition-all duration-200 shadow-lg"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="text-white font-bold text-lg truncate">{t.name}</h2>
                                            <p className="text-white/60 text-sm mt-0.5">{t.city}</p>
                                        </div>
                                        <span
                                            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColor[t.status]}`}
                                        >
                                            {t.status}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                                        <span>
                                            {new Date(t.startDate).toLocaleDateString()} –{" "}
                                            {new Date(t.endDate).toLocaleDateString()}
                                        </span>
                                        <span>
                                            Rating {t.minRating.toFixed(1)} – {t.maxRating.toFixed(1)}
                                        </span>
                                        {t.prizes && <span>{t.prizes}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
