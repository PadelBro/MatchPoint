import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RATING_OPTIONS } from "../../model/player/RatingOptions";
import { useUser } from "../../context/UserContext";

// ── Step 1: user info ────────────────────────────────────────────────────────

type UserForm = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string;
    city: string;
    country: string;
    profilePictureUrl: string;
    playtomicProfileUrl: string;
};

type UserErrors = Partial<Record<keyof UserForm | "form", string>>;

// ── Step 2: player specs ─────────────────────────────────────────────────────

type PlayerForm = {
    rating: string;
    gender: string;
    hand: string;
    courtSide: string;
};

type PlayerErrors = Partial<Record<keyof PlayerForm | "form", string>>;

// ── Shared helpers ───────────────────────────────────────────────────────────

const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 border focus:outline-none focus:ring-2 ${
        hasError
            ? "border-red-400 bg-red-50/50 focus:ring-red-200"
            : "border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-emerald-200"
    }`;

const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

// ── Page ─────────────────────────────────────────────────────────────────────

export function RegisterPage() {
    const navigate = useNavigate();
    const { setUser } = useUser();

    const [step, setStep] = useState<1 | 2>(1);

    // Step 1 state
    const [userForm, setUserForm] = useState<UserForm>({
        firstName: "", lastName: "", email: "", password: "",
        phoneNumber: "", dateOfBirth: "", city: "", country: "",
        profilePictureUrl: "", playtomicProfileUrl: "",
    });
    const [userErrors, setUserErrors] = useState<UserErrors>({});
    const [userSubmitting, setUserSubmitting] = useState(false);

    // Step 2 state
    const [playerForm, setPlayerForm] = useState<PlayerForm>({
        rating: "", gender: "", hand: "", courtSide: "",
    });
    const [playerErrors, setPlayerErrors] = useState<PlayerErrors>({});
    const [playerSubmitting, setPlayerSubmitting] = useState(false);

    // ── Step 1 handlers ──────────────────────────────────────────────────────

    const handleUserChange = (field: keyof UserForm) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setUserForm({ ...userForm, [field]: e.target.value });
            if (userErrors[field]) setUserErrors({ ...userErrors, [field]: undefined });
        };

    const validateUser = (): UserErrors => {
        const e: UserErrors = {};
        if (!userForm.firstName.trim()) e.firstName = "Required";
        if (!userForm.lastName.trim()) e.lastName = "Required";
        if (!userForm.email.trim()) {
            e.email = "Required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email.trim())) {
            e.email = "Invalid email address";
        }
        if (!userForm.password) e.password = "Required";
        return e;
    };

    const handleUserSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validateUser();
        setUserErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setUserSubmitting(true);
        try {
            const checkBody: Record<string, string> = { email: userForm.email.trim().toLowerCase() };
            if (userForm.phoneNumber.trim()) checkBody.phoneNumber = userForm.phoneNumber.trim();
            if (userForm.country.trim())     checkBody.country = userForm.country.trim().toUpperCase();

            const res = await fetch("/api/users/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkBody),
            });
            if (!res.ok) {
                const msg = await res.text().catch(() => "");
                setUserErrors({ form: msg || "Failed to check availability" });
                return;
            }
            setStep(2);
        } catch {
            setUserErrors({ form: "Failed to check availability" });
        } finally {
            setUserSubmitting(false);
        }
    };

    // ── Step 2 handlers ──────────────────────────────────────────────────────

    const handlePlayerChange = (field: keyof PlayerForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setPlayerForm({ ...playerForm, [field]: e.target.value });
            if (playerErrors[field]) setPlayerErrors({ ...playerErrors, [field]: undefined });
        };

    const validatePlayer = (): PlayerErrors => {
        const e: PlayerErrors = {};
        if (!playerForm.rating)    e.rating    = "Required";
        if (!playerForm.gender)    e.gender    = "Required";
        if (!playerForm.hand)      e.hand      = "Required";
        if (!playerForm.courtSide) e.courtSide = "Required";
        return e;
    };

    const handlePlayerSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validatePlayer();
        setPlayerErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setPlayerSubmitting(true);
        try {
            // Build user body
            const userBody: Record<string, string> = {
                firstName: userForm.firstName.trim(),
                lastName: userForm.lastName.trim(),
                email: userForm.email.trim().toLowerCase(),
                password: userForm.password,
            };
            if (userForm.phoneNumber.trim())         userBody.phoneNumber = userForm.phoneNumber.trim();
            if (userForm.dateOfBirth)                userBody.dateOfBirth = userForm.dateOfBirth;
            if (userForm.city.trim())                userBody.city = userForm.city.trim();
            if (userForm.country.trim())             userBody.country = userForm.country.trim().toUpperCase();
            if (userForm.profilePictureUrl.trim())   userBody.profilePictureUrl = userForm.profilePictureUrl.trim();
            if (userForm.playtomicProfileUrl.trim()) userBody.playtomicProfileUrl = userForm.playtomicProfileUrl.trim();

            // Create user
            const userRes = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userBody),
            });
            if (!userRes.ok) {
                const msg = await userRes.text().catch(() => "");
                setUserErrors({ form: msg || "Failed to create account" });
                setStep(1);
                return;
            }
            const createdUser = await userRes.json();

            // Login
            const loginRes = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userForm.email.trim().toLowerCase(), password: userForm.password }),
            });
            if (!loginRes.ok) {
                setPlayerErrors({ form: "Account created but login failed. Please log in manually." });
                return;
            }
            const session = await loginRes.json();
            setUser({ id: session.id, firstName: session.firstName, lastName: session.lastName, token: session.token });

            // Create player
            const playerRes = await fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: createdUser.id,
                    rating: playerForm.rating,
                    gender: playerForm.gender,
                    hand: playerForm.hand,
                    courtSide: playerForm.courtSide,
                }),
            });
            if (!playerRes.ok) {
                const msg = await playerRes.text().catch(() => "");
                setPlayerErrors({ form: msg || "Failed to create player profile" });
                return;
            }
            const player = await playerRes.json();
            navigate(`/players/${player.id}`);
        } catch {
            setPlayerErrors({ form: "Failed to submit" });
        } finally {
            setPlayerSubmitting(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60" />

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-lg">

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        {[1, 2].map(n => (
                            <div key={n} className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                    step === n
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                                        : n < step
                                            ? "bg-emerald-700/60 text-emerald-200"
                                            : "bg-white/20 text-white/50"
                                }`}>{n}</div>
                                <span className={`text-sm font-semibold ${step === n ? "text-white" : "text-white/40"}`}>
                                    {n === 1 ? "Account" : "Player Profile"}
                                </span>
                                {n < 2 && <div className="w-8 h-px bg-white/20 ml-1" />}
                            </div>
                        ))}
                    </div>

                    {/* ── Step 1: User info ── */}
                    {step === 1 && (
                        <form onSubmit={handleUserSubmit}
                              className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-5">
                            <h1 className="text-2xl font-black text-white text-center mb-6">Create Account</h1>

                            {userErrors.form && (
                                <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                                    {userErrors.form}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input type="text" value={userForm.firstName}
                                           onChange={handleUserChange("firstName")}
                                           className={inputClass(!!userErrors.firstName)}
                                           placeholder="John" maxLength={100} />
                                    {userErrors.firstName && <p className="text-red-300 text-xs mt-1">{userErrors.firstName}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input type="text" value={userForm.lastName}
                                           onChange={handleUserChange("lastName")}
                                           className={inputClass(!!userErrors.lastName)}
                                           placeholder="Doe" maxLength={100} />
                                    {userErrors.lastName && <p className="text-red-300 text-xs mt-1">{userErrors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email *</label>
                                <input type="email" value={userForm.email}
                                       onChange={handleUserChange("email")}
                                       className={inputClass(!!userErrors.email)}
                                       placeholder="john@example.com" />
                                {userErrors.email && <p className="text-red-300 text-xs mt-1">{userErrors.email}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Password *</label>
                                <input type="password" value={userForm.password}
                                       onChange={handleUserChange("password")}
                                       className={inputClass(!!userErrors.password)}
                                       placeholder="••••••••" />
                                {userErrors.password && <p className="text-red-300 text-xs mt-1">{userErrors.password}</p>}
                            </div>

                            <div className="pt-2 border-t border-white/15">
                                <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-4">Optional</p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Phone</label>
                                            <input type="tel" value={userForm.phoneNumber}
                                                   onChange={handleUserChange("phoneNumber")}
                                                   className={inputClass()} placeholder="+31 6 12345678" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Date of Birth</label>
                                            <input type="date" value={userForm.dateOfBirth}
                                                   onChange={handleUserChange("dateOfBirth")}
                                                   className={inputClass()} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>City</label>
                                            <input type="text" value={userForm.city}
                                                   onChange={handleUserChange("city")}
                                                   className={inputClass()} placeholder="Amsterdam" maxLength={100} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Country</label>
                                            <input type="text" value={userForm.country}
                                                   onChange={handleUserChange("country")}
                                                   className={inputClass()} placeholder="NL" maxLength={2} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Playtomic URL</label>
                                        <input type="url" value={userForm.playtomicProfileUrl}
                                               onChange={handleUserChange("playtomicProfileUrl")}
                                               className={inputClass()} placeholder="https://playtomic.io/..." />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={userSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide">
                                {userSubmitting ? "Checking..." : "Next →"}
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: Player specs ── */}
                    {step === 2 && (
                        <form onSubmit={handlePlayerSubmit}
                              className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-5">
                            <h1 className="text-2xl font-black text-white text-center mb-6">Player Profile</h1>

                            {playerErrors.form && (
                                <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                                    {playerErrors.form}
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Rating *</label>
                                <select value={playerForm.rating} onChange={handlePlayerChange("rating")}
                                        className={inputClass(!!playerErrors.rating)}>
                                    <option value="">Select</option>
                                    {RATING_OPTIONS.map(r => (
                                        <option key={r} value={r}>{r.toFixed(1)}</option>
                                    ))}
                                </select>
                                {playerErrors.rating && <p className="text-red-300 text-xs mt-1">{playerErrors.rating}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Gender *</label>
                                    <select value={playerForm.gender} onChange={handlePlayerChange("gender")}
                                            className={inputClass(!!playerErrors.gender)}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {playerErrors.gender && <p className="text-red-300 text-xs mt-1">{playerErrors.gender}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Hand *</label>
                                    <select value={playerForm.hand} onChange={handlePlayerChange("hand")}
                                            className={inputClass(!!playerErrors.hand)}>
                                        <option value="">Select</option>
                                        <option value="right">Right</option>
                                        <option value="left">Left</option>
                                    </select>
                                    {playerErrors.hand && <p className="text-red-300 text-xs mt-1">{playerErrors.hand}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Court *</label>
                                    <select value={playerForm.courtSide} onChange={handlePlayerChange("courtSide")}
                                            className={inputClass(!!playerErrors.courtSide)}>
                                        <option value="">Select</option>
                                        <option value="right">Right</option>
                                        <option value="left">Left</option>
                                    </select>
                                    {playerErrors.courtSide && <p className="text-red-300 text-xs mt-1">{playerErrors.courtSide}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStep(1)}
                                        className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold text-lg py-4 rounded-xl border border-white/30 transition-all duration-300">
                                    ← Back
                                </button>
                                <button type="submit" disabled={playerSubmitting}
                                        className="flex-2 flex-grow bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide">
                                    {playerSubmitting ? "Creating..." : "Complete Registration"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}