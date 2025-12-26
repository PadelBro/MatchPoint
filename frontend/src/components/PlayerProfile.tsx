import { Player } from "../types";

interface Props {
    player: Player;
}

export const PlayerProfile = ({ player }: Props) => {
    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 space-y-3">
            <h1 className="text-xl font-semibold">{player.username}</h1>

            <div className="text-sm text-gray-600">
                <strong>Rating:</strong> {player.ratingZone}
            </div>

            <div className="text-sm text-gray-600">
                <strong>Home:</strong> {player.homeAddress}
            </div>

            {player.playtomicProfileUrl && (
                <a
                    href={player.playtomicProfileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                >
                    View Playtomic profile (only for mobile usage)
                </a>
            )}
        </div>
    );
};
