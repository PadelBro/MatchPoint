export type RacketModel = { id: string; name: string; imageUrl: string };
export type RacketYear  = { year: number; models: RacketModel[] };
export type RacketBrand = { id: string; name: string; years: RacketYear[] };
