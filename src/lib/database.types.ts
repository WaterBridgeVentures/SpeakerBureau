// Hand-authored types mirroring supabase/migrations/0001_init.sql.
// Keep in sync with the migration (or regenerate with the Supabase CLI:
// `supabase gen types typescript --local > src/lib/database.types.ts`).

export type SpeakerStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export type IntroRequestStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'introduced';

export type DomainSpeciality =
  | 'Sales'
  | 'Marketing'
  | 'Finance'
  | 'GTM'
  | 'Product'
  | 'Operations'
  | 'HR'
  | 'Strategy'
  | 'Fundraising'
  | 'Other';

export type IndustrySpeciality =
  | 'Technology'
  | 'Financial Services'
  | 'Healthcare'
  | 'Consumer/Retail'
  | 'Media & Entertainment'
  | 'Education'
  | 'Manufacturing'
  | 'Real Estate'
  | 'Public Sector/Policy'
  | 'Non-profit/Social Impact'
  | 'Other';

export interface Database {
  public: {
    Tables: {
      speakers: {
        Row: {
          id: string;
          name: string;
          designation: string;
          linkedin_url: string;
          photo_url: string | null;
          industry_speciality: IndustrySpeciality | null;
          domain_speciality: DomainSpeciality | null;
          bio: string | null;
          status: SpeakerStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          designation: string;
          linkedin_url: string;
          photo_url?: string | null;
          industry_speciality?: IndustrySpeciality | null;
          domain_speciality?: DomainSpeciality | null;
          bio?: string | null;
          status?: SpeakerStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          designation?: string;
          linkedin_url?: string;
          photo_url?: string | null;
          industry_speciality?: IndustrySpeciality | null;
          domain_speciality?: DomainSpeciality | null;
          bio?: string | null;
          status?: SpeakerStatus;
          created_at?: string;
        };
      };
      intro_requests: {
        Row: {
          id: string;
          speaker_id: string;
          requester_name: string;
          requester_email: string;
          requester_org: string | null;
          reason: string | null;
          status: IntroRequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          speaker_id: string;
          requester_name: string;
          requester_email: string;
          requester_org?: string | null;
          reason?: string | null;
          status?: IntroRequestStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          speaker_id?: string;
          requester_name?: string;
          requester_email?: string;
          requester_org?: string | null;
          reason?: string | null;
          status?: IntroRequestStatus;
          created_at?: string;
        };
      };
      supporters: {
        Row: {
          id: string;
          org_name: string;
          logo_url: string;
          link_url: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          org_name: string;
          logo_url: string;
          link_url?: string | null;
          display_order?: number;
        };
        Update: {
          id?: string;
          org_name?: string;
          logo_url?: string;
          link_url?: string | null;
          display_order?: number;
        };
      };
    };
    Enums: {
      speaker_status: SpeakerStatus;
      intro_request_status: IntroRequestStatus;
      domain_speciality: DomainSpeciality;
      industry_speciality: IndustrySpeciality;
    };
  };
}
