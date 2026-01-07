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

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  city: string;
  prizes?: string;
  startDate: number; // epoch millis
  endDate: number;   // epoch millis
  organizerIds: string[];
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  ratingZones: string[];
}
