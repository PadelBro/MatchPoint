export async function getErrorMessage(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        return typeof data.message === "string" && data.message ? data.message : fallback;
    } catch {
        return fallback;
    }
}