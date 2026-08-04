export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_user_id: string
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          entity: string
          entity_id: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          sort_order: number
          storage_path: string
          villa_id: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_path: string
          villa_id: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          check_in: string
          check_out: string
          completed_at: string | null
          created_at: string
          declined_at: string | null
          declined_by: string | null
          guest_count: number
          guest_id: string
          id: string
          reference_code: string
          special_requests: string
          status: Database["public"]["Enums"]["reservation_status"]
          stay_range: unknown
          terms_accepted: boolean
          updated_at: string
          villa_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in: string
          check_out: string
          completed_at?: string | null
          created_at?: string
          declined_at?: string | null
          declined_by?: string | null
          guest_count: number
          guest_id: string
          id?: string
          reference_code: string
          special_requests?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          stay_range?: unknown
          terms_accepted?: boolean
          updated_at?: string
          villa_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in?: string
          check_out?: string
          completed_at?: string | null
          created_at?: string
          declined_at?: string | null
          declined_by?: string | null
          guest_count?: number
          guest_id?: string
          id?: string
          reference_code?: string
          special_requests?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          stay_range?: unknown
          terms_accepted?: boolean
          updated_at?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_declined_by_fkey"
            columns: ["declined_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["sms_direction"]
          error_message: string
          id: string
          message: string
          provider_message_id: string
          recipient: string
          reservation_id: string
          status: Database["public"]["Enums"]["sms_status"]
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["sms_direction"]
          error_message?: string
          id?: string
          message: string
          provider_message_id?: string
          recipient: string
          reservation_id: string
          status?: Database["public"]["Enums"]["sms_status"]
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["sms_direction"]
          error_message?: string
          id?: string
          message?: string
          provider_message_id?: string
          recipient?: string
          reservation_id?: string
          status?: Database["public"]["Enums"]["sms_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      villa_amenities: {
        Row: {
          icon: string
          id: string
          label: string
          sort_order: number
          villa_id: string
        }
        Insert: {
          icon?: string
          id?: string
          label: string
          sort_order?: number
          villa_id: string
        }
        Update: {
          icon?: string
          id?: string
          label?: string
          sort_order?: number
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "villa_amenities_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villas: {
        Row: {
          base_price: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          max_guests: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          max_guests: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          max_guests?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      admin_role: "owner" | "staff"
      reservation_status:
        | "pending"
        | "approved"
        | "declined"
        | "cancelled"
        | "completed"
      sms_direction: "outbound_auto" | "outbound_manual"
      sms_status: "queued" | "sent" | "failed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      admin_role: ["owner", "staff"],
      reservation_status: [
        "pending",
        "approved",
        "declined",
        "cancelled",
        "completed",
      ],
      sms_direction: ["outbound_auto", "outbound_manual"],
      sms_status: ["queued", "sent", "failed"],
    },
  },
} as const
