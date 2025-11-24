/**
 * Custom hook for managing iframe element highlighting
 * 
 * This hook handles:
 * - Scrolling to selected elements
 * - Highlighting selected elements with visual styles
 * - Injecting custom CSS into the iframe
 * - Cleaning up highlights when selection changes
 */

import { useEffect } from "react";
import { html_id_mapping } from "../constants";
import {
  injectIframeCustomStyles,
  iframeScrollAndHighlight,
  clearSelectedAssetFieldsFromIframe
} from "../utils";

interface UseIframeHighlightProps {
  /** Reference to the iframe element */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Currently selected field identifier */
  selectedfield: string;
}

/**
 * Manages highlighting and scrolling to selected elements in the iframe
 * Automatically updates when selectedfield changes
 * 
 * @param props - Hook configuration
 * 
 * @example
 * ```tsx
 * const iframeRef = useRef<HTMLIFrameElement>(null);
 * const [selectedfield, setSelectedfield] = useState("");
 * 
 * useIframeHighlight({ iframeRef, selectedfield });
 * ```
 */
export const useIframeHighlight = ({ iframeRef, selectedfield }: UseIframeHighlightProps): void => {
  useEffect(() => {
    if (iframeRef.current && selectedfield) {
      let selectedfieldHtmlId: string;

      // Check if selectedfield is a nonclaim or claim field (case-insensitive)
      if (selectedfield.toLowerCase().startsWith('nonclaim_') ||
        selectedfield.toLowerCase().startsWith('claim_')) {
        selectedfieldHtmlId = selectedfield; // Use the field directly as it's already the HTML ID
      } else {
        selectedfieldHtmlId = html_id_mapping[selectedfield as keyof typeof html_id_mapping];
      }

      const iframe = iframeRef.current;

      // If iframe is already loaded
      if (iframe.contentDocument?.readyState === 'complete') {
        injectIframeCustomStyles(iframe);
        iframeScrollAndHighlight(iframe, selectedfieldHtmlId);
      } else {
        // Otherwise wait for it to load
        const onLoad = () => {
          injectIframeCustomStyles(iframe);
          iframeScrollAndHighlight(iframe, selectedfieldHtmlId);
        };
        iframe.addEventListener('load', onLoad);
        return () => iframe.removeEventListener('load', onLoad);
      }
    }

    // Cleanup function to remove the class when component unmounts or selectedfield changes
    return () => clearSelectedAssetFieldsFromIframe(iframeRef);
  }, [selectedfield, iframeRef]);
};

