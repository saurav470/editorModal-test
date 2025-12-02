/**
 * Custom hook for managing iframe content updates
 * 
 * This hook handles:
 * - Initializing iframe content with nonclaim/claim IDs
 * - Processing HTML content to attach IDs
 * - Updating iframe srcdoc when content changes
 */

import { useState, useEffect, useRef } from "react";
import { scrollBarStyles } from "../constants";
import { attachNonclaimIdsToDoc } from "../utils";
import type { NonclaimItem } from "../types";

interface UseIframeContentProps {
  /** Initial HTML content for the iframe */
  iframeInitContent: string;
  /** Reference to the iframe element */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Array of nonclaim items */
  nonclaimData: NonclaimItem[];
  /** Whether the modal is open */
  open: boolean;
}

interface UseIframeContentReturn {
  /** Current iframe HTML content */
  iframeContent: string;
  /** Function to update iframe content */
  setIframeContent: (content: string) => void;
  /** Loading state */
  iframeLoading: boolean;
  /** Function to set loading state */
  setIframeLoading: (loading: boolean) => void;
}

/**
 * Manages iframe content initialization and updates
 * Processes HTML to attach nonclaim/claim IDs on mount
 * 
 * @param props - Hook configuration
 * @returns Iframe content state and setters
 * 
 * @example
 * ```tsx
 * const { iframeContent, setIframeContent, iframeLoading, setIframeLoading } = useIframeContent({
 *   iframeInitContent,
 *   iframeRef,
 *   nonclaimData,
 *   open
 * });
 * ```
 */
export const useIframeContent = ({
  iframeInitContent,
  iframeRef,
  nonclaimData,
  open
}: UseIframeContentProps): UseIframeContentReturn => {
  const [iframeContent, setIframeContent] = useState(iframeInitContent);
  const [iframeLoading, setIframeLoading] = useState(false);

  // Set loading state on mount
  useEffect(() => {
    setIframeLoading(true);
  }, []);

  // Initialize iframe content ONCE on mount
  // Note: Nonclaim IDs are already in HTML from backend, same as claims
  // IMPORTANT: Do NOT watch nonclaimData here - that causes full iframe reloads on every edit!
  // CRITICAL: This effect should ONLY run when iframeInitContent changes (initial load),
  // NOT when iframeContent is updated from GrapesJS or other sources
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip if this is not the initial mount and iframeContent has been manually set
    // This prevents overwriting GrapesJS edits
    if (!isInitialMount.current && iframeContent && iframeContent !== iframeInitContent) {
      console.log('useIframeContent - Skipping reset, iframeContent was manually updated');
      return;
    }

    if (!iframeInitContent) return;

    // IDs are already in HTML from backend, so we can use the content directly
    // The attachNonclaimIdsToDoc function now just ensures IDs and attributes are set (finds by ID, no text matching)
    if (nonclaimData && nonclaimData.length > 0) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(iframeInitContent, 'text/html');
        // This now just ensures IDs and attributes are set (finds by ID, no text matching)
        attachNonclaimIdsToDoc(doc, nonclaimData);
        const processed = doc.documentElement.outerHTML;
        // Only update state if different to avoid extra renders
        if (processed !== iframeContent) {
          console.log('useIframeContent - Setting initial processed content');
          setIframeContent(processed);
        }
      } catch (err) {
        console.error('Error processing initial iframe content', err);
        // Fallback: keep original content
        if (iframeInitContent !== iframeContent) setIframeContent(iframeInitContent);
      }
    } else {
      // No nonclaim items — ensure state contains the raw initial content
      if (iframeInitContent !== iframeContent) {
        console.log('useIframeContent - Setting initial content (no nonclaim)');
        setIframeContent(iframeInitContent);
      }
    }

    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeInitContent]); // Only watch iframeInitContent, NOT nonclaimData!

  // Update iframe srcdoc when content or state changes
  useEffect(() => {
    if (iframeContent && iframeRef.current) {
      console.log('useIframeContent - Updating srcdoc, content length:', iframeContent.length);
      iframeRef.current.srcdoc = scrollBarStyles + iframeContent;
    }
  }, [iframeContent, iframeRef]);

  // Update iframe when modal opens
  useEffect(() => {
    if (iframeRef.current && open) {
      iframeRef.current.srcdoc = scrollBarStyles + iframeContent;
    }
  }, [open, iframeContent, iframeRef]);

  return {
    iframeContent,
    setIframeContent,
    iframeLoading,
    setIframeLoading
  };
};

