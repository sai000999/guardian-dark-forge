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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      afk_status: {
        Row: {
          guild_id: string
          id: string
          reason: string | null
          set_at: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          reason?: string | null
          set_at?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          reason?: string | null
          set_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blacklist_words: {
        Row: {
          added_by: string
          created_at: string | null
          guild_id: string
          id: string
          word: string
        }
        Insert: {
          added_by: string
          created_at?: string | null
          guild_id: string
          id?: string
          word: string
        }
        Update: {
          added_by?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
      bot_config: {
        Row: {
          created_at: string | null
          guild_id: string
          id: string
          mod_log_channel_id: string | null
          status_text: string
          status_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          id?: string
          mod_log_channel_id?: string | null
          status_text?: string
          status_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          id?: string
          mod_log_channel_id?: string | null
          status_text?: string
          status_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      economy_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          guild_id: string
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          guild_id: string
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          guild_id?: string
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      inactivity_settings: {
        Row: {
          guild_id: string
          timeout_minutes: number
        }
        Insert: {
          guild_id: string
          timeout_minutes?: number
        }
        Update: {
          guild_id?: string
          timeout_minutes?: number
        }
        Relationships: []
      }
      message_tracking: {
        Row: {
          guild_id: string
          id: string
          message_id: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          message_id: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          message_id?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action_type: string
          created_at: string | null
          duration_minutes: number | null
          guild_id: string
          id: string
          moderator_id: string
          reason: string
          severity: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          duration_minutes?: number | null
          guild_id: string
          id?: string
          moderator_id: string
          reason: string
          severity: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          guild_id?: string
          id?: string
          moderator_id?: string
          reason?: string
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      monitored_channels: {
        Row: {
          active: boolean
          channel_id: string
          guild_id: string
          id: string
          last_active: string
        }
        Insert: {
          active?: boolean
          channel_id: string
          guild_id: string
          id?: string
          last_active?: string
        }
        Update: {
          active?: boolean
          channel_id?: string
          guild_id?: string
          id?: string
          last_active?: string
        }
        Relationships: []
      }
      quarantine_logs: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          guild_id: string
          id: string
          moderator_id: string
          reason: string
          removed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          guild_id: string
          id?: string
          moderator_id: string
          reason: string
          removed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          guild_id?: string
          id?: string
          moderator_id?: string
          reason?: string
          removed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_config: {
        Row: {
          created_at: string | null
          guild_id: string
          hexrole_role_id: string | null
          id: string
          vcaccess_role_id: string | null
          vip_role_id: string | null
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          hexrole_role_id?: string | null
          id?: string
          vcaccess_role_id?: string | null
          vip_role_id?: string | null
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          hexrole_role_id?: string | null
          id?: string
          vcaccess_role_id?: string | null
          vip_role_id?: string | null
        }
        Relationships: []
      }
      ticket_config: {
        Row: {
          created_at: string | null
          guild_id: string
          id: string
          staff_role_id: string
          ticket_channel_id: string
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          id?: string
          staff_role_id: string
          ticket_channel_id: string
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          id?: string
          staff_role_id?: string
          ticket_channel_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          channel_id: string
          claimed_at: string | null
          claimed_by: string | null
          closed_at: string | null
          closed_by: string | null
          created_at: string | null
          guild_id: string
          id: string
          status: string
          subject: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          claimed_at?: string | null
          claimed_by?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          guild_id: string
          id?: string
          status?: string
          subject?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          claimed_at?: string | null
          claimed_by?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          guild_id?: string
          id?: string
          status?: string
          subject?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          balance: number
          guild_id: string
          id: string
          last_daily: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          guild_id: string
          id?: string
          last_daily?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          guild_id?: string
          id?: string
          last_daily?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          guild_id: string
          id: string
          last_xp_gain: string | null
          level: number
          total_messages: number
          user_id: string
          xp: number
        }
        Insert: {
          guild_id: string
          id?: string
          last_xp_gain?: string | null
          level?: number
          total_messages?: number
          user_id: string
          xp?: number
        }
        Update: {
          guild_id?: string
          id?: string
          last_xp_gain?: string | null
          level?: number
          total_messages?: number
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      voice_sessions: {
        Row: {
          channel_id: string
          duration_minutes: number | null
          guild_id: string
          id: string
          join_time: string | null
          leave_time: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          duration_minutes?: number | null
          guild_id: string
          id?: string
          join_time?: string | null
          leave_time?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          duration_minutes?: number | null
          guild_id?: string
          id?: string
          join_time?: string | null
          leave_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
