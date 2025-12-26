import { Routes, Route, Navigate } from "react-router-dom";
import { PlayerPage } from "./pages/PlayerPage";
import { MainPage } from "./pages/MainPage";
import { PlayerRegisterPage } from "./pages/PlayerRegisterPage";

export default function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/register" element={<PlayerRegisterPage />} />
                <Route path="/players/:playerId" element={<PlayerPage />} />
                <Route path="*" element={<div className="p-6">Not found</div>} />
            </Routes>
        </div>
    );
}
