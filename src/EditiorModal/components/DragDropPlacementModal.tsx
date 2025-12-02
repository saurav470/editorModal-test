/**
 * DragDropPlacementModal Component
 * 
 * A drag and drop modal for placing claim or nonclaim elements using GrapesJS droppable functionality.
 * Uses GrapesJS's built-in drag and drop system for reliable placement.
 * 
 * @component
 */

import { Modal, Button, Typography, Space, Alert } from "antd";
import { Check, X, Move, Info } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { injectIframeCustomStyles } from "../utils";

const { Text } = Typography;

interface DragDropPlacementModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Type of content: 'claim' or 'nonclaim' */
  type: "claim" | "nonclaim";
  /** The text content to place */
  text: string;
  /** Reference to the main iframe */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Current iframe HTML content */
  iframeContent: string;
  /** Callback when placement is confirmed */
  onConfirm: (position: { x: number; y: number; element: Element | null }) => void;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Drag and drop placement modal using GrapesJS droppable pattern
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const DragDropPlacementModal: React.FC<DragDropPlacementModalProps> = ({
  open,
  type,
  text,
  iframeRef,
  iframeContent,
  onConfirm,
  onClose,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; element: Element | null } | null>(null);
  const [previewIframeRef, setPreviewIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const previewElementRef = useRef<HTMLElement | null>(null);
  const dragElementRef = useRef<HTMLDivElement | null>(null);
  const isClaim = type === "claim";

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    if (previewIframeRef) {
      try {
        injectIframeCustomStyles(previewIframeRef);
        
        // Ensure pointer events are enabled
        const iframeDoc = previewIframeRef.contentDocument;
        const iframeWindow = previewIframeRef.contentWindow;
        if (iframeDoc && iframeWindow) {
          // Add style to ensure all elements are droppable
          if (!iframeDoc.getElementById('placement-dragdrop-styles')) {
            const styleEl = iframeDoc.createElement('style');
            styleEl.id = 'placement-dragdrop-styles';
            styleEl.textContent = `
              body, body * {
                pointer-events: auto !important;
              }
              .gjs-dashed * {
                pointer-events: none !important;
              }
              .dropzone-active {
                outline: 2px dashed ${isClaim ? "#1890ff" : "#52c41a"} !important;
                background-color: ${isClaim ? "rgba(24, 144, 255, 0.05)" : "rgba(82, 196, 26, 0.05)"} !important;
              }
              .preview-placement-element {
                pointer-events: none !important;
              }
            `;
            iframeDoc.head.appendChild(styleEl);
          }
        }
        
        setIframeReady(true);
        console.log("Iframe loaded and ready for drag and drop");
      } catch (error) {
        console.error("Error setting up iframe:", error);
      }
    }
  }, [previewIframeRef, isClaim]);

  // Remove preview element
  const removePreviewElement = useCallback((doc: Document) => {
    if (previewElementRef.current) {
      previewElementRef.current.remove();
      previewElementRef.current = null;
    }
    const preview = doc.querySelector(".preview-placement-element");
    if (preview) {
      preview.remove();
    }
  }, []);

  // Setup GrapesJS-style drag and drop
  useEffect(() => {
    if (!open || !previewIframeRef || !iframeReady || !dragElementRef.current) return;

    const iframeDoc = previewIframeRef.contentDocument;
    const iframeBody = iframeDoc?.body;
    const iframeWindow = previewIframeRef.contentWindow;

    if (!iframeDoc || !iframeBody || !iframeWindow) {
      console.warn("Iframe not ready for drag and drop");
      return;
    }

    // Wait for document to be fully ready
    if (iframeDoc.readyState !== 'complete' && iframeDoc.readyState !== 'interactive') {
      const checkReady = setInterval(() => {
        if (iframeDoc.readyState === 'complete' || iframeDoc.readyState === 'interactive') {
          clearInterval(checkReady);
          setTimeout(() => {
            if (open && previewIframeRef && iframeReady) {
              // Retry setup
            }
          }, 100);
        }
      }, 50);
      return () => clearInterval(checkReady);
    }

    const dragElement = dragElementRef.current;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let dropTarget: Element | null = null;

    // Make drag element draggable
    const handleDragStart = (e: MouseEvent) => {
      e.preventDefault();
      isDragging = true;
      
      const rect = dragElement.getBoundingClientRect();
      const iframeRect = previewIframeRef!.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      // Add dragging class
      dragElement.style.opacity = '0.5';
      dragElement.style.cursor = 'grabbing';

      // Add dropzone class to iframe body
      iframeBody.classList.add('dropzone-active');
    };

    const handleDrag = (e: MouseEvent) => {
      if (!isDragging) return;

      // Update drag element position
      const iframeRect = previewIframeRef!.getBoundingClientRect();
      const x = e.clientX - iframeRect.left;
      const y = e.clientY - iframeRect.top;

      // Find element at drop position
      const elementAtPoint = iframeDoc.elementFromPoint(x, y);
      if (elementAtPoint && !elementAtPoint.classList.contains('preview-placement-element')) {
        dropTarget = elementAtPoint;
        
        // Remove previous preview
        removePreviewElement(iframeDoc);
        
        // Show preview at drop position
        const previewEl = insertPreviewElement(elementAtPoint, iframeDoc);
        if (previewEl) {
          previewElementRef.current = previewEl;
        }
      }
    };

    const handleDragEnd = (e: MouseEvent) => {
      if (!isDragging) return;
      
      isDragging = false;
      dragElement.style.opacity = '1';
      dragElement.style.cursor = 'grab';
      iframeBody.classList.remove('dropzone-active');

      if (dropTarget && previewElementRef.current) {
        const rect = previewElementRef.current.getBoundingClientRect();
        const iframeRect = previewIframeRef!.getBoundingClientRect();
        const x = rect.left - iframeRect.left;
        const y = rect.top - iframeRect.top;
        
        setSelectedPosition({ x, y, element: dropTarget });
      }
    };

    // Attach drag handlers to drag element
    dragElement.addEventListener('mousedown', handleDragStart);
    iframeDoc.addEventListener('mousemove', handleDrag);
    iframeDoc.addEventListener('mouseup', handleDragEnd);

    // Cleanup
    return () => {
      dragElement.removeEventListener('mousedown', handleDragStart);
      iframeDoc.removeEventListener('mousemove', handleDrag);
      iframeDoc.removeEventListener('mouseup', handleDragEnd);
      if (iframeDoc) {
        removePreviewElement(iframeDoc);
      }
    };
  }, [open, previewIframeRef, iframeReady, removePreviewElement]);

  // Insert preview element showing how it will look
  const insertPreviewElement = useCallback((clickedElement: Element, doc: Document): HTMLElement | null => {
    if (!previewIframeRef) return null;

    if (isClaim) {
      // For claims, create a span element
      const previewEl = doc.createElement("span");
      previewEl.className = "preview-placement-element";
      previewEl.textContent = text;
      previewEl.style.cssText = `
        display: inline-block;
        color: #1890ff;
        font-weight: 500;
        padding: 4px;
        border-radius: 4px 4px 0 0;
        margin: 4px 0;
        background-color: rgba(24, 144, 255, 0.1);
        border: 2px dashed #1890ff;
        opacity: 0.9;
        position: relative;
        z-index: 1000;
      `;

      // Use insertAdjacentElement for reliable positioning
      const referenceElement = clickedElement as HTMLElement;
      if (referenceElement && referenceElement.insertAdjacentElement) {
        referenceElement.insertAdjacentElement('afterend', previewEl);
      } else if (referenceElement && referenceElement.parentNode) {
        const parent = referenceElement.parentNode;
        const nextSibling = referenceElement.nextSibling;
        if (nextSibling) {
          parent.insertBefore(previewEl, nextSibling);
        } else {
          parent.appendChild(previewEl);
        }
      } else {
        doc.body.appendChild(previewEl);
      }

      previewEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return previewEl;
    } else {
      // For nonclaims, create a list item in a UL
      let targetUL: HTMLUListElement | null = null;
      let current: Element | null = clickedElement;
      
      while (current && current !== doc.body) {
        if (current.tagName === "UL") {
          targetUL = current as HTMLUListElement;
          break;
        }
        current = current.parentElement;
      }

      if (!targetUL) {
        targetUL = doc.createElement("ul");
        targetUL.style.cssText = `
          margin: 12px 0;
          padding-left: 24px;
          list-style-type: disc;
        `;

        const referenceElement = clickedElement as HTMLElement;
        if (referenceElement && referenceElement.insertAdjacentElement) {
          referenceElement.insertAdjacentElement('afterend', targetUL);
        } else if (referenceElement && referenceElement.parentNode) {
          const parent = referenceElement.parentNode;
          const nextSibling = referenceElement.nextSibling;
          if (nextSibling) {
            parent.insertBefore(targetUL, nextSibling);
          } else {
            parent.appendChild(targetUL);
          }
        } else {
          doc.body.appendChild(targetUL);
        }
      }

      const listItem = doc.createElement("li");
      listItem.className = "preview-placement-element";
      listItem.textContent = text;
      listItem.style.cssText = `
        color: #52c41a;
        font-weight: 500;
        padding: 4px;
        margin: 2px 0;
        background-color: rgba(82, 196, 26, 0.1);
        border: 2px dashed #52c41a;
        opacity: 0.9;
        position: relative;
        z-index: 1000;
      `;

      targetUL.appendChild(listItem);
      listItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return listItem;
    }
  }, [previewIframeRef, text, isClaim]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIframeReady(false);
      setSelectedPosition(null);
      if (previewIframeRef?.contentDocument) {
        removePreviewElement(previewIframeRef.contentDocument);
      }
    }
  }, [open, previewIframeRef, removePreviewElement]);

  // Handle confirm
  const handleConfirm = () => {
    if (selectedPosition) {
      onConfirm(selectedPosition);
      setSelectedPosition(null);
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedPosition(null);
    if (previewIframeRef?.contentDocument) {
      removePreviewElement(previewIframeRef.contentDocument);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="90vw"
      styles={{
        body: {
          padding: "0",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        },
        header: {
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px",
        },
      }}
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
      }}
      title={
        <Space>
          <Move size={20} style={{ color: isClaim ? "#1890ff" : "#52c41a" }} />
          <Text strong style={{ fontSize: "16px" }}>
            Place {isClaim ? "Claim" : "Nonclaim"} Statement
          </Text>
        </Space>
      }
      closeIcon={<X size={18} />}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Instructions */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Alert
            message={
              <Space>
                <Info size={16} />
                <Text>
                  {isClaim
                    ? "Drag the claim statement below and drop it anywhere in the preview. A preview will show how it will look."
                    : "Drag the nonclaim statement below and drop it anywhere in the preview. It will be added as a bullet point. A preview will show how it will look."}
                </Text>
              </Space>
            }
            type="info"
            showIcon={false}
            style={{
              backgroundColor: "#e6f7ff",
              border: "1px solid #91d5ff",
            }}
          />
        </div>

        {/* Draggable Text Element */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
          }}
        >
          <div
            ref={dragElementRef}
            draggable={false}
            style={{
              padding: "12px 16px",
              backgroundColor: isClaim ? "#e6f7ff" : "#f6ffed",
              border: `2px solid ${isClaim ? "#1890ff" : "#52c41a"}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.3s ease",
              cursor: "grab",
              userSelect: "none",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            <Move size={20} style={{ color: isClaim ? "#1890ff" : "#52c41a" }} />
            <Text
              strong
              style={{
                color: isClaim ? "#1890ff" : "#52c41a",
                fontSize: "14px",
              }}
            >
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: "12px", marginLeft: "auto" }}>
              Drag me →
            </Text>
          </div>
        </div>

        {/* Preview iframe */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <iframe
            ref={(el) => {
              if (el) {
                setPreviewIframeRef(el);
              }
            }}
            srcDoc={iframeContent}
            onLoad={handleIframeLoad}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "#ffffff",
            }}
            title="Placement Preview"
          />
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {selectedPosition
              ? "Position selected. Click Confirm to place the statement."
              : "Drag the statement above and drop it in the preview to select a position."}
          </Text>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              icon={<Check size={16} />}
              onClick={handleConfirm}
              disabled={!selectedPosition}
              style={{
                backgroundColor: selectedPosition ? (isClaim ? "#1890ff" : "#52c41a") : "#d9d9d9",
                borderColor: selectedPosition ? (isClaim ? "#1890ff" : "#52c41a") : "#d9d9d9",
                transition: "all 0.3s ease",
              }}
            >
              Confirm Placement
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

