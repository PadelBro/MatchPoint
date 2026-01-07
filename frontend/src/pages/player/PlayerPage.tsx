import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Player } from "../../types";

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
        <div
            className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Profile card */}
            <div className="relative z-10 bg-white bg-opacity-90 p-6 rounded-xl shadow-lg max-w-md w-full mx-4 space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                    {player.username}
                </h1>

                <p className="text-gray-700">
                    <strong>Rating:</strong> {player.ratingZone}
                </p>

                <p className="text-gray-700">
                    <strong>City:</strong> {player.homeAddress}
                </p>

                <p className="text-gray-700">
                    <strong>Gender:</strong> {player.gender}
                </p>

                <p className="text-gray-700">
                    <strong>Hand:</strong> {player.hand}
                </p>

                <p className="text-gray-700">
                    <strong>Court side:</strong> {player.courtSide}
                </p>

                {player.playtomicProfileUrl && (
                    <a
                        href={player.playtomicProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block pt-3 text-blue-600 underline"
                    >
                        View Playtomic profile
                    </a>
                )}
            </div>
        </div>
    );
}
