/**
 * Custom hook for synchronizing nonclaim data with the iframe DOM
 * 
 * This hook handles:
 * - Updating text content when nonclaim data changes
 * - Adding visual styles to nonclaim elements
 * - Cleaning up stale nonclaim elements
 * 
 * Note: Nonclaims now have IDs in HTML from backend, same as claims
 */

import { useEffect } from "react";
import type { NonclaimItem } from "../types";

interface UseNonclaimSyncProps {
  /** Reference to the iframe element */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Array of nonclaim items to sync */
  nonclaimData: NonclaimItem[];
}

/**
 * Synchronizes nonclaim data with iframe DOM elements
 * Automatically updates when nonclaimData changes
 * 
 * @param props - Hook configuration
 * 
 * @example
 * ```tsx
 * const iframeRef = useRef<HTMLIFrameElement>(null);
 * const [nonclaimData, setNonclaimData] = useState<NonclaimItem[]>([]);
 * 
 * useNonclaimSync({ iframeRef, nonclaimData });
 * ```
 */
export const useNonclaimSync = ({ iframeRef, nonclaimData }: UseNonclaimSyncProps): void => {
  useEffect(() => {
    if (!iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Handle Nonclaim Sync - Nonclaims now have IDs from backend, same as claims
    if (nonclaimData && nonclaimData.length > 0) {
      try {
        nonclaimData.forEach(item => {
          // Try to find element by data attribute or id
          const byData = iframeDoc.querySelector(`[data-nonclaim-id="${item.id}"]`);
          const byId = iframeDoc.getElementById(`nonclaim_${item.id}`);
          const targetElement = (byData as Element) || (byId as Element);

          if (targetElement) {
            // Only update text if it's different to avoid unnecessary DOM mutations
            if (targetElement.textContent !== item.text) {
              targetElement.textContent = item.text;
            }

            // Ensure attributes are set
            (targetElement as HTMLElement).id = `nonclaim_${item.id}`;
            targetElement.setAttribute('data-nonclaim-id', item.id.toString());

            // Apply visual styles
            const htmlElement = targetElement as HTMLElement;
            htmlElement.style.cursor = 'pointer';
            htmlElement.style.border = '1px solid transparent';
            htmlElement.style.padding = '4px';
            htmlElement.style.borderRadius = '4px';
          }
        });

        // Remove stale nonclaim IDs that no longer exist in data
        const existingNonclaimElements = Array.from(iframeDoc.querySelectorAll('[id^="nonclaim_"]'));
        existingNonclaimElements.forEach(el => {
          const nonclaimId = el.id.replace('nonclaim_', '');
          const stillExists = nonclaimData.some(item => item.id.toString() === nonclaimId);
          if (!stillExists) {
            el.removeAttribute('id');
            el.removeAttribute('data-nonclaim-id');
            el.classList.remove('selected_cn_asset_feild');
          }
        });
      } catch (err) {
        console.error('Error syncing nonclaim data to iframe DOM', err);
      }
    } else {
      // If no nonclaimData, remove nonclaim IDs
      const existingNonclaimElements = iframeDoc.querySelectorAll('[id^="nonclaim_"]');
      existingNonclaimElements.forEach(el => {
        el.removeAttribute('id');
        el.removeAttribute('data-nonclaim-id');
        el.classList.remove('selected_cn_asset_feild');
      });
    }
  }, [nonclaimData, iframeRef]);
};

