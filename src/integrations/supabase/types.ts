export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_pipelines: {
        Row: {
          context: Json
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["ai_pipeline_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["ai_pipeline_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["ai_pipeline_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_tasks: {
        Row: {
          agent: Database["public"]["Enums"]["ai_agent"]
          correlation_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          name: string
          output: Json | null
          pipeline_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["ai_task_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agent: Database["public"]["Enums"]["ai_agent"]
          correlation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          name: string
          output?: Json | null
          pipeline_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_task_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agent?: Database["public"]["Enums"]["ai_agent"]
          correlation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          name?: string
          output?: Json | null
          pipeline_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_task_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tasks_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "ai_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_webhooks: {
        Row: {
          created_at: string
          event: string
          id: string
          is_active: boolean
          secret: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          is_active?: boolean
          secret: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          is_active?: boolean
          secret?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          amount: number
          created_at: string
          currency: string
          date: string
          exchange_id: string
          id: string
          mode: string
          uid_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          date: string
          exchange_id: string
          id?: string
          mode: string
          uid_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          exchange_id?: string
          id?: string
          mode?: string
          uid_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_uid_id_fkey"
            columns: ["uid_id"]
            isOneToOne: false
            referencedRelation: "uids"
            referencedColumns: ["id"]
          },
        ]
      }
      exchanges: {
        Row: {
          approved_rate: number | null
          base_rate: number
          base_url: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          ref_param: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_rate?: number | null
          base_rate?: number
          base_url: string
          created_at?: string
          id: string
          logo_url?: string | null
          name: string
          ref_param?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_rate?: number | null
          base_rate?: number
          base_url?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          ref_param?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_captures: {
        Row: {
          captured_at: string
          contact_info: Json
          id: string
          ip_address: unknown | null
          lead_magnet_id: string
          partner_id: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          captured_at?: string
          contact_info: Json
          id?: string
          ip_address?: unknown | null
          lead_magnet_id: string
          partner_id: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          captured_at?: string
          contact_info?: Json
          id?: string
          ip_address?: unknown | null
          lead_magnet_id?: string
          partner_id?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_captures_lead_magnet_id_fkey"
            columns: ["lead_magnet_id"]
            isOneToOne: false
            referencedRelation: "lead_magnets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnets: {
        Row: {
          brand_settings: Json
          compliance_settings: Json
          content_json: Json
          created_at: string
          depth: string
          download_count: number
          format: string
          id: string
          lead_goal: string
          locale: string
          status: string
          target_audience: string
          title: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_settings: Json
          compliance_settings: Json
          content_json: Json
          created_at?: string
          depth: string
          download_count?: number
          format: string
          id?: string
          lead_goal: string
          locale?: string
          status?: string
          target_audience: string
          title: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_settings?: Json
          compliance_settings?: Json
          content_json?: Json
          created_at?: string
          depth?: string
          download_count?: number
          format?: string
          id?: string
          lead_goal?: string
          locale?: string
          status?: string
          target_audience?: string
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          clicks: number
          conversions: number
          created_at: string
          exchange_id: string
          id: string
          mode: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          clicks?: number
          conversions?: number
          created_at?: string
          exchange_id: string
          id?: string
          mode: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          clicks?: number
          conversions?: number
          created_at?: string
          exchange_id?: string
          id?: string
          mode?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_exchange_status: {
        Row: {
          application_data: Json | null
          created_at: string
          exchange_id: string
          id: string
          mode: string
          ref_code: string | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_data?: Json | null
          created_at?: string
          exchange_id: string
          id?: string
          mode: string
          ref_code?: string | null
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_data?: Json | null
          created_at?: string
          exchange_id?: string
          id?: string
          mode?: string
          ref_code?: string | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_exchange_status_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          address: string
          amount: number
          created_at: string
          fee: number | null
          id: string
          network: string
          status: string
          tx_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          amount: number
          created_at?: string
          fee?: number | null
          id?: string
          network?: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          amount?: number
          created_at?: string
          fee?: number | null
          id?: string
          network?: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uids: {
        Row: {
          created_at: string
          exchange_id: string
          id: string
          memo: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange_id: string
          id?: string
          memo?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exchange_id?: string
          id?: string
          memo?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uids_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ai_agent: "CREA" | "DANNY" | "RAY" | "LEO" | "ALPHA" | "GUARDIAN"
      ai_pipeline_status:
        | "PENDING"
        | "RUNNING"
        | "PARTIAL"
        | "SUCCEEDED"
        | "FAILED"
      ai_task_status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_agent: ["CREA", "DANNY", "RAY", "LEO", "ALPHA", "GUARDIAN"],
      ai_pipeline_status: [
        "PENDING",
        "RUNNING",
        "PARTIAL",
        "SUCCEEDED",
        "FAILED",
      ],
      ai_task_status: ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED"],
    },
  },
} as const
