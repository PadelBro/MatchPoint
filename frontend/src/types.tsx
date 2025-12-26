export type Gender = "MALE" | "FEMALE";
export type Side = "LEFT" | "RIGHT";

export interface Player {
  id: string;
  username: string;
  ratingZone: string;
  homeAddress: string;
  gender: Gender;
  hand: Side;
  courtSide: Side;
  playtomicProfileUrl?: string;
}
