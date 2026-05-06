import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export function useAuthFetch() {
    const { setUser } = useUser();
    const navigate = useNavigate();

    return async (url: string, options: RequestInit = {}): Promise<Response> => {
        const res = await fetch(url, options);
        if (res.status === 401) {
            setUser(null);
            navigate("/login");
        }
        return res;
    };
}