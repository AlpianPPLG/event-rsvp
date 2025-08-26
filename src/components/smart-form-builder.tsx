/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  FormInput, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Settings,
  Eye,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { CustomFormField, FieldCondition } from "@/lib/types"
import { processConditionalForm, generateFieldId } from "@/lib/smart-forms-client"
import { toast } from "sonner"

interface SmartFormBuilderProps {
  eventId?: number
  initialFields?: CustomFormField[]
  onFieldsChange?: (fields: CustomFormField[]) => void
  readOnly?: boolean
}

interface SmartFormProps {
  fields: CustomFormField[]
  onSubmit: (formData: Record<string, any>, rsvpStatus: 'yes' | 'no' | 'maybe') => void
  loading?: boolean
}

// Form Builder Component
export function SmartFormBuilder({ 
  initialFields = [], 
  onFieldsChange, 
  readOnly = false 
}: SmartFormBuilderProps) {
  const [fields, setFields] = useState<CustomFormField[]>(initialFields)
  const [previewMode, setPreviewMode] = useState(false)
  const [] = useState<Record<string, any>>({})

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'file', label: 'File Upload' }
  ]

  useEffect(() => {
    onFieldsChange?.(fields)
  }, [fields, onFieldsChange])

  const addField = () => {
    const newField: CustomFormField = {
      id: generateFieldId(),
      type: 'text',
      label: 'New Field',
      required: false,
      order: fields.length + 1,
      conditions: []
    }
    setFields(prev => [...prev, newField])
  }

  const updateField = (fieldId: string, updates: Partial<CustomFormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setFields(prev => {
      const currentIndex = prev.findIndex(field => field.id === fieldId)
      if ((direction === 'up' && currentIndex === 0) || 
          (direction === 'down' && currentIndex === prev.length - 1)) {
        return prev
      }

      const newFields = [...prev]
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      
      // Swap elements
      const temp = newFields[currentIndex]
      newFields[currentIndex] = newFields[swapIndex]
      newFields[swapIndex] = temp
      
      // Update order
      newFields.forEach((field, idx) => {
        field.order = idx + 1
      })
      
      return newFields
    })
  }

  const addCondition = (fieldId: string) => {
    const condition: FieldCondition = {
      field_id: '',
      operator: 'equals',
      value: ''
    }
    updateField(fieldId, {
      conditions: [...(fields.find(f => f.id === fieldId)?.conditions || []), condition]
    })
  }

  const updateCondition = (fieldId: string, conditionIndex: number, updates: Partial<FieldCondition>) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const newConditions = [...field.conditions || []]
    newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates }
    updateField(fieldId, { conditions: newConditions })
  }

  const removeCondition = (fieldId: string, conditionIndex: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const newConditions = field.conditions?.filter((_, index) => index !== conditionIndex) || []
    updateField(fieldId, { conditions: newConditions })
  }

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Form Preview</h3>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <Settings className="h-4 w-4 mr-2" />
            Back to Builder
          </Button>
        </div>
        <SmartForm 
          fields={fields} 
          onSubmit={(data, status) => {
            console.log('Preview submission:', data, status)
            toast.success('Preview submission successful!')
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Smart Form Builder</h3>
          <p className="text-sm text-muted-foreground">
            Create conditional forms with dynamic field visibility
          </p>
        </div>
        <div className="flex gap-2">
          {fields.length > 0 && (
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          {!readOnly && (
            <Button onClick={addField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          )}
        </div>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FormInput className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Form Fields</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your custom RSVP form by adding fields
            </p>
            {!readOnly && (
              <Button onClick={addField}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Field
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fields.map((field, fieldIndex) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{field.type}</Badge>
                      {field.required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                      {field.conditions && field.conditions.length > 0 && (
                        <Badge variant="outline">
                          {field.conditions.length} condition(s)
                        </Badge>
                      )}
                    </div>
                    {!readOnly ? (
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="font-medium"
                      />
                    ) : (
                      <h4 className="font-medium">{field.label}</h4>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, 'up')}
                        disabled={fieldIndex === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, 'down')}
                        disabled={fieldIndex === fields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!readOnly && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(field.id, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => 
                            updateField(field.id, { required: !!checked })
                          }
                        />
                        <Label htmlFor={`required-${field.id}`}>Required field</Label>
                      </div>
                    </div>

                    {/* Options for select/radio/checkbox */}
                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={field.options?.join('\\n') || ''}
                          onChange={(e) => updateField(field.id, { 
                            options: e.target.value.split('\\n').filter(Boolean) 
                          })}
                          placeholder="Option 1\\nOption 2\\nOption 3"
                        />
                      </div>
                    )}

                    {/* Conditional Logic */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Conditional Logic</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addCondition(field.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Condition
                        </Button>
                      </div>
                      
                      {field.conditions && field.conditions.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Show this field when ALL conditions are met:
                          </p>
                          {field.conditions.map((condition, condIndex) => (
                            <div key={condIndex} className="flex gap-2 items-center p-2 border rounded">
                              <Select
                                value={condition.field_id}
                                onValueChange={(value) => updateCondition(field.id, condIndex, { field_id: value })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fields.filter(f => f.id !== field.id).map(f => (
                                    <SelectItem key={f.id} value={f.id}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={condition.operator}
                                onValueChange={(value) => updateCondition(field.id, condIndex, { operator: value as any })}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">equals</SelectItem>
                                  <SelectItem value="not_equals">not equals</SelectItem>
                                  <SelectItem value="contains">contains</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
                                value={condition.value}
                                onChange={(e) => updateCondition(field.id, condIndex, { value: e.target.value })}
                                placeholder="Value"
                                className="flex-1"
                              />
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCondition(field.id, condIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No conditions set - field will always be visible
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Smart Form Component for RSVP
export function SmartForm({ fields, onSubmit, loading = false }: SmartFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | 'maybe'>('yes')

  const processForm = useCallback(() => {
    return processConditionalForm(fields, formData)
  }, [fields, formData])

  const { visibleFields, validationErrors } = processForm()

  useEffect(() => {
    setErrors(validationErrors)
  }, [validationErrors])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = () => {
    const { validationErrors } = processConditionalForm(fields, formData)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error("Please fix the form errors before submitting")
      return
    }

    onSubmit(formData, rsvpStatus)
  }

  const renderField = (field: CustomFormField) => {
    const fieldError = errors[field.id]
    const fieldValue = formData[field.id]

    const fieldWrapper = (children: React.ReactNode) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className={field.required ? "after:content-['*'] after:text-red-500" : ""}>
          {field.label}
        </Label>
        {children}
        {fieldError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{fieldError}</AlertDescription>
          </Alert>
        )}
      </div>
    )

    switch (field.type) {
      case 'text':
        return fieldWrapper(
          <Input
            id={field.id}
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={fieldError ? 'border-red-500' : ''}
          />
        )

      case 'email':
        return fieldWrapper(
          <Input
            id={field.id}
            type="email"
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={fieldError ? 'border-red-500' : ''}
          />
        )

      case 'textarea':
        return fieldWrapper(
          <Textarea
            id={field.id}
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={fieldError ? 'border-red-500' : ''}
          />
        )

      case 'select':
        return fieldWrapper(
          <Select
            value={fieldValue || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return fieldWrapper(
          <RadioGroup
            value={fieldValue || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return fieldWrapper(
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={(fieldValue || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = fieldValue || []
                    if (checked) {
                      handleFieldChange(field.id, [...currentValues, option])
                    } else {
                      handleFieldChange(field.id, currentValues.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'file':
        return fieldWrapper(
          <Input
            id={field.id}
            type="file"
            onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
            className={fieldError ? 'border-red-500' : ''}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP Form</CardTitle>
        <CardDescription>
          Please fill out the form below to confirm your attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSVP Status Selection */}
        <div className="space-y-2">
          <Label className="after:content-['*'] after:text-red-500">
            Will you attend this event?
          </Label>
          <RadioGroup
            value={rsvpStatus}
            onValueChange={(value) => setRsvpStatus(value as 'yes' | 'no' | 'maybe')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="rsvp-yes" />
              <Label htmlFor="rsvp-yes">Yes, Ill be there</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="rsvp-no" />
              <Label htmlFor="rsvp-no">No, I cant make it</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maybe" id="rsvp-maybe" />
              <Label htmlFor="rsvp-maybe">Maybe</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Dynamic Form Fields */}
        {visibleFields.map(field => renderField(field))}

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Submit RSVP
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}