import { Routes, Route, Navigate } from "react-router-dom";
import { PlayerPage } from "./pages/player/PlayerPage";
import { MainPage } from "./pages/MainPage";
import { PlayerRegisterPage } from "./pages/player/PlayerRegisterPage";
import {TournamentCreatePage} from "./pages/tournament/TournamentCreatePage";
import {TournamentPage} from "./pages/tournament/TournamentPage";
import {TournamentEditPage} from "./pages/tournament/TournamentEditPage";

export default function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/register" element={<PlayerRegisterPage />} />
                <Route path="/players/:playerId" element={<PlayerPage />} />
                <Route path="/tournaments/new" element={<TournamentCreatePage />} />
                <Route path="/tournaments/:tournamentId" element={<TournamentPage />} />
                <Route path="/tournaments/:tournamentId/edit" element={<TournamentEditPage />} />
                <Route path="*" element={<div className="p-6">Not found</div>} />
            </Routes>
        </div>
    );
}
