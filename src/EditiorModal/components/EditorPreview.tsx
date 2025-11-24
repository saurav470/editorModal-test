/**
 * EditorPreview Component
 * 
 * Displays the iframe preview of the edited content
 * Shows a loading spinner while the iframe is loading
 */

import { Card, Spin, Typography } from "antd";
import { scrollBarStyles } from "../constants";

const { Text } = Typography;

interface EditorPreviewProps {
  /** Reference to the iframe element */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Current iframe HTML content */
  iframeContent: string;
  /** Whether the iframe is loading */
  iframeLoading: boolean;
  /** Loading state for the entire editor */
  loading: boolean;
  /** Callback when iframe finishes loading */
  onIframeLoad: () => void;
}

/**
 * Preview panel showing the iframe with live updates
 * Displays loading state while content is being rendered
 * 
 * @example
 * ```tsx
 * <EditorPreview
 *   iframeRef={iframeRef}
 *   iframeContent={htmlContent}
 *   iframeLoading={isLoading}
 *   loading={saving}
 *   onIframeLoad={handleLoad}
 * />
 * ```
 */
export const EditorPreview: React.FC<EditorPreviewProps> = ({
  iframeRef,
  iframeContent,
  iframeLoading,
  loading,
  onIframeLoad
}) => {
  return (
    <Card
      style={{
        height: "100%",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid gray",
      }}
      bodyStyle={{
        padding: "12px",
        height: "100% ",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {iframeLoading && (
        <div style={{ margin: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Spin />
          <Text>Loading...</Text>
        </div>
      )}
      <div style={{ display: loading ? "none" : "", height: "100%" }}>
        <iframe
          ref={iframeRef}
          srcDoc={scrollBarStyles + iframeContent}
          onLoad={onIframeLoad}
          style={{
            flex: "1",
            border: "none",
            borderRadius: "4px",
            width: "100%",
            height: "100%",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          }}
          title="Preview"
        />
      </div>
    </Card>
  );
};

