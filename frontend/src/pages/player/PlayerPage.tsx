import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Player } from "../../model/player/Player";
import { User } from "../../model/user/User";

const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-3 px-5 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors border-l-4 border-transparent hover:border-l-emerald-300">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
    </div>
);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const formatDob = (dob: number[]): string => {
        const [y, m, d] = dob;
        return `${d < 10 ? "0" + d : d}/${m < 10 ? "0" + m : m}/${y}`;
};

export function PlayerPage() {
    const { playerId } = useParams<{ playerId: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playerId) return;

        fetch(`/api/players/${playerId}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json() as Promise<Player>;
            })
            .then(async p => {
                setPlayer(p);
                const userRes = await fetch(`/api/users/${p.userId}`);
                if (userRes.ok) setUser(await userRes.json());
                setLoading(false);
            })
            .catch(() => { setPlayer(null); setLoading(false); });
    }, [playerId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
    }

    if (!player) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Player not found</div>;
    }

    const initials = user
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : "?";

    return (
        <div className="min-h-screen relative bg-cover bg-center"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-60" />

            <div className="relative z-10 px-4 py-12 sm:py-16">
                <div className="max-w-2xl mx-auto">

                    <Link to="/"
                          className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>

                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

                        {/* Header */}
                        <div className="p-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                            <div className="flex items-center gap-6">
                                {user?.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="Profile"
                                         className="w-24 h-24 rounded-full object-cover shadow-xl flex-shrink-0" />
                                ) : (
                                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                                        <span className="text-2xl font-black text-white">{initials}</span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h1 className="text-3xl font-black text-gray-900 truncate">
                                        {user ? `${user.firstName} ${user.lastName}` : "—"}
                                    </h1>
                                    <div className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl inline-flex items-center gap-2 shadow-lg">
                                        <span className="text-2xl font-black">{player.rating.toFixed(1)}</span>
                                        <span className="text-sm font-semibold uppercase tracking-wide">Rating</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Player specs */}
                        <div className="p-6 space-y-1.5">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1 mb-3">Player Info</p>
                            <FieldRow label="Gender"    value={capitalize(player.gender)} />
                            <FieldRow label="Hand"      value={capitalize(player.hand)} />
                            <FieldRow label="Court Side" value={capitalize(player.courtSide)} />
                        </div>

                        {/* User details */}
                        {user && (user.city || user.country || user.dateOfBirth) && (
                            <div className="px-6 pb-6 space-y-1.5 border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1 mb-3">Personal Info</p>
                                {user.city        && <FieldRow label="City"         value={user.city} />}
                                {user.country     && <FieldRow label="Country"      value={user.country} />}
                                {user.dateOfBirth && <FieldRow label="Date of Birth" value={formatDob(user.dateOfBirth)} />}
                            </div>
                        )}

                        {/* Playtomic link */}
                        {user?.playtomicProfileUrl && (
                            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                                <a href={user.playtomicProfileUrl} target="_blank" rel="noreferrer"
                                   className="w-full block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center">
                                    View Playtomic Profile →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}