import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {Player} from "../../model/player/Player";

// Reusable FieldRow component
const FieldRow = ({
                      label,
                      value
}: {
    label: string;
    value: string;
    borderColor?: "emerald" | "blue" | "purple";
}) => {
    const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <div className="flex justify-between items-center py-4 px-6 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors border-l-4 border-l-4 hover:border-l-4">
            <span className="font-medium text-gray-700 text-lg">{label}</span>
            <span className="font-bold text-gray-900 text-lg">
                {capitalize(value)}
            </span>
        </div>
    );
};

export function PlayerPage() {
    const { playerId } = useParams<{ playerId: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playerId) return;

        fetch(`/api/players/${playerId}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then(setPlayer)
            .catch(() => setPlayer(null))
            .finally(() => setLoading(false));
    }, [playerId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                Loading...
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                Player not found
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-cover bg-center"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>

            <div className="relative z-10 px-4 py-12 sm:py-16">
                <div className="max-w-2xl mx-auto">

                    {/* Back button */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Main page
                    </Link>

                    {/* Profile card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

                        {/* Header: Avatar left + Rating right */}
                        <div className="p-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12">
                                <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                                    <span className="text-3xl font-semibold text-gray-600">👤</span>
                                </div>
                                <div className="flex-1 text-center lg:text-left min-w-0">
                                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 truncate">
                                        {player.username}
                                    </h1>
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl inline-block shadow-lg">
                                        <span className="text-2xl lg:text-3xl font-black">{player.rating.toFixed(1)}</span>
                                        <span className="ml-2 text-sm lg:text-base font-semibold uppercase tracking-wide">Rating</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Unified field list using FieldRow */}
                        <div className="p-8 space-y-2">

                            {/* Profile fields - Using reusable FieldRow */}
                            <FieldRow label="Home Address" value={player.homeAddress} borderColor="blue" />
                            <FieldRow label="Gender" value={player.gender} borderColor="blue" />
                            <FieldRow label="Hand" value={player.hand} borderColor="blue" />
                            <FieldRow label="Court Side" value={player.courtSide} borderColor="blue" />
                        </div>

                        {/* Playtomic Link */}
                        {player.playtomicProfileUrl && (
                            <div className="p-8 pt-6 border-t border-gray-100">
                                <a
                                    href={player.playtomicProfileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-center"
                                >
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
