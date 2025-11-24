
import { useState } from "react"
import { Modal, Button, Typography } from "antd"
import { CloseOutlined } from "@ant-design/icons"
import { ViewMapping } from "../constants"
const { Text } = Typography


export function EditorModalHeader({
  regenerateModal,
  onOk,
  editTitle,
  // modifiedVersion,
  exitPromptEditor,
  resetForm,
  form,
  initialValues,
  notificationService,
  applyChanges,
  modifiedData,
  hasImageChanges,

}: {
  regenerateModal: { open: boolean; field: string; fieldPath: any[] }
  onOk: () => void
  editTitle: string
  exitPromptEditor: () => void
  setOpen: (open: boolean) => void
  resetForm: () => void
  form: any
  initialValues: any
  notificationService: {
    successMessage: (text?: string) => void
    errorMessage: (text?: string) => void
    warningMessage: (text?: string) => void
    infoMessage: (text?: string) => void
  }
  applyChanges: (modifiedVersion: number, modifiedVersionNumber: number) => void
  modifiedData: {
    id: number;
    version: number;
  }
  hasImageChanges: boolean

}) {
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const checkForChanges = () => {
    const currentValues = form.getFieldsValue()

    // Compare current form values with initial values
    console.log("currentValues", currentValues)
    console.log("initialValues", initialValues)
    const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(initialValues)

    console.log("hasChanges", hasChanges, hasImageChanges)


    if (!hasChanges && !hasImageChanges) {
      notificationService.infoMessage("No unsaved changes to discard.")
    } else {
      setDiscardModalVisible(true)
    }
  }
  console.log("modifiedData 123 @", regenerateModal)
  return (
    <>
      <div style={{ flex: "0 0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          {regenerateModal.open ? (
            <Text style={{ fontSize: "18px", fontWeight: "700" }}>{`Prompt Editor - ${ViewMapping[regenerateModal?.fieldPath[0] as keyof typeof ViewMapping][0]}`}</Text>
          ) : (
            <Text style={{ fontSize: "18px", fontWeight: "700" }}>{`${editTitle} Editor`}</Text>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            {/* {regenerateModal.open ? null : (
              <Button onClick={() => null} style={{ color: "rgba(3, 78, 162, 1)" }}>
                {`Preview`}
              </Button>
            )} */}
            <Button onClick={() => (regenerateModal.open ? applyChanges(modifiedData.id, modifiedData.version) : onOk())} style={{ color: "rgba(3, 78, 162, 1)" }}>
              {regenerateModal.open ? `Apply ${modifiedData.version !== 0 ? `V${modifiedData.version}` : ""}` : `Save`}
            </Button>
            <Button
              onClick={() => (regenerateModal.open ? exitPromptEditor() : checkForChanges())}
              style={{ color: "rgba(3, 78, 162, 1)" }}
            >
              {regenerateModal.open ? `Exit To Prompt Editor` : `Discard`}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        centered={true}
        title="Discard unsaved changes"
        open={discardModalVisible}
        onCancel={() => setDiscardModalVisible(false)}
        footer={[
          <Button key="cancel" type="primary" onClick={() => setDiscardModalVisible(false)} style={{ background: "rgba(3, 78, 162, 1)", color: "white" }}>
            Cancel
          </Button>,
          <Button key="discard" onClick={() => {
            setDiscardModalVisible(false)
            resetForm()
          }}
            style={{ color: "rgba(3, 78, 162, 1)" }}>
            Lose Changes
          </Button>
        ]}
        closable={true}
        closeIcon={<CloseOutlined style={{ color: "#999" }} />}
        bodyStyle={{ padding: "24px" }}
      >
        <Text>If you proceed, you will lose all the changes you have made.</Text>

      </Modal>
    </>
  )
}