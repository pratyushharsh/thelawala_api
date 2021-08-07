export interface CreateUpdateVendor {
    name: string;
    email: string;
    phone: string;
    introduction: string;
    tagline: string;
    website: string;
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
    cuisines?: (string)[] | null;
    tags?: (string)[] | null;
}
