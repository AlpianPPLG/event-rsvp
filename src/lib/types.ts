export interface User {
    id: number
    name: string
    email: string
    role: "user" | "admin"
    avatar_url?: string
    created_at: string
  }
  
  export interface Event {
    id: number
    title: string
    description?: string
    event_date: string
    location?: string
    created_by: number
    created_at: string
    updated_at: string
    creator_name?: string
    rsvp_count?: {
      yes: number
      no: number
      maybe: number
      total: number
    }
  }
  
  export interface RSVP {
    id: number
    event_id: number
    user_id: number
    status: "yes" | "no" | "maybe"
    responded_at: string
    user_name?: string
    user_email?: string
  }
  
  export interface Guest {
    id: number
    event_id: number
    name: string
    email?: string
    status: "yes" | "no" | "maybe"
    responded_at: string
  }
  