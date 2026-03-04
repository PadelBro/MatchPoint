import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RATING_OPTIONS } from "../../model/player/RatingOptions";
import { STATUSES, Tournament, TournamentStatus } from "../../model/tournament/Tournament";
import { Filters } from "../../model/tournament/Filters";

const STORAGE_KEY = "tournamentFilters";

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

function loadFilters(): Filters {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch {}
    return emptyFilters();
}

const statusColor: Record<TournamentStatus, string> = {
    pending: "bg-yellow-400/20 text-yellow-300 border-yellow-400/50",
    active: "bg-emerald-400/20 text-emerald-300 border-emerald-400/50",
    completed: "bg-gray-400/20 text-gray-400 border-gray-400/40",
};

const statusGlow: Record<TournamentStatus, string> = {
    pending: "shadow-yellow-500/10",
    active: "shadow-emerald-500/20",
    completed: "shadow-none",
};

function formatDate(ms: number) {
    return new Date(ms).toLocaleString([], {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export function TournamentListPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Filters>(loadFilters);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const inputClass =
        "px-3 py-2 rounded-xl backdrop-blur-sm transition-all border border-white/20 bg-white/10 text-white placeholder-white/40 hover:border-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:outline-none text-sm";

    const runSearch = async (f: Filters) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(f));
        setLoading(true);
        setError(null);
        try {
            const body: Record<string, unknown> = {};
            if (f.city.trim()) body.city = f.city.trim();
            if (f.status) body.status = f.status;
            if (f.startDate != null && !isNaN(f.startDate)) body.startDate = f.startDate;
            if (f.endDate != null && !isNaN(f.endDate)) body.endDate = f.endDate;
            if (f.minRating != null && !isNaN(f.minRating)) body.minRating = f.minRating;
            if (f.maxRating != null && !isNaN(f.maxRating)) body.maxRating = f.maxRating;
            body.offset = f.offset;
            body.limit = f.limit;

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

    useEffect(() => {
        runSearch(loadFilters());
    }, []);

    const handleSearch = () => runSearch(filters);

    const handleReset = () => {
        const empty = emptyFilters();
        setFilters(empty);
        sessionStorage.removeItem(STORAGE_KEY);
        runSearch(empty);
    };

    return (
        <div
            className="min-h-screen relative bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60" />

            <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent drop-shadow-xl">
                        Tournaments
                    </h1>
                    <button
                        onClick={() => navigate("/")}
                        className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                {/* Filter bar — single line */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl px-5 py-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            placeholder="City"
                            className={`${inputClass} w-32`}
                        />
                        <select
                            value={filters.status ?? ""}
                            onChange={(e) =>
                                setFilters({ ...filters, status: e.target.value ? (e.target.value as TournamentStatus) : null })
                            }
                            className={`${inputClass} w-32`}
                        >
                            <option value="">Any status</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            value={filters.startDate != null && !isNaN(filters.startDate) ? new Date(filters.startDate).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value ? new Date(e.target.value).getTime() : null })}
                            className={`${inputClass} w-48`}
                        />
                        <span className="text-white/40 text-sm">–</span>
                        <input
                            type="datetime-local"
                            value={filters.endDate != null && !isNaN(filters.endDate) ? new Date(filters.endDate).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value ? new Date(e.target.value).getTime() : null })}
                            className={`${inputClass} w-48`}
                        />
                        <select
                            value={filters.minRating != null && !isNaN(filters.minRating) ? filters.minRating : ""}
                            onChange={(e) => setFilters({ ...filters, minRating: e.target.value !== "" ? Number(e.target.value) : null })}
                            className={`${inputClass} w-32`}
                        >
                            <option value="">Min rating</option>
                            {RATING_OPTIONS.map((r) => <option key={r} value={r}>{r.toFixed(1)}</option>)}
                        </select>
                        <select
                            value={filters.maxRating != null && !isNaN(filters.maxRating) ? filters.maxRating : ""}
                            onChange={(e) => setFilters({ ...filters, maxRating: e.target.value !== "" ? Number(e.target.value) : null })}
                            className={`${inputClass} w-32`}
                        >
                            <option value="">Max rating</option>
                            {RATING_OPTIONS.map((r) => <option key={r} value={r}>{r.toFixed(1)}</option>)}
                        </select>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 text-sm uppercase tracking-wide"
                        >
                            {loading ? "Searching…" : "Search"}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-xl border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all text-sm"
                        >
                            Reset
                        </button>
                    </div>
                    {error && (
                        <div className="text-red-300 text-sm px-3 py-2 bg-red-900/20 rounded-xl border border-red-500/30">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {searched && (
                    <div className="space-y-3">
                        {tournaments.length === 0 ? (
                            <p className="text-white/50 text-center py-12">No tournaments found.</p>
                        ) : (
                            tournaments.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => navigate(`/tournaments/${t.id}`)}
                                    className={`backdrop-blur-xl bg-white/8 border border-white/15 rounded-2xl px-6 py-4 cursor-pointer hover:bg-white/15 hover:border-white/30 transition-all duration-200 shadow-xl ${statusGlow[t.status]}`}
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Name + city + description */}
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-white font-bold text-lg leading-tight truncate">{t.name}</h2>
                                            <p className="text-emerald-300/70 text-sm font-medium">{t.city}</p>
                                            {t.description && (
                                                <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{t.description}</p>
                                            )}
                                        </div>

                                        {/* Dates */}
                                        <div className="hidden md:flex flex-col items-center text-center w-44 shrink-0">
                                            <span className="text-white/90 text-sm font-semibold">{formatDate(t.startDate)}</span>
                                            <span className="text-white/30 text-xs my-0.5">↓</span>
                                            <span className="text-white/90 text-sm font-semibold">{formatDate(t.endDate)}</span>
                                        </div>

                                        {/* Rating */}
                                        <div className="w-24 shrink-0 text-center">
                                            <div className="text-xs text-white/50 uppercase tracking-wide mb-0.5">Rating</div>
                                            <div className="text-white font-bold text-base">
                                                {t.minRating.toFixed(1)}
                                                <span className="text-white/40 mx-1">–</span>
                                                {t.maxRating.toFixed(1)}
                                            </div>
                                        </div>

                                        {/* Prizes */}
                                        <div className="w-36 shrink-0 hidden lg:block">
                                            <div className="text-xs text-white/50 uppercase tracking-wide mb-0.5">Prizes</div>
                                            <div className="text-yellow-300 font-semibold text-sm truncate">
                                                {t.prizes ?? "—"}
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        <div className="w-24 shrink-0 flex justify-center">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${statusColor[t.status]}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dates on mobile */}
                                    <div className="md:hidden mt-2 text-white/60 text-xs">
                                        {formatDate(t.startDate)} – {formatDate(t.endDate)}
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