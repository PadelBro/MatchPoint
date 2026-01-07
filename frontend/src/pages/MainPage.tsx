import { Link } from "react-router-dom";

export function MainPage() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative z-10 w-full max-w-md bg-white bg-opacity-90 rounded-xl shadow p-6 text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Welcome to MatchPoint</h1>
                <p className="text-lg text-gray-700">
                    Organize and view players and tournaments with ease
                </p>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
                    <Link
                        to="/register"
                        className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition-colors"
                    >
                        Register Player
                    </Link>

                    <Link
                        to="/tournaments/new"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded transition-colors"
                    >
                        Create Tournament
                    </Link>
                </div>
            </div>
        </div>
    );
}
