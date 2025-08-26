/* eslint-disable @typescript-eslint/no-explicit-any */
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
    // Recurring events
    is_recurring?: boolean
    recurrence_type?: 'weekly' | 'monthly' | 'yearly'
    recurrence_end_date?: string
    parent_event_id?: number
    // Capacity management
    max_capacity?: number
    waitlist_enabled?: boolean
    waitlist_count?: number
    // Smart forms
    custom_form_fields?: CustomFormField[]
    form_template_id?: number
  }
  
  export interface RecurringEventSeries {
    id: number
    parent_event_id: number
    title: string
    description?: string
    location?: string
    recurrence_type: 'weekly' | 'monthly' | 'yearly'
    start_date: string
    end_date?: string
    created_by: number
    created_at: string
    events?: Event[]
  }
  
  export interface EventWaitlist {
    id: number
    event_id: number
    user_id?: number
    guest_name?: string
    guest_email?: string
    position: number
    joined_at: string
    notified_at?: string
    status: 'waiting' | 'notified' | 'converted' | 'expired'
  }
  
  export interface CustomFormField {
    id: string
    type: 'text' | 'email' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file'
    label: string
    required: boolean
    options?: string[]
    conditions?: FieldCondition[]
    order: number
  }
  
  export interface FieldCondition {
    field_id: string
    operator: 'equals' | 'not_equals' | 'contains'
    value: string
  }
  
  export interface FormTemplate {
    id: number
    name: string
    description?: string
    fields: CustomFormField[]
    created_by: number
    created_at: string
    is_public: boolean
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
    custom_responses?: Record<string, any>
    is_waitlisted?: boolean
    waitlist_position?: number
  }
