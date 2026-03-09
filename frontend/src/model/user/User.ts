export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: number[];
    city?: string;
    country?: string;
    profilePictureUrl?: string;
    playtomicProfileUrl?: string;
    status: string;
}