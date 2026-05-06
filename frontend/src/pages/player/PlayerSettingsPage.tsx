import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { RATING_OPTIONS } from "../../model/player/RatingOptions";
import type { Player } from "../../model/player/Player";
import { getErrorMessage } from "../../utils/apiError";
import { useAuthFetch } from "../../hooks/useAuthFetch";

type AccountForm = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    city: string;
    country: string;
    playtomicProfileUrl: string;
};
type AccountErrors = Partial<Record<keyof AccountForm | "form", string>>;

type PlayerForm = {
    rating: string;
    gender: string;
    hand: string;
    courtSide: string;
};
type PlayerErrors = Partial<Record<keyof PlayerForm | "form", string>>;

const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 border focus:outline-none focus:ring-2 ${
        hasError
            ? "border-red-400 bg-red-50/50 focus:ring-red-200"
            : "border-white/20 bg-white/60 hover:border-white/40 focus:border-emerald-300 focus:ring-emerald-200"
    }`;

const labelClass = "block text-sm font-semibold text-white mb-2 tracking-wide uppercase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PlayerSettingsPage() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    // ── Account section ──────────────────────────────────────────────────────
    const [accountForm, setAccountForm] = useState<AccountForm>({
        firstName: "", lastName: "", email: "",
        phoneNumber: "", dateOfBirth: "",
        city: "", country: "", playtomicProfileUrl: "",
    });
    const [accountErrors, setAccountErrors] = useState<AccountErrors>({});
    const [accountSubmitting, setAccountSubmitting] = useState(false);
    const [accountSaved, setAccountSaved] = useState(false);

    // ── Player section ───────────────────────────────────────────────────────
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [playerForm, setPlayerForm] = useState<PlayerForm>({ rating: "", gender: "", hand: "", courtSide: "" });
    const [playerErrors, setPlayerErrors] = useState<PlayerErrors>({});
    const [playerSubmitting, setPlayerSubmitting] = useState(false);
    const [playerSaved, setPlayerSaved] = useState(false);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }

        // Fetch user account info
        authFetch(`/api/users/${user.id}`, {
            headers: { "Authorization": `Bearer ${user.token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(u => {
                if (!u) return;
                setAccountForm({
                    firstName: u.firstName ?? "",
                    lastName: u.lastName ?? "",
                    email: u.email ?? "",
                    phoneNumber: u.phoneNumber ?? "",
                    dateOfBirth: u.dateOfBirth ?? "",
                    city: u.city ?? "",
                    country: u.country ?? "",
                    playtomicProfileUrl: u.playtomicProfileUrl ?? "",
                });
            })
            .catch(() => {});

        // Fetch player profile
        fetch(`/api/players?userId=${user.id}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json() as Promise<Player>;
            })
            .then(p => {
                setPlayer(p);
                setPlayerForm({
                    rating: String(p.rating),
                    gender: p.gender,
                    hand: p.hand,
                    courtSide: p.courtSide,
                });
            })
            .catch(() => setPlayer(null))
            .finally(() => setLoading(false));
    }, [user]);

    // ── Account handlers ─────────────────────────────────────────────────────

    const handleAccountChange = (field: keyof AccountForm) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setAccountForm({ ...accountForm, [field]: e.target.value });
            if (accountErrors[field]) setAccountErrors({ ...accountErrors, [field]: undefined });
            setAccountSaved(false);
        };

    const validateAccount = (): AccountErrors => {
        const e: AccountErrors = {};
        if (!accountForm.firstName.trim()) e.firstName = "Required";
        if (!accountForm.lastName.trim())  e.lastName  = "Required";
        if (!accountForm.email.trim())     e.email     = "Required";
        else if (!EMAIL_RE.test(accountForm.email.trim())) e.email = "Invalid email";
        return e;
    };

    const handleAccountSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validateAccount();
        setAccountErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setAccountSubmitting(true);
        try {
            const body: Record<string, string> = {
                firstName: accountForm.firstName.trim(),
                lastName:  accountForm.lastName.trim(),
                email:     accountForm.email.trim(),
            };
            if (accountForm.phoneNumber.trim())        body.phoneNumber        = accountForm.phoneNumber.trim();
            if (accountForm.dateOfBirth)               body.dateOfBirth        = accountForm.dateOfBirth;
            if (accountForm.city.trim())               body.city               = accountForm.city.trim();
            if (accountForm.country.trim())            body.country            = accountForm.country.trim();
            if (accountForm.playtomicProfileUrl.trim()) body.playtomicProfileUrl = accountForm.playtomicProfileUrl.trim();

            const res = await authFetch(`/api/users/${user!.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user!.token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                setAccountErrors({ form: await getErrorMessage(res, "Failed to save account") });
                return;
            }

            const updated = await res.json();
            setAccountSaved(true);
            setUser({ ...user!, firstName: updated.firstName, lastName: updated.lastName });
        } catch {
            setAccountErrors({ form: "Failed to connect. Please try again." });
        } finally {
            setAccountSubmitting(false);
        }
    };

    // ── Player handlers ──────────────────────────────────────────────────────

    const handlePlayerChange = (field: keyof PlayerForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setPlayerForm({ ...playerForm, [field]: e.target.value });
            if (playerErrors[field]) setPlayerErrors({ ...playerErrors, [field]: undefined });
            setPlayerSaved(false);
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
            const res = await authFetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: player?.id,
                    userId: user!.id,
                    rating: playerForm.rating,
                    gender: playerForm.gender,
                    hand: playerForm.hand,
                    courtSide: playerForm.courtSide,
                }),
            });

            if (!res.ok) {
                setPlayerErrors({ form: await getErrorMessage(res, "Failed to save") });
                return;
            }

            const updatedPlayer = await res.json() as Player;
            setPlayer(updatedPlayer);
            setPlayerSaved(true);
        } catch {
            setPlayerErrors({ form: "Failed to connect. Please try again." });
        } finally {
            setPlayerSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen relative bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('/src/assets/padelBg.jpeg')" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-emerald-900/60" />

            <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                    <h1 className="text-2xl font-black text-white">
                        {user.firstName} {user.lastName}
                    </h1>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ── Account Info ── */}
                    <div className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-lg font-bold text-white mb-6">Account Info</h2>

                        <form onSubmit={handleAccountSubmit} className="space-y-4">
                            {accountErrors.form && (
                                <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                                    {accountErrors.form}
                                </div>
                            )}
                            {accountSaved && (
                                <div className="text-emerald-300 text-sm p-2.5 bg-emerald-900/20 backdrop-blur rounded-xl border border-emerald-500/30">
                                    Account saved
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input type="text" value={accountForm.firstName}
                                           onChange={handleAccountChange("firstName")}
                                           className={inputClass(!!accountErrors.firstName)} />
                                    {accountErrors.firstName && <p className="text-red-300 text-xs mt-1">{accountErrors.firstName}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input type="text" value={accountForm.lastName}
                                           onChange={handleAccountChange("lastName")}
                                           className={inputClass(!!accountErrors.lastName)} />
                                    {accountErrors.lastName && <p className="text-red-300 text-xs mt-1">{accountErrors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email *</label>
                                <input type="email" value={accountForm.email}
                                       onChange={handleAccountChange("email")}
                                       className={inputClass(!!accountErrors.email)} />
                                {accountErrors.email && <p className="text-red-300 text-xs mt-1">{accountErrors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input type="tel" value={accountForm.phoneNumber}
                                           onChange={handleAccountChange("phoneNumber")}
                                           placeholder="+31612345678"
                                           className={inputClass()} />
                                </div>
                                <div>
                                    <label className={labelClass}>Date of Birth</label>
                                    <input type="date" value={accountForm.dateOfBirth}
                                           onChange={handleAccountChange("dateOfBirth")}
                                           className={inputClass()} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input type="text" value={accountForm.city}
                                           onChange={handleAccountChange("city")}
                                           placeholder="Amsterdam"
                                           className={inputClass()} />
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input type="text" value={accountForm.country}
                                           onChange={handleAccountChange("country")}
                                           placeholder="NL"
                                           maxLength={2}
                                           className={inputClass()} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Playtomic Profile URL</label>
                                <input type="url" value={accountForm.playtomicProfileUrl}
                                       onChange={handleAccountChange("playtomicProfileUrl")}
                                       placeholder="https://playtomic.com/player/..."
                                       className={inputClass()} />
                            </div>

                            <button type="submit" disabled={accountSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide mt-2">
                                {accountSubmitting ? "Saving..." : "Save Account"}
                            </button>
                        </form>
                    </div>

                    {/* ── Player Profile ── */}
                    <div className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-lg font-bold text-white mb-6">Player Profile</h2>

                        {loading ? (
                            <p className="text-white/60 text-center py-8">Loading...</p>
                        ) : (
                            <form onSubmit={handlePlayerSubmit} className="space-y-5">
                                {playerErrors.form && (
                                    <div className="text-red-300 text-sm p-2.5 bg-red-900/20 backdrop-blur rounded-xl border border-red-500/30">
                                        {playerErrors.form}
                                    </div>
                                )}
                                {playerSaved && (
                                    <div className="text-emerald-300 text-sm p-2.5 bg-emerald-900/20 backdrop-blur rounded-xl border border-emerald-500/30">
                                        Player profile saved
                                    </div>
                                )}
                                {!player && (
                                    <div className="text-yellow-300 text-sm p-2.5 bg-yellow-900/20 backdrop-blur rounded-xl border border-yellow-500/30">
                                        No player profile yet — fill in the details below to create one.
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

                                <button type="submit" disabled={playerSubmitting}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide mt-2">
                                    {playerSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

