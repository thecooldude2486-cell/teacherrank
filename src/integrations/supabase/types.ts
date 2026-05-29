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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_by_user_id: string
          review_id: string
          review_type: Database["public"]["Enums"]["report_type"]
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_by_user_id: string
          review_id: string
          review_type: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_by_user_id?: string
          review_id?: string
          review_type?: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: []
      }
      school_reviews: {
        Row: {
          academic_support_rating: number | null
          canteen_rating: number | null
          child_year_level: string | null
          cleanliness_rating: number | null
          communication_rating: number | null
          community_score: number | null
          created_at: string
          dropoff_pickup_rating: number | null
          environment_score: number | null
          extracurricular_rating: number | null
          facilities_rating: number | null
          homework_rating: number | null
          id: string
          inclusiveness_rating: number | null
          learning_score: number | null
          library_resources_rating: number | null
          location_convenience_rating: number | null
          location_score: number | null
          nearby_facilities_rating: number | null
          overall_rating: number | null
          parent_community_rating: number | null
          parking_rating: number | null
          playground_rating: number | null
          public_transport_rating: number | null
          safety_rating: number | null
          school_culture_rating: number | null
          school_id: string | null
          school_name: string | null
          school_space_rating: number | null
          sports_facilities_rating: number | null
          status: Database["public"]["Enums"]["submission_status"]
          teaching_quality_rating: number | null
          toilets_hygiene_rating: number | null
          traffic_safety_rating: number | null
          updated_at: string
          user_id: string
          walking_biking_rating: number | null
          wellbeing_rating: number | null
          written_feedback: string | null
        }
        Insert: {
          academic_support_rating?: number | null
          canteen_rating?: number | null
          child_year_level?: string | null
          cleanliness_rating?: number | null
          communication_rating?: number | null
          community_score?: number | null
          created_at?: string
          dropoff_pickup_rating?: number | null
          environment_score?: number | null
          extracurricular_rating?: number | null
          facilities_rating?: number | null
          homework_rating?: number | null
          id?: string
          inclusiveness_rating?: number | null
          learning_score?: number | null
          library_resources_rating?: number | null
          location_convenience_rating?: number | null
          location_score?: number | null
          nearby_facilities_rating?: number | null
          overall_rating?: number | null
          parent_community_rating?: number | null
          parking_rating?: number | null
          playground_rating?: number | null
          public_transport_rating?: number | null
          safety_rating?: number | null
          school_culture_rating?: number | null
          school_id?: string | null
          school_name?: string | null
          school_space_rating?: number | null
          sports_facilities_rating?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          teaching_quality_rating?: number | null
          toilets_hygiene_rating?: number | null
          traffic_safety_rating?: number | null
          updated_at?: string
          user_id: string
          walking_biking_rating?: number | null
          wellbeing_rating?: number | null
          written_feedback?: string | null
        }
        Update: {
          academic_support_rating?: number | null
          canteen_rating?: number | null
          child_year_level?: string | null
          cleanliness_rating?: number | null
          communication_rating?: number | null
          community_score?: number | null
          created_at?: string
          dropoff_pickup_rating?: number | null
          environment_score?: number | null
          extracurricular_rating?: number | null
          facilities_rating?: number | null
          homework_rating?: number | null
          id?: string
          inclusiveness_rating?: number | null
          learning_score?: number | null
          library_resources_rating?: number | null
          location_convenience_rating?: number | null
          location_score?: number | null
          nearby_facilities_rating?: number | null
          overall_rating?: number | null
          parent_community_rating?: number | null
          parking_rating?: number | null
          playground_rating?: number | null
          public_transport_rating?: number | null
          safety_rating?: number | null
          school_culture_rating?: number | null
          school_id?: string | null
          school_name?: string | null
          school_space_rating?: number | null
          sports_facilities_rating?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          teaching_quality_rating?: number | null
          toilets_hygiene_rating?: number | null
          traffic_safety_rating?: number | null
          updated_at?: string
          user_id?: string
          walking_biking_rating?: number | null
          wellbeing_rating?: number | null
          written_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_reviews_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          school_type: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_by_user_id: string | null
          updated_at: string
          year_levels: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          school_type?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by_user_id?: string | null
          updated_at?: string
          year_levels?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          school_type?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by_user_id?: string | null
          updated_at?: string
          year_levels?: string | null
        }
        Relationships: []
      }
      teacher_reviews: {
        Row: {
          classroom_support_rating: number | null
          communication_rating: number | null
          created_at: string
          engagement_rating: number | null
          homework_rating: number | null
          id: string
          overall_rating: number | null
          school_name: string | null
          status: Database["public"]["Enums"]["submission_status"]
          teacher_id: string | null
          teacher_name: string | null
          teaching_clarity_rating: number | null
          updated_at: string
          user_id: string
          wellbeing_rating: number | null
          written_feedback: string | null
          year_level: string | null
        }
        Insert: {
          classroom_support_rating?: number | null
          communication_rating?: number | null
          created_at?: string
          engagement_rating?: number | null
          homework_rating?: number | null
          id?: string
          overall_rating?: number | null
          school_name?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          teacher_id?: string | null
          teacher_name?: string | null
          teaching_clarity_rating?: number | null
          updated_at?: string
          user_id: string
          wellbeing_rating?: number | null
          written_feedback?: string | null
          year_level?: string | null
        }
        Update: {
          classroom_support_rating?: number | null
          communication_rating?: number | null
          created_at?: string
          engagement_rating?: number | null
          homework_rating?: number | null
          id?: string
          overall_rating?: number | null
          school_name?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          teacher_id?: string | null
          teacher_name?: string | null
          teaching_clarity_rating?: number | null
          updated_at?: string
          user_id?: string
          wellbeing_rating?: number | null
          written_feedback?: string | null
          year_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          class_type: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          school_id: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_by_user_id: string | null
          updated_at: string
          year_level: string | null
        }
        Insert: {
          class_type?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          school_id?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by_user_id?: string | null
          updated_at?: string
          year_level?: string | null
        }
        Update: {
          class_type?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          school_id?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by_user_id?: string | null
          updated_at?: string
          year_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "normal_user" | "admin"
      report_status: "pending" | "reviewed" | "dismissed"
      report_type: "teacher_review" | "school_review"
      submission_status: "pending" | "approved" | "rejected"
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
      app_role: ["normal_user", "admin"],
      report_status: ["pending", "reviewed", "dismissed"],
      report_type: ["teacher_review", "school_review"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
