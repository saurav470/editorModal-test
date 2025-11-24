// @ts-nocheck
/**
 * NonclaimTab Component
 * 
 * Displays and manages non-claim (supporting text) items in the editor.
 * Non-claims now have IDs from the backend, same as claims.
 * 
 * @component
 */

import { Form, Input, List, Card, Space, Typography, Tooltip } from "antd"
import { RedoDot } from "lucide-react"
import type { NonclaimTabProps } from "../types"

const { Text } = Typography

/**
 * NonclaimTab Component
 * 
 * Manages non-claim (supporting text) items. Non-claims now have IDs from
 * the backend, same as claims.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function NonclaimTab({
  setRegenerateModal,
  setSelectedfield,
  nonclaimData,
  setNonclaimData
}: NonclaimTabProps) {

  /**
   * Opens the regenerate modal for a specific non-claim
   * @param fieldName - The field identifier (e.g., "nonclaim_9586")
   * @param fieldPath - Path to the field in the form
   */
  const handleRegenerate = (fieldName: string, fieldPath: (string | number)[]): void => {
    setRegenerateModal({ open: true, field: fieldName, fieldPath })
  }

  /**
   * Handles selecting a non-claim field for highlighting in preview
   * @param selectedField - The selected field identifier
   */
  const handleSelection = (selectedField: string): void => {
    setSelectedfield(selectedField)
  }

  const formItemWithRegenerateButton = (
    label: string,
    name: any[],
    placeholder: string,
    isTextArea = false,
    rows = 1,
  ) => {
    const iconSize = 16

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <label>{label}</label>
          <div style={{ color: "rgba(3, 78, 162, 1)", marginBottom: "4px", height: "27px", display: "flex", alignItems: "center" }}>
            <Tooltip title={`Prompt Editor for ${label.toLowerCase()}`} >
              <RedoDot size={iconSize} onClick={() => handleRegenerate(label, name)} style={{ cursor: "pointer" }} />
            </Tooltip>
          </div>
        </div>
        <Form.Item
          name={name}
          rules={[{ required: true, message: `Please enter ${label.toLowerCase()}` }]}
        >
          {isTextArea ? (
            <Input.TextArea
              placeholder={placeholder}
              style={{ resize: "none" }}
              autoSize
              onClick={() => handleSelection(name[0])}
            />
          ) : (
            <Input
              placeholder={placeholder}
              onClick={() => handleSelection(name[0])}
            />
          )}
        </Form.Item>
      </div>
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
      <div style={{ marginBottom: "16px" }}>
        {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <Text strong>Nonclaim Statements</Text>

        </div> */}

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
                  renderItem={(field, index) => (
                    <List.Item style={{ padding: "8px 0" }}>
                      <Card
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text strong>Supported Text {index + 1}</Text>
                            <Tooltip title="Regenerate this statement">
                              <RedoDot
                                size={16}
                                onClick={() => handleRegenerate(`nonclaim_${nonclaimData[index]?.id}`, ["nonclaim", field.name, "text"])}
                                style={{ cursor: "pointer", color: "rgba(3, 78, 162, 1)" }}
                              />
                            </Tooltip>
                          </div>
                          <Form.Item
                            name={[field.name, "text"]}
                            rules={[{ required: true, message: "Please enter nonclaim statement" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input.TextArea
                              placeholder="Enter nonclaim statement..."
                              autoSize
                              style={{ resize: "none" }}
                              onClick={() => handleSelection(`nonclaim_${nonclaimData[index]?.id || index}`)}
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
                  )}
                />
              </>
            )}
          </Form.List>
        )}
      </div>
    </div>
  )
}