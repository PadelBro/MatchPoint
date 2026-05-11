import { useEffect, useState } from "react";
import type { RacketBrand } from "../model/player/Rackets";

type Props = {
    open: boolean;
    currentUrl: string | null;
    onSelect: (url: string, name: string) => void;
    onClose: () => void;
};

export function RacketPicker({ open, currentUrl, onSelect, onClose }: Props) {
    const [catalog, setCatalog] = useState<RacketBrand[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [brand, setBrand] = useState<RacketBrand | null>(null);
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        if (!open || catalog.length > 0) return;
        setLoadingCatalog(true);
        fetch("/api/rackets")
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => setCatalog(data))
            .catch(() => setCatalog([]))
            .finally(() => setLoadingCatalog(false));
    }, [open]);

    if (!open) return null;

    const handleBrand = (b: RacketBrand) => {
        setBrand(b);
        setYear(null);
        setStep(2);
    };

    const handleYear = (y: number) => {
        setYear(y);
        setStep(3);
    };

    const handleBack = () => {
        if (step === 2) { setBrand(null); setStep(1); }
        if (step === 3) { setYear(null);  setStep(2); }
    };

    const handleClose = () => {
        setStep(1); setBrand(null); setYear(null);
        onClose();
    };

    const models = brand && year
        ? (brand.years.find(y => y.year === year)?.models ?? [])
        : [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
            onClick={handleClose}
        >
            <div
                className="w-full max-w-2xl backdrop-blur-xl bg-white/15 border border-white/30 rounded-2xl shadow-2xl p-6"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="text-white/60 hover:text-white transition-colors p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <h2 className="text-lg font-bold text-white flex-1">
                        {step === 1 && "Choose Brand"}
                        {step === 2 && brand?.name}
                        {step === 3 && `${brand?.name} · ${year}`}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-white/40 hover:text-white transition-colors text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Loading */}
                {loadingCatalog && (
                    <p className="text-white/50 text-center py-12">Loading rackets...</p>
                )}

                {/* Step 1 — Brand grid */}
                {!loadingCatalog && step === 1 && (
                    catalog.length === 0
                        ? <p className="text-white/40 text-center py-8">No rackets found. Check Cloudinary config.</p>
                        : <div className="grid grid-cols-3 gap-3">
                            {catalog.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => handleBrand(b)}
                                    className="py-5 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 hover:border-emerald-400/50 transition-all text-white font-semibold text-sm"
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                )}

                {/* Step 2 — Year buttons */}
                {!loadingCatalog && step === 2 && brand && (
                    <div className="flex flex-wrap gap-3">
                        {brand.years.map(y => (
                            <button
                                key={y.year}
                                onClick={() => handleYear(y.year)}
                                className="px-6 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 hover:border-emerald-400/50 transition-all text-white font-semibold"
                            >
                                {y.year}
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 3 — Model grid */}
                {!loadingCatalog && step === 3 && (
                    <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                        {models.map(m => (
                            <button
                                key={m.id}
                                onClick={() => onSelect(m.imageUrl, m.name)}
                                className={`rounded-xl border-2 overflow-hidden transition-all hover:-translate-y-0.5 ${
                                    currentUrl === m.imageUrl
                                        ? "border-emerald-400 shadow-lg shadow-emerald-400/30"
                                        : "border-white/20 hover:border-emerald-400/50"
                                }`}
                            >
                                <img
                                    src={m.imageUrl}
                                    alt={m.name}
                                    className="w-full aspect-square object-cover bg-white/10"
                                />
                                <div className="bg-black/40 px-2 py-1.5 text-white text-xs font-medium text-center">
                                    {m.name}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
