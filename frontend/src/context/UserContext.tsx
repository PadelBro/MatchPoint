import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type SessionUser = { id: string; firstName: string; lastName: string };

type UserContextType = {
    user: SessionUser | null;
    setUser: (u: SessionUser | null) => void;
};

const UserContext = createContext<UserContextType>({ user: null, setUser: () => {} });

const SESSION_KEY = "mp_user";

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<SessionUser | null>(() => {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? (JSON.parse(raw) as SessionUser) : null;
        } catch {
            return null;
        }
    });

    const setUser = (u: SessionUser | null) => {
        setUserState(u);
        if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        else localStorage.removeItem(SESSION_KEY);
    };

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
