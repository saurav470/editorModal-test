/**
 * Custom hook for synchronizing claim data with the iframe DOM
 * 
 * This hook handles:
 * - Ensuring claim IDs are set correctly (IDs already in HTML from backend)
 * - Updating text content when claim data changes
 * - Adding visual styles to claim elements
 * - Cleaning up stale claim elements
 */

import { useEffect } from "react";
import type { ClaimItem } from "../types";

interface UseClaimSyncProps {
  /** Reference to the iframe element */
  iframeRef: React.RefObject<HTMLIFrameElement>;
  /** Array of claim items to sync */
  claimData: ClaimItem[];
}

/**
 * Synchronizes claim data with iframe DOM elements
 * Automatically updates when claimData changes
 * 
 * @param props - Hook configuration
 * 
 * @example
 * ```tsx
 * const iframeRef = useRef<HTMLIFrameElement>(null);
 * const [claimData, setClaimData] = useState<ClaimItem[]>([]);
 * 
 * useClaimSync({ iframeRef, claimData });
 * ```
 */
export const useClaimSync = ({ iframeRef, claimData }: UseClaimSyncProps): void => {
  useEffect(() => {
    if (!iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Handle Claim Sync - Claims already have IDs from backend
    if (claimData && claimData.length > 0) {
      try {
        claimData.forEach(item => {
          // Try to find element by data attribute or id
          const byData = iframeDoc.querySelector(`[data-claim-id="${item.id}"]`);
          const byId = iframeDoc.getElementById(`claim_${item.id}`);
          const targetElement = (byData as Element) || (byId as Element);

          if (targetElement) {
            // Only update text if it's different to avoid unnecessary DOM mutations
            if (targetElement.textContent !== item.text) {
              targetElement.textContent = item.text;
            }

            // Ensure attributes are set
            (targetElement as HTMLElement).id = `claim_${item.id}`;
            targetElement.setAttribute('data-claim-id', item.id.toString());

            // Apply visual styles
            const htmlElement = targetElement as HTMLElement;
            htmlElement.style.cursor = 'pointer';
            htmlElement.style.padding = '4px';
            htmlElement.style.borderRadius = '4px 4px 0 0';
          }
        });

        // Remove stale claim IDs that no longer exist in data
        const existingClaimElements = Array.from(iframeDoc.querySelectorAll('[id^="claim_"]'));
        existingClaimElements.forEach(el => {
          const claimId = el.id.replace('claim_', '');
          const stillExists = claimData.some(item => item.id.toString() === claimId);
          if (!stillExists) {
            el.removeAttribute('id');
            el.removeAttribute('data-claim-id');
            el.classList.remove('selected_cn_asset_feild');
          }
        });
      } catch (err) {
        console.error('Error syncing claim data to iframe DOM', err);
      }
    } else {
      // If no claimData, remove claim IDs
      const existingClaimElements = iframeDoc.querySelectorAll('[id^="claim_"]');
      existingClaimElements.forEach(el => {
        el.removeAttribute('id');
        el.removeAttribute('data-claim-id');
        el.classList.remove('selected_cn_asset_feild');
      });
    }
  }, [claimData, iframeRef]);
};

