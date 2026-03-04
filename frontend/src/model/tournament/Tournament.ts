export type TournamentStatus = "pending" | "active" | "completed";

export const STATUSES: TournamentStatus[] = ["pending", "active", "completed"];

export interface Tournament {
    id: string;
    name: string;
    description?: string;
    city: string;
    prizes?: string;
    startDate: number;
    endDate: number;
    organizerIds: string[];
    status: TournamentStatus;
    minRating: number;
    maxRating: number;
}