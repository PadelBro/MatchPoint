export type Gender = "MALE" | "FEMALE";
export type Side = "LEFT" | "RIGHT";

export interface Player {
    id: string;
    userId: string;
    rating: number;
    gender: Gender;
    hand: Side;
    courtSide: Side;
}