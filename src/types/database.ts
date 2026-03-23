// ============================================================
// Social Parents - Supabase Database Types
// Keep in sync with migrations.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  PostgrestVersion: '12'
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          label: string
          color_class: string
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          color_class: string
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          color_class?: string
          created_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          label: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          label: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          label?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subcategories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          role: string
          bio: string | null
          is_private: boolean
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          role?: string
          bio?: string | null
          is_private?: boolean
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          role?: string
          bio?: string | null
          is_private?: boolean
          is_admin?: boolean
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          author_id: string | null
          author_name: string
          author_role: string
          category_id: string | null
          category_name: string
          subcategory_id: string | null
          subcategory_name: string | null
          color_class: string
          content: string
          tags: string[]
          is_sensitive: boolean
          comment_count: number
          save_count: number
          support_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          author_name: string
          author_role: string
          category_id?: string | null
          category_name: string
          subcategory_id?: string | null
          subcategory_name?: string | null
          color_class: string
          content: string
          tags?: string[]
          is_sensitive?: boolean
          comment_count?: number
          save_count?: number
          support_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          author_name?: string
          author_role?: string
          category_id?: string | null
          category_name?: string
          subcategory_id?: string | null
          subcategory_name?: string | null
          color_class?: string
          content?: string
          tags?: string[]
          is_sensitive?: boolean
          comment_count?: number
          save_count?: number
          support_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_subcategory_id_fkey'
            columns: ['subcategory_id']
            isOneToOne: false
            referencedRelation: 'subcategories'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types derived from Database
export type Category = Database['public']['Tables']['categories']['Row']
export type Subcategory = Database['public']['Tables']['subcategories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']

// Extended types for UI (with relations)
export type CategoryWithSubcats = Category & {
  subcategories: Subcategory[]
}
