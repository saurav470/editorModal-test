/**
 * EditWarning Component
 * 
 * Displays a warning message when user starts editing claims.
 * Provides clear guidance about compliance requirements.
 * Includes smooth fade-in/fade-out animations.
 */

import { Alert, Typography } from "antd";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const { Text } = Typography;

interface EditWarningProps {
  /** Whether the warning should be visible */
  visible: boolean;
  /** Custom message to display */
  message?: string;
  /** Type of warning (default: warning) */
  type?: "warning" | "info" | "error";
}

/**
 * Warning component for claim editing with smooth animations
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const EditWarning: React.FC<EditWarningProps> = ({
  visible,
  message = "You are about to edit this claim. Please ensure that only compliant information is entered.",
  type = "warning"
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        marginBottom: "16px"
      }}
    >
      <Alert
        type={type}
        showIcon
        icon={<AlertTriangle size={16} />}
        message={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong style={{ color: type === "warning" ? "#fa8c16" : type === "error" ? "#ff4d4f" : "#1890ff" }}>
              {message}
            </Text>
          </div>
        }
        style={{
          borderRadius: "6px",
          border: `1px solid ${type === "warning" ? "#fa8c16" : type === "error" ? "#ff4d4f" : "#1890ff"}`,
          backgroundColor: type === "warning" ? "#fff7e6" : type === "error" ? "#fff2f0" : "#f6ffed"
        }}
      />
    </div>
  );
};

export default EditWarning;
