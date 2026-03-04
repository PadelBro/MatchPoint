import {TournamentStatus} from "./Tournament";

export interface Filters {
    city: string;
    status: TournamentStatus | null;
    startDate: number | null;
    endDate: number | null;
    minRating: number | null;
    maxRating: number | null;
    offset: number;
    limit: number;
}