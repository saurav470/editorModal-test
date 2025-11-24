// @ts-nocheck
/**
 * ClaimTab Component
 * 
 * Displays and manages claim statements in the editor.
 * Claims are pre-identified by the backend with IDs.
 * 
 * @component
 */

import { Form, Input, List, Card, Space, Typography, Tooltip, Button } from "antd"
import { RedoDot, Edit3, Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import type { ClaimTabProps } from "../types"
import EditWarning from "./EditWarning"
import { EnhancedTextArea } from "./EnhancedInput"

const { Text } = Typography

/**
 * ClaimTab Component
 * 
 * Manages claim statements which are backed by the backend with pre-assigned IDs.
 * Each claim can be edited and regenerated using AI.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function ClaimTab({
  setRegenerateModal,
  setSelectedfield,
  claimData,
  setClaimData,
  form
}: ClaimTabProps) {
  // State for tracking editing status
  const [editingClaims, setEditingClaims] = useState<Set<number>>(new Set());
  const [showWarning, setShowWarning] = useState(false);
  // State to track original values before editing
  const [originalClaimValues, setOriginalClaimValues] = useState<Map<number, string>>(new Map());

  /**
   * Opens the regenerate modal for a specific claim
   * @param fieldName - The field identifier (e.g., "claim_2180")
   * @param fieldPath - Path to the field in the form
   */
  const handleRegenerate = (fieldName: string, fieldPath: (string | number)[]) => {
    setRegenerateModal({ open: true, field: fieldName, fieldPath })
  }

  /**
   * Handles selecting a claim field for highlighting in preview
   * @param selectedField - The selected field identifier
   */
  const handleSelection = (selectedField: string): void => {
    setSelectedfield(selectedField)
  }

  /**
   * Handles starting edit mode for a claim
   * @param claimId - The claim ID being edited
   */
  const handleStartEdit = (claimId: number) => {
    // Store the current form value before editing starts (not initial state)
    const currentFormValues = form.getFieldsValue();
    const claimIndex = claimData.findIndex(item => item.id === claimId);
    const currentFormValue = currentFormValues.claim?.[claimIndex]?.text || '';

    if (currentFormValue !== undefined) {
      setOriginalClaimValues(prev => new Map(prev.set(claimId, currentFormValue)));
    }

    setEditingClaims(prev => new Set([...prev, claimId]));
    setShowWarning(true);
  }

  /**
   * Handles finishing edit mode for a claim
   * @param claimId - The claim ID being finished
   */
  const handleFinishEdit = (claimId: number) => {
    // Remove from editing set
    setEditingClaims(prev => {
      const newSet = new Set(prev);
      newSet.delete(claimId);
      return newSet;
    });

    // Remove from original values tracking since edit was successful
    setOriginalClaimValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(claimId);
      return newMap;
    });

    // Hide warning if no claims are being edited
    if (editingClaims.size <= 1) {
      setShowWarning(false);
    }
  }

  /**
   * Handles canceling edit mode for a claim
   * @param claimId - The claim ID being canceled
   */
  const handleCancelEdit = (claimId: number) => {
    // Restore the original value when canceling edit
    const originalValue = originalClaimValues.get(claimId);
    if (originalValue !== undefined) {
      // Update component state
      setClaimData(prev =>
        prev.map(item =>
          item.id === claimId
            ? { ...item, text: originalValue }
            : item
        )
      );

      // Update form values to match the restored state
      const currentFormValues = form.getFieldsValue();
      const claimIndex = claimData.findIndex(item => item.id === claimId);

      if (claimIndex !== -1 && currentFormValues.claim) {
        const updatedClaimData = [...currentFormValues.claim];
        updatedClaimData[claimIndex] = { ...updatedClaimData[claimIndex], text: originalValue };

        form.setFieldsValue({
          ...currentFormValues,
          claim: updatedClaimData
        });
      }
    }

    // Remove from editing set
    setEditingClaims(prev => {
      const newSet = new Set(prev);
      newSet.delete(claimId);
      return newSet;
    });

    // Remove from original values tracking
    setOriginalClaimValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(claimId);
      return newMap;
    });

    // Hide warning if no claims are being edited
    if (editingClaims.size <= 1) {
      setShowWarning(false);
    }
  }

  /**
   * Handles input focus for a claim
   * @param claimId - The claim ID being focused
   */
  const handleInputFocus = (claimId: number) => {
    // Set the selected field for iframe highlighting
    handleSelection(`claim_${claimId}`);

    if (!editingClaims.has(claimId)) {
      handleStartEdit(claimId);
    }
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
      {/* Warning Message */}
      <EditWarning
        visible={showWarning}
        message="You are about to edit this claim. Please ensure that only compliant information is entered."
        type="warning"
      />

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "space-between" }}>
            <Text strong>Claim Statements</Text>
            <div style={{
              backgroundColor: "#f5f5f5",
              color: "#666",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
            }}>
              {claimData.length} {claimData.length === 1 ? 'statement' : 'statements'}
            </div>
          </div>
          {/* <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNonclaim}
            size="small"
          >
            Add Statement
          </Button> */}
        </div>

        {claimData.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">No claim statements added yet. Click "Add Statement" to get started.</Text>
          </Card>
        ) : (
          <Form.List name="claim">
            {(fields, { add, remove }) => (
              <>
                <List
                  dataSource={fields}
                  renderItem={(field, index) => {
                    const claimId = claimData[index]?.id;
                    const isEditing = editingClaims.has(claimId);

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
                                <Text strong>Statement {index + 1}</Text>
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
                                        onClick={() => handleFinishEdit(claimId)}
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
                                        onClick={() => handleCancelEdit(claimId)}
                                        style={{ height: "24px", padding: "0 8px" }}
                                      />
                                    </Tooltip>
                                  </>
                                ) : (
                                  <>
                                    <Tooltip title="Regenerate this statement">
                                      <RedoDot
                                        size={16}
                                        onClick={() => handleRegenerate(`claim_${claimData[index]?.id}`, ["claim", field.name, "text"])}
                                        style={{ cursor: "pointer", color: "rgba(3, 78, 162, 1)" }}
                                      />
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </div>
                            <Form.Item
                              name={[field.name, "text"]}
                              rules={[{ required: true, message: "Please enter claim statement" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <EnhancedTextArea
                                placeholder="Enter claim statement..."
                                autoSize
                                isEditing={isEditing}
                                onClick={() => handleSelection(`claim_${claimData[index]?.id || index}`)}
                                onFocus={() => handleInputFocus(claimId)}
                                disabled={!isEditing && editingClaims.size > 0}
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
                {/* <Button
                  type="dashed"
                  onClick={() => {
                    const newId = Math.max(...nonclaimData.map(item => item.id), 0) + 1;
                    const newNonclaim = { id: newId, text: "" };
                    add(newNonclaim);
                    setNonclaimData([...nonclaimData, newNonclaim]);
                  }}
                  style={{ width: "100%", marginTop: "16px" }}
                  icon={<PlusOutlined />}
                >
                  Add Statement
                </Button> */}
              </>
            )}
          </Form.List>
        )}
      </div>
    </div>
  )
}

