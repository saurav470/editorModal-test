/**
 * Utility functions for iframe manipulation and content management
 * 
 * This file contains helper functions for:
 * - Highlighting and scrolling to elements in the iframe
 * - Updating iframe content
 * - Managing HTML content with nonclaim/claim IDs
 * - Injecting custom styles into the iframe
 */

import { html_id_mapping, SELECTED_ELEMENT_CLASS, SELECTED_CLAIM_CLASS } from "../constants";
import type { NonclaimItem } from "../types";

/**
 * Clears all selected/highlighted asset fields from the iframe
 * Removes the highlight CSS classes from all elements
 * 
 * @param iframeRef - Reference to the iframe element
 */
export const clearSelectedAssetFieldsFromIframe = (iframeRef: React.RefObject<HTMLIFrameElement>): void => {
  if (!iframeRef.current) return;

  try {
    const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDocument) return;

    const previouslySelected = iframeDocument.querySelectorAll(`.${SELECTED_ELEMENT_CLASS}`);
    previouslySelected.forEach(el => {
      el.classList.remove(SELECTED_ELEMENT_CLASS);
    });

    const previouslySelectedDash = iframeDocument.querySelectorAll(`.${SELECTED_CLAIM_CLASS}`);
    previouslySelectedDash.forEach(el => {
      el.classList.remove(SELECTED_CLAIM_CLASS);
    });
  } catch (error) {
    console.error('Error cleaning up iframe styles:', error);
  }
}


/**
 * Scrolls to and highlights a specific element in the iframe
 * 
 * @param iframe - The iframe element
 * @param selectedfieldHtmlId - HTML ID of the element to highlight
 */
export const iframeScrollAndHighlight = (iframe: HTMLIFrameElement, selectedfieldHtmlId: string): void => {
  console.log("iframeScrollAndHighlight called with:", { selectedfieldHtmlId });
  if (selectedfieldHtmlId === "nonclaim_container") {
    return
  }
  console.log("Proceeding to highlight and scroll to:", selectedfieldHtmlId);
  try {
    // Access the iframe's document
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDocument) {
      // First, remove the class from any previously selected elements
      const previouslySelected = iframeDocument.querySelectorAll('.selected_cn_asset_feild');
      previouslySelected.forEach(el => {
        el.classList.remove('selected_cn_asset_feild');
      });

      const previouslySelectedDash = iframeDocument.querySelectorAll('.selected_cn_asset_feild_exlude_button_dash');
      previouslySelectedDash.forEach(el => {
        el.classList.remove('selected_cn_asset_feild_exlude_button_dash');
      });

      // Find the element with the given ID
      const element = iframeDocument.getElementById(selectedfieldHtmlId);
      console.log("Element found in iframe:", element);

      if (element) {
        // Add the selected class to highlight the element
        selectedfieldHtmlId.toLowerCase().startsWith('claim_')
          ? element.classList.add(SELECTED_CLAIM_CLASS)
          : element.classList.add(SELECTED_ELEMENT_CLASS);

        // Scroll the element into view with smooth behavior
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      } else {
        // If element not found, try to find by data attribute for nonclaim items
        if (selectedfieldHtmlId.startsWith('nonclaim_')) {
          const nonclaimId = selectedfieldHtmlId.replace('nonclaim_', '');
          console.log("Looking for nonclaim element with ID:", nonclaimId);
          const nonclaimElement = iframeDocument.querySelector(`[data-nonclaim-id="${nonclaimId}"]`);

          if (nonclaimElement) {
            nonclaimElement.classList.add(SELECTED_ELEMENT_CLASS);
            nonclaimElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling iframe element:', error);
  }
};

/**
 * Scrolls to a specific element in the iframe without highlighting
 * 
 * @param iframe - The iframe element
 * @param selectedfieldHtmlId - HTML ID of the element to scroll to
 */
export const iframeScroll = (iframe: HTMLIFrameElement, selectedfieldHtmlId: string): void => {
  try {
    // Access the iframe's document
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument) {
      // Find the element with the given ID
      const element = iframeDocument.getElementById(selectedfieldHtmlId);
      if (element) {
        // Scroll the element into view with smooth behavior
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  } catch (error) {
    console.error('Error handling iframe element:', error);
  }
};

/**
 * Removes all highlights from the iframe
 * 
 * @param iframe - The iframe element
 */
export const removeHighlight = (iframe: HTMLIFrameElement): void => {
  try {
    // Access the iframe's document
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument) {
      // Find all elements that have the highlight class and remove it
      const highlightedElements = iframeDocument.querySelectorAll(`.${SELECTED_ELEMENT_CLASS}`);
      highlightedElements.forEach(el => {
        el.classList.remove(SELECTED_ELEMENT_CLASS);
      });
      const highlightedElementsDash = iframeDocument.querySelectorAll(`.${SELECTED_CLAIM_CLASS}`);
      highlightedElementsDash.forEach(el => {
        el.classList.remove(SELECTED_CLAIM_CLASS);
      });
    }
  } catch (error) {
    console.error('Error removing highlight from iframe element:', error);
  }
};


/**
 * Injects custom CSS styles into the iframe
 * Adds highlight styles for selected elements
 * 
 * @param iframe - The iframe element
 */
export const injectIframeCustomStyles = (iframe: HTMLIFrameElement): void => {
  try {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument && !iframeDocument.getElementById('custom-styles')) {
      const styleEl = iframeDocument.createElement('style');
      styleEl.id = 'custom-styles';
      styleEl.textContent = `
        .${SELECTED_ELEMENT_CLASS} {
          border: 1px dashed #ffd1b3 !important;
          border-radius: 5px !important;
          padding: 10px !important;
        }
        .${SELECTED_CLAIM_CLASS} {
          border-top: 1px dashed #ffd1b3 !important;
          border-left: 1px dashed #ffd1b3 !important;
          border-right: 1px dashed #ffd1b3 !important;
          border-radius: 5px !important;
          padding: 10px !important;
        }
      `;
      iframeDocument.head.appendChild(styleEl);
    }
  } catch (error) {
    console.error('Error adding styles to iframe:', error);
  }
};

/**
 * Updates the content of a specific field in the iframe
 * 
 * @param values - The new text value to set
 * @param field - The field identifier
 * @param iframeRef - Reference to the iframe element
 */
export const updateIframeContent = (values: string, field: string, iframeRef: React.RefObject<HTMLIFrameElement>): void => {
  console.log("updateIframeContent called with:", { field, values });
  let htmlid = field;
  if (!field.startsWith('nonclaim_') && !field.startsWith('claim_')) {
    console.log("updateIframeContent htmlid before", htmlid)
    htmlid = html_id_mapping[field.toLowerCase() as keyof typeof html_id_mapping]
    console.log("updateIframeContent htmlid after", htmlid)
  }
  if (!iframeRef.current || !iframeRef.current.contentDocument) return

  const doc = iframeRef.current.contentDocument

  if (values) {
    const Element = doc.getElementById(htmlid);
    console.log("updateIframeContent Element found in iframe:", Element, htmlid, field);
    if (Element) {
      Element.textContent = values
    }

  }
}

/**
 * Updates an image URL in the iframe with loading animation
 * 
 * @param values - The new image URL
 * @param field - The field identifier
 * @param iframeRef - Reference to the iframe element
 */
export const updateIframeImageUrl = (
  values: string,
  field: string,
  iframeRef: React.RefObject<HTMLIFrameElement>
): void => {
  const htmlid = html_id_mapping[field.toLowerCase() as keyof typeof html_id_mapping];
  if (!iframeRef.current || !iframeRef.current.contentDocument) return;

  const doc = iframeRef.current.contentDocument;
  const containerElement = doc.getElementById(htmlid);

  if (values && containerElement) {
    const imageElement = containerElement.querySelector('img');
    if (imageElement) {
      // Inline loader creation
      const loadingOverlay = doc.createElement('div');
      loadingOverlay.innerHTML = `
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        ">
          <div style="
            width: 24px;
            height: 24px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #1890ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
        </div>
      `;

      // Add spinner animation
      if (!doc.head.querySelector('style[data-spinner]')) {
        const style = doc.createElement('style');
        style.setAttribute('data-spinner', 'true');
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        doc.head.appendChild(style);
      }

      containerElement.style.position = 'relative';
      containerElement.appendChild(loadingOverlay);

      const handleLoad = () => {
        containerElement.removeChild(loadingOverlay);
        imageElement.removeEventListener('load', handleLoad);
        imageElement.removeEventListener('error', handleError);
      };

      const handleError = () => {
        containerElement.removeChild(loadingOverlay);
        imageElement.removeEventListener('load', handleLoad);
        imageElement.removeEventListener('error', handleError);
      };

      imageElement.addEventListener('load', handleLoad);
      imageElement.addEventListener('error', handleError);
      imageElement.src = values; // Only ONE request!
    }
  }
};


/**
 * Updates the HTML content for a specific field
 * Parses HTML, updates the field, and returns the modified HTML
 * 
 * @param htmlContent - The complete HTML string
 * @param field - The field identifier
 * @param value - The new value for the field
 * @returns Updated HTML string
 */
export const updateHtmlContent = (htmlContent: string, field: string, value: string): string => {
  console.log("updateHtmlContent called with:", { field, value });

  // Create a DOM parser to work with the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // Handle dynamic claim/nonclaim fields
  if (field.startsWith("nonclaim_") || field.startsWith("claim_")) {
    const [prefix, idPart] = field.split("_");
    const dataAttr = prefix === "nonclaim" ? "data-nonclaim-id" : "data-claim-id";
    console.log("updateHtmlContent dataAttr", dataAttr, idPart);

    try {
      // Try locating element using data attribute first
      let target = doc.querySelector(`[${dataAttr}="${idPart}"]`);
      console.log("updateHtmlContent Target found using data attribute:", target);

      // Fallback to element with id (like claim_12 or nonclaim_7)
      if (!target) {
        target = doc.getElementById(field);
        console.log("updateHtmlContent Fallback to getElementById:", target);
      }

      if (target) {
        target.textContent = value || "";
        console.log(`updateHtmlContent: Updated`, target);
      } else {
        console.warn(`updateHtmlContent: element for ${field} not found`);
      }
    } catch (err) {
      console.error(`Error updating ${prefix} element in HTML:`, err);
    }
  } else {
    // Handle standard mapped fields
    const htmlid = html_id_mapping[field.toLowerCase() as keyof typeof html_id_mapping];
    if (htmlid) {
      const element = doc.getElementById(htmlid);
      if (element) {
        element.textContent = value || "";
      } else {
        console.warn(`updateHtmlContent: element with id ${htmlid} not found`);
      }
    } else {
      console.warn(`updateHtmlContent: No html_id_mapping found for ${field}`);
    }
  }

  // Return the updated HTML as a string
  return doc.documentElement.outerHTML;
};



/**
 * Updates an image source in the HTML
 * 
 * @param htmlContent - The complete HTML string
 * @param field - The field identifier
 * @param imageUrl - The new image URL
 * @returns Updated HTML string
 */
export const updateHtmlImage = (htmlContent: string, field: string, imageUrl: string): string => {
  const htmlid = html_id_mapping[field.toLowerCase() as keyof typeof html_id_mapping];

  // Create a DOM parser to work with the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Find the container element
  const containerElement = doc.getElementById(htmlid);

  if (imageUrl && containerElement) {
    // Find the image inside the container
    const imageElement = containerElement.querySelector('img');
    if (imageElement) {
      imageElement.src = imageUrl;
    }
  }

  // Return the updated HTML as a string
  return doc.documentElement.outerHTML;
}


/**
 * Attaches nonclaim IDs to elements in the HTML
 * 
 * Note: Nonclaims now have IDs in HTML from backend, same as claims
 * This function just ensures the IDs and attributes are set correctly
 * 
 * @param htmlContent - The complete HTML string
 * @param nonclaimItems - Array of nonclaim items with IDs
 * @returns Updated HTML string with attached IDs
 */
export const attachNonclaimIdsToHtml = (
  htmlContent: string,
  nonclaimItems: NonclaimItem[]
): string => {
  if (!htmlContent || !nonclaimItems || nonclaimItems.length === 0) return htmlContent;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  nonclaimItems.forEach((item) => {
    // Find element by ID or data attribute (IDs are already in HTML from backend)
    const element = doc.getElementById(`nonclaim_${item.id}`) ||
      doc.querySelector(`[data-nonclaim-id="${item.id}"]`);

    if (element) {
      element.id = `nonclaim_${item.id}`;
      element.setAttribute('data-nonclaim-id', String(item.id));

      const el = element as HTMLElement;
      el.style.cursor = 'pointer';
      el.style.border = '1px solid transparent';
      el.style.padding = '4px';
      el.style.borderRadius = '4px';
    }
  });

  return doc.documentElement.outerHTML;
};


/**
 * Attaches nonclaim IDs to elements in a parsed Document object
 * Modifies the Document in-place by adding ID and data attributes
 * 
 * Note: Nonclaims now have IDs in HTML from backend, same as claims
 * This function just ensures the IDs and attributes are set correctly
 * 
 * @param doc - Parsed Document object
 * @param nonclaimItems - Array of nonclaim items with IDs
 */
export const attachNonclaimIdsToDoc = (doc: Document, nonclaimItems?: NonclaimItem[]): void => {
  if (!nonclaimItems || nonclaimItems.length === 0) return;

  nonclaimItems.forEach((item) => {
    // Find element by ID or data attribute (IDs are already in HTML from backend)
    const element = doc.getElementById(`nonclaim_${item.id}`) ||
      doc.querySelector(`[data-nonclaim-id="${item.id}"]`);

    if (element) {
      element.id = `nonclaim_${item.id}`;
      element.setAttribute('data-nonclaim-id', item.id.toString());
      const htmlElement = element as HTMLElement;
      htmlElement.style.cursor = 'pointer';
      htmlElement.style.border = '1px solid transparent';
      htmlElement.style.padding = '4px';
      htmlElement.style.borderRadius = '4px';
    }
  });
};

/**
 * Attaches claim IDs to elements in a parsed Document object
 * Modifies the Document in-place by adding ID and data attributes
 * 
 * @param doc - Parsed Document object
 * @param claimItems - Array of claim items with IDs
 */
export const attachClaimIdsToDoc = (
  doc: Document,
  claimItems?: Array<{ id: number; text: string }>
): void => {
  if (!claimItems || claimItems.length === 0) return;

  claimItems.forEach((item) => {
    const element = doc.getElementById(`claim_${item.id}`) ||
      doc.querySelector(`[data-claim-id="${item.id}"]`);

    if (element) {
      element.id = `claim_${item.id}`;
      element.setAttribute('data-claim-id', item.id.toString());
      const htmlElement = element as HTMLElement;
      htmlElement.style.cursor = 'pointer';
      htmlElement.style.padding = '4px';
      htmlElement.style.borderRadius = '4px 4px 0 0';
    }
  });
};

/**
 * Prepares HTML content with attached nonclaim and claim IDs
 * Parses the HTML, ensures IDs are set correctly, and returns the modified HTML string
 * 
 * Note: IDs are already in HTML from backend for both nonclaims and claims
 * This function just ensures the IDs and attributes are set correctly
 * 
 * @param htmlContent - The complete HTML string
 * @param nonclaimItems - Array of nonclaim items with IDs
 * @param claimItems - Array of claim items with IDs
 * @returns HTML string with IDs ensured
 */
export const prepareHtmlWithIds = (
  htmlContent: string,
  nonclaimItems?: NonclaimItem[],
  claimItems?: Array<{ id: number; text: string }>
): string => {
  if (!htmlContent) return htmlContent;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Ensure both nonclaim and claim IDs are set correctly (IDs already in HTML from backend)
  attachNonclaimIdsToDoc(doc, nonclaimItems);
  attachClaimIdsToDoc(doc, claimItems);

  return doc.documentElement.outerHTML;
};