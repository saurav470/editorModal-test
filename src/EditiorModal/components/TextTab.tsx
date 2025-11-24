// @ts-nocheck
/**
 * TextTab Component
 * 
 * Displays and manages text fields (subject, preheader, introduction, closing)
 * and non-claim items. This is the main text editing tab in the editor.
 * 
 * @component
 */

import { Form, Input, Tooltip, List, Card, Space, Typography, Button } from "antd"
import { RedoDot, Edit3, Check, X } from "lucide-react"
import { useState } from "react"
import type { TextTabProps } from "../types"
import { EnhancedTextArea } from "./EnhancedInput"

const { Text } = Typography

/**
 * TextTab Component
 * 
 * Main text editing interface for standard email fields and non-claim items.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function TextTab({
  setRegenerateModal,
  setSelectedfield,
  nonclaimData,
  setNonclaimData,
  form
}: TextTabProps) {
  // State for tracking editing status for text fields
  const [editingTextFields, setEditingTextFields] = useState<Set<string>>(new Set());
  // State for tracking editing status for nonclaim items
  const [editingNonclaims, setEditingNonclaims] = useState<Set<number>>(new Set());
  // State to track original values before editing
  const [originalTextValues, setOriginalTextValues] = useState<Map<string, string>>(new Map());
  const [originalNonclaimValues, setOriginalNonclaimValues] = useState<Map<number, string>>(new Map());

  /**
   * Opens the regenerate modal for a specific field
   * @param fieldName - The field name (e.g., "Subject", "nonclaim_9586")
   * @param fieldPath - Path to the field in the form
   */
  const handleRegenerate = (fieldName: string, fieldPath: (string | number)[]): void => {
    setRegenerateModal({ open: true, field: fieldName, fieldPath })
  }

  /**
   * Handles selecting a field for highlighting in preview
   * @param selectedField - The selected field identifier
   */
  const handleSelection = (selectedField: string): void => {
    setSelectedfield(selectedField)
  }

  // Text field handlers
  /**
   * Handles starting edit mode for a text field
   * @param fieldName - The field name being edited
   */
  const handleStartEditText = (fieldName: string) => {
    // Store the current form value before editing starts
    const currentFormValues = form.getFieldsValue();
    const currentValue = currentFormValues[fieldName] || '';

    if (currentValue !== undefined) {
      setOriginalTextValues(prev => new Map(prev.set(fieldName, currentValue)));
    }

    setEditingTextFields(prev => new Set([...prev, fieldName]));
  }

  /**
   * Handles finishing edit mode for a text field
   * @param fieldName - The field name being finished
   */
  const handleFinishEditText = (fieldName: string) => {
    setEditingTextFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });

    // Remove from original values tracking since edit was successful
    setOriginalTextValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(fieldName);
      return newMap;
    });
  }

  /**
   * Handles canceling edit mode for a text field
   * @param fieldName - The field name being canceled
   */
  const handleCancelEditText = (fieldName: string) => {
    // Restore the original value when canceling edit
    const originalValue = originalTextValues.get(fieldName);
    if (originalValue !== undefined) {
      // Update form values to match the restored state
      form.setFieldValue(fieldName, originalValue);
    }

    // Remove from editing set
    setEditingTextFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });

    // Remove from original values tracking
    setOriginalTextValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(fieldName);
      return newMap;
    });
  }

  // Nonclaim handlers
  /**
   * Handles starting edit mode for a nonclaim item
   * @param nonclaimId - The nonclaim ID being edited
   */
  const handleStartEditNonclaim = (nonclaimId: number) => {
    // Store the current form value before editing starts
    const currentFormValues = form.getFieldsValue();
    const nonclaimIndex = nonclaimData.findIndex(item => item.id === nonclaimId);
    const currentValue = currentFormValues.nonclaim?.[nonclaimIndex]?.text || '';

    if (currentValue !== undefined) {
      setOriginalNonclaimValues(prev => new Map(prev.set(nonclaimId, currentValue)));
    }

    setEditingNonclaims(prev => new Set([...prev, nonclaimId]));
  }

  /**
   * Handles finishing edit mode for a nonclaim item
   * @param nonclaimId - The nonclaim ID being finished
   */
  const handleFinishEditNonclaim = (nonclaimId: number) => {
    setEditingNonclaims(prev => {
      const newSet = new Set(prev);
      newSet.delete(nonclaimId);
      return newSet;
    });

    // Remove from original values tracking since edit was successful
    setOriginalNonclaimValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(nonclaimId);
      return newMap;
    });
  }

  /**
   * Handles canceling edit mode for a nonclaim item
   * @param nonclaimId - The nonclaim ID being canceled
   */
  const handleCancelEditNonclaim = (nonclaimId: number) => {
    // Restore the original value when canceling edit
    const originalValue = originalNonclaimValues.get(nonclaimId);
    if (originalValue !== undefined) {
      // Update component state
      setNonclaimData(prev =>
        prev.map(item =>
          item.id === nonclaimId
            ? { ...item, text: originalValue }
            : item
        )
      );

      // Update form values to match the restored state
      const currentFormValues = form.getFieldsValue();
      const nonclaimIndex = nonclaimData.findIndex(item => item.id === nonclaimId);

      if (nonclaimIndex !== -1 && currentFormValues.nonclaim) {
        const updatedNonclaimData = [...currentFormValues.nonclaim];
        updatedNonclaimData[nonclaimIndex] = { ...updatedNonclaimData[nonclaimIndex], text: originalValue };

        form.setFieldsValue({
          ...currentFormValues,
          nonclaim: updatedNonclaimData
        });
      }
    }

    // Remove from editing set
    setEditingNonclaims(prev => {
      const newSet = new Set(prev);
      newSet.delete(nonclaimId);
      return newSet;
    });

    // Remove from original values tracking
    setOriginalNonclaimValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(nonclaimId);
      return newMap;
    });
  }

  /**
   * Creates a form item with edit functionality for text fields
   * @param label - Display label for the field
   * @param name - Form field name path
   * @param placeholder - Placeholder text
   * @param isTextArea - Whether to use textarea instead of input
   * @returns JSX.Element
   */
  const formItemWithEditFunctionality = (
    label: string,
    name: string,
    placeholder: string,
    isTextArea = false,
  ) => {
    const isEditing = editingTextFields.has(name);

    return (
      <Card
        size="small"
        style={{
          width: "100%",
          border: isEditing ? "2px solid #1890ff" : "1px solid #d9d9d9",
          boxShadow: isEditing ? "0 2px 8px rgba(24, 144, 255, 0.15)" : "0 1px 2px rgba(0, 0, 0, 0.06)",
          transition: "all 0.2s ease-in-out",
          marginBottom: "16px"
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Text strong>{label}</Text>
              {isEditing && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 6px",
                  backgroundColor: "#e6f7ff",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}>
                  <Edit3 size={12} color="#1890ff" />
                  <Text style={{ color: "#1890ff", fontSize: "12px" }}>Editing</Text>
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isEditing ? (
                <>
                  <Tooltip title="Save changes">
                    <Button
                      type="primary"
                      size="small"
                      icon={<Check size={14} />}
                      onClick={() => handleFinishEditText(name)}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                        height: "24px",
                        padding: "0 8px"
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Cancel editing">
                    <Button
                      size="small"
                      icon={<X size={14} />}
                      onClick={() => handleCancelEditText(name)}
                      style={{ height: "24px", padding: "0 8px" }}
                    />
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Regenerate this field">
                    <RedoDot
                      size={16}
                      onClick={() => handleRegenerate(label, [name])}
                      style={{ cursor: "pointer", color: "rgba(3, 78, 162, 1)" }}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <Form.Item
            name={name}
            rules={label === "Subject" ? [{ required: true, message: `Please enter ${label.toLowerCase()}` }] : undefined}
            style={{ marginBottom: 0 }}
          >
            {isTextArea ? (
              <EnhancedTextArea
                placeholder={placeholder}
                autoSize
                isEditing={isEditing}
                onClick={() => handleSelection(name)}
                onFocus={() => handleStartEditText(name)}
                disabled={!isEditing && editingTextFields.size > 0}
              />
            ) : (
              <Input
                placeholder={placeholder}
                onClick={() => handleSelection(name)}
                onFocus={() => handleStartEditText(name)}
                disabled={!isEditing && editingTextFields.size > 0}
              />
            )}
          </Form.Item>
        </Space>
      </Card>
    )
  }

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        padding: "0 8px 16px 0",
        flex: "1",
      }}
    >
      {/* Text Fields */}
      {localStorage.getItem("contentNewtonChannel") === "email_fragment" ? (
        <>
          {/* Render nothing or something specific for "email_fragment" */}
        </>
      ) : (
        <>
          {formItemWithEditFunctionality("Subject", "subject", "Enter subject", true)}
          {formItemWithEditFunctionality("Preheader", "preheader", "Enter preheader text", true)}
          {formItemWithEditFunctionality("Introduction", "introduction", "Enter intro text", true)}
          {formItemWithEditFunctionality("Closing", "closing", "Enter closing text", true)}
        </>
      )}

      {/* Nonclaim Statements */}
      <div style={{ marginTop: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
            <Text strong>Supporting Statements</Text>
            <div style={{
              backgroundColor: "#f5f5f5",
              color: "#666",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
            }}>
              {nonclaimData.length} {nonclaimData.length === 1 ? 'statement' : 'statements'}
            </div>
          </div>
        </div>

        {nonclaimData.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">No nonclaim statements added yet. Click "Add Statement" to get started.</Text>
          </Card>
        ) : (
          <Form.List name="nonclaim">
            {(fields, { add, remove }) => (
              <>
                <List
                  dataSource={fields}
                  renderItem={(field, index) => {
                    const nonclaimId = nonclaimData[index]?.id;
                    const isEditing = editingNonclaims.has(nonclaimId);

                    return (
                      <List.Item style={{ padding: "8px 0" }}>
                        <Card
                          size="small"
                          style={{
                            width: "100%",
                            border: isEditing ? "2px solid #1890ff" : "1px solid #d9d9d9",
                            boxShadow: isEditing ? "0 2px 8px rgba(24, 144, 255, 0.15)" : "0 1px 2px rgba(0, 0, 0, 0.06)",
                            transition: "all 0.2s ease-in-out"
                          }}
                        >
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Text strong>Supporting Text {index + 1}</Text>
                                {isEditing && (
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "2px 6px",
                                    backgroundColor: "#e6f7ff",
                                    borderRadius: "4px",
                                    fontSize: "12px"
                                  }}>
                                    <Edit3 size={12} color="#1890ff" />
                                    <Text style={{ color: "#1890ff", fontSize: "12px" }}>Editing</Text>
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {isEditing ? (
                                  <>
                                    <Tooltip title="Save changes">
                                      <Button
                                        type="primary"
                                        size="small"
                                        icon={<Check size={14} />}
                                        onClick={() => handleFinishEditNonclaim(nonclaimId)}
                                        style={{
                                          backgroundColor: "#52c41a",
                                          borderColor: "#52c41a",
                                          height: "24px",
                                          padding: "0 8px"
                                        }}
                                      />
                                    </Tooltip>
                                    <Tooltip title="Cancel editing">
                                      <Button
                                        size="small"
                                        icon={<X size={14} />}
                                        onClick={() => handleCancelEditNonclaim(nonclaimId)}
                                        style={{ height: "24px", padding: "0 8px" }}
                                      />
                                    </Tooltip>
                                  </>
                                ) : (
                                  <>
                                    <Tooltip title="Regenerate this statement">
                                      <RedoDot
                                        size={16}
                                        onClick={() => handleRegenerate(`nonclaim_${nonclaimData[index]?.id}`, ["nonclaim", field.name, "text"])}
                                        style={{ cursor: "pointer", color: "rgba(3, 78, 162, 1)" }}
                                      />
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </div>
                            <Form.Item
                              name={[field.name, "text"]}
                              rules={[{ required: true, message: "Please enter nonclaim statement" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <EnhancedTextArea
                                placeholder="Enter nonclaim statement..."
                                autoSize
                                isEditing={isEditing}
                                onClick={() => handleSelection(`nonclaim_${nonclaimData[index]?.id || index}`)}
                                onFocus={() => handleStartEditNonclaim(nonclaimId)}
                                disabled={!isEditing && editingNonclaims.size > 0}
                              />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, "id"]}
                              style={{ display: "none" }}
                            >
                              <Input type="hidden" />
                            </Form.Item>
                          </Space>
                        </Card>
                      </List.Item>
                    );
                  }}
                />
              </>
            )}
          </Form.List>
        )}
      </div>
    </div>
  )
}