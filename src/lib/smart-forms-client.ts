/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomFormField } from "./types"

export function generateFieldId(): string {
  return `field_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
}

export function validateFormField(field: CustomFormField, value: any): {
  isValid: boolean
  error?: string
} {
  // Required field validation
  if (field.required && (!value || value.toString().trim() === '')) {
    return {
      isValid: false,
      error: `${field.label} is required`
    }
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return {
          isValid: false,
          error: `${field.label} must be a valid email address`
        }
      }
      break

    case 'select':
    case 'radio':
      if (value && field.options && !field.options.includes(value)) {
        return {
          isValid: false,
          error: `${field.label} must be one of the provided options`
        }
      }
      break

    case 'checkbox':
      if (field.required && (!Array.isArray(value) || value.length === 0)) {
        return {
          isValid: false,
          error: `${field.label} requires at least one selection`
        }
      }
      break

    case 'file':
      if (value && typeof value === 'object' && value.size > 10 * 1024 * 1024) { // 10MB limit
        return {
          isValid: false,
          error: `${field.label} file size must be less than 10MB`
        }
      }
      break
  }

  return { isValid: true }
}

export function evaluateFieldConditions(
  field: CustomFormField,
  formData: Record<string, any>
): boolean {
  if (!field.conditions || field.conditions.length === 0) {
    return true // No conditions means always show
  }

  // All conditions must be true (AND logic)
  return field.conditions.every(condition => {
    const fieldValue = formData[condition.field_id]
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'contains':
        return fieldValue && fieldValue.toString().toLowerCase().includes(condition.value.toLowerCase())
      default:
        return false
    }
  })
}

export function processConditionalForm(
  fields: CustomFormField[],
  formData: Record<string, any>
): {
  visibleFields: CustomFormField[]
  validationErrors: Record<string, string>
} {
  const visibleFields: CustomFormField[] = []
  const validationErrors: Record<string, string> = {}

  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order)

  for (const field of sortedFields) {
    // Check if field should be visible based on conditions
    if (evaluateFieldConditions(field, formData)) {
      visibleFields.push(field)

      // Validate visible fields
      const validation = validateFormField(field, formData[field.id])
      if (!validation.isValid && validation.error) {
        validationErrors[field.id] = validation.error
      }
    }
  }

  return {
    visibleFields,
    validationErrors
  }
}