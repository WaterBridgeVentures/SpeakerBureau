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

export type AdminRole = 'super_admin' | 'approver';

export type SpeakingFormat = 'in_person' | 'virtual' | 'both';

// Convenience row aliases (defined after the Database interface below).
export type Speaker = Database['public']['Tables']['speakers']['Row'];
export type IntroRequest = Database['public']['Tables']['intro_requests']['Row'];
export type Supporter = Database['public']['Tables']['supporters']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export interface Database {
  public: {
    Views: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
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
          verified: boolean;
          location: string | null;
          in_person_or_virtual: SpeakingFormat | null;
          featured: boolean;
          // Private: not readable by anon/authenticated (column-level grants).
          // Optional here so public column-selects still satisfy `Speaker`.
          email?: string | null;
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
          verified?: boolean;
          location?: string | null;
          in_person_or_virtual?: SpeakingFormat | null;
          featured?: boolean;
          email?: string | null;
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
          verified?: boolean;
          location?: string | null;
          in_person_or_virtual?: SpeakingFormat | null;
          featured?: boolean;
          email?: string | null;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: AdminRole;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: AdminRole;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Enums: {
      speaker_status: SpeakerStatus;
      intro_request_status: IntroRequestStatus;
      domain_speciality: DomainSpeciality;
      industry_speciality: IndustrySpeciality;
      admin_role: AdminRole;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_admin_role: {
        Args: Record<string, never>;
        Returns: AdminRole | null;
      };
      set_speaker_status: {
        Args: { p_speaker_id: string; p_status: SpeakerStatus };
        Returns: unknown;
      };
      set_intro_request_status: {
        Args: { p_id: string; p_status: IntroRequestStatus };
        Returns: unknown;
      };
    };
  };
}
