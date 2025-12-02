/**
 * TextInputModal Component
 * 
 * A simple modal for entering claim or nonclaim text before placement.
 * 
 * @component
 */

import { Modal, Input, Space, Typography } from "antd";
import { FileCheck, FileText } from "lucide-react";
import { useState, useEffect } from "react";

const { Text } = Typography;
const { TextArea } = Input;

interface TextInputModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Type of content: 'claim' or 'nonclaim' */
  type: "claim" | "nonclaim";
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when text is confirmed */
  onConfirm: (text: string) => void;
  /** Initial text value */
  initialText?: string;
}

/**
 * Text Input Modal Component
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const TextInputModal: React.FC<TextInputModalProps> = ({
  open,
  type,
  onClose,
  onConfirm,
  initialText = ""
}) => {
  const [text, setText] = useState(initialText);
  const isClaim = type === "claim";

  // Reset text when modal opens/closes
  useEffect(() => {
    if (open) {
      setText(initialText);
    }
  }, [open, initialText]);

  const handleConfirm = () => {
    if (text.trim()) {
      onConfirm(text.trim());
    }
  };

  const handleCancel = () => {
    setText("");
    onClose();
  };

  const isValid = text.trim().length > 0;

  const title = isClaim
    ? "Enter Claim Statement"
    : "Enter Nonclaim Statement";

  const placeholder = isClaim
    ? "Enter your claim statement..."
    : "Enter your nonclaim statement...";

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Continue to Placement"
      cancelText="Cancel"
      okButtonProps={{
        disabled: !isValid,
        style: {
          backgroundColor: isValid ? "#1890ff" : "#d9d9d9",
          borderColor: isValid ? "#1890ff" : "#d9d9d9",
        }
      }}
      title={
        <Space>
          <span style={{ color: isClaim ? "#1890ff" : "#52c41a" }}>
            {isClaim ? <FileCheck size={20} /> : <FileText size={20} />}
          </span>
          <Text strong style={{ fontSize: "16px" }}>{title}</Text>
        </Space>
      }
      width={600}
      styles={{
        body: {
          padding: "24px",
        },
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={1000}
          showCount
          autoFocus
          onPressEnter={(e) => {
            if (e.ctrlKey || e.metaKey) {
              handleConfirm();
            }
          }}
        />
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {isClaim
            ? "Enter the claim statement you want to place in the email."
            : "Enter the nonclaim statement you want to place in the email."}
        </Text>
      </Space>
    </Modal>
  );
};

