import { Link } from "react-router-dom";

export function MainPage() {
    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-emerald-900/50"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-4xl mx-auto text-center">

                    {/* Hero content */}
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 md:p-20 shadow-2xl max-w-3xl mx-auto">

                        {/* Logo/Title */}
                        <div className="mb-12">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl mb-6 leading-tight">
                                MatchPoint
                            </h1>
                            <div className="w-32 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto rounded-full shadow-lg"></div>
                        </div>

                        {/* Tagline */}
                        <p className="text-xl md:text-2xl lg:text-3xl text-white/95 font-light mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                            Effortlessly organize players and tournaments
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 justify-center items-center">
                            <Link
                                to="/players/register"
                                className="group relative px-10 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden w-full sm:w-auto max-w-sm"
                            >
                                <span className="relative z-10">Register a Player</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-full group-hover:translate-y-0"></div>
                            </Link>

                            <Link
                                to="/tournaments/new"
                                className="group relative px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden w-full sm:w-auto max-w-sm"
                            >
                                <span className="relative z-10">Create a Tournament</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-full group-hover:translate-y-0"></div>
                            </Link>
                        </div>

                        {/* Secondary links */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-16 pt-12 border-t border-white/20 justify-center">
                            <Link
                                to="/players"
                                className="px-8 py-3 text-white/90 font-semibold rounded-xl hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/30 hover:border-white/50 flex-1 text-center"
                            >
                                Browse Players
                            </Link>
                            <Link
                                to="/tournaments"
                                className="px-8 py-3 text-white/90 font-semibold rounded-xl hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/30 hover:border-white/50 flex-1 text-center"
                            >
                                View Tournaments
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
