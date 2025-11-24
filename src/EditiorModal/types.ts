/**
 * Type definitions for the Editor Modal component
 * 
 * This file contains all TypeScript interfaces and types used throughout the editor.
 * Organized by domain for better maintainability.
 */

import type { SSE } from "sse.js";
import type { FormInstance } from "antd";

// ============================================================================
// DOMAIN: Content Types
// ============================================================================

/**
 * Represents a non-claim item (supporting text) in the email
 * Note: Backend now provides IDs in HTML, same as claims
 */
export interface NonclaimItem {
  /** Unique identifier for the non-claim item */
  id: number;
  /** The actual text content of the non-claim */
  text: string;
}

/**
 * Represents a claim statement in the email
 * Note: Claims come with IDs pre-attached from the backend
 */
export interface ClaimItem {
  /** Unique identifier for the claim (provided by backend) */
  id: number;
  /** The claim statement text */
  text: string;
}

/**
 * Represents an image in the email template
 */
export interface ImageType {
  /** Unique identifier for the image */
  id: number;
  /** URL or path to the image */
  url: string;
  /** Optional alt text for accessibility */
  alt?: string;
}

/**
 * Main data structure for the editor content
 */
export interface EditorData {
  /** Email subject line */
  subject: string;
  /** Email preheader text (preview text) */
  preheader: string;
  /** Email introduction/opening text */
  intro: string;
  /** Email closing text */
  closing: string;
  /** Array of non-claim items (optional) */
  nonclaim?: NonclaimItem[];
  /** Array of claim items (optional) */
  claim?: ClaimItem[];
}

// ============================================================================
// DOMAIN: Regeneration & Versioning
// ============================================================================

/**
 * Represents a single version of regenerated content
 */
export interface Version {
  /** Unique version identifier */
  id: number;
  /** Field name that was regenerated */
  field: string;
  /** The prompt used to generate this version */
  prompt: string;
  /** The generated content */
  data: string;
  /** ISO timestamp of when this version was created */
  created_at: string;
}

/**
 * State for the regenerate modal
 */
export interface RegenerateModalState {
  /** Whether the modal is open */
  open: boolean;
  /** The field being regenerated */
  field: string;
  /** Path to the field in the form (for Ant Design Form) */
  fieldPath: (string | number)[];
}

// ============================================================================
// DOMAIN: API Functions
// ============================================================================

/**
 * Request body for saving asset data
 */
export interface SaveAssetRequest {
  /** The complete HTML content */
  asset_data: string;
  /** Email subject */
  subject: string;
  /** Email preheader */
  preheader: string;
  /** Opening/introduction text */
  opening: string;
  /** Closing text */
  closing: string;
  /** Non-claim items (optional) */
  nonclaim?: NonclaimItem[];
  /** Claim items (optional) */
  claim?: ClaimItem[];
}

/**
 * Request body for applying a regenerated version
 */
export interface ApplyRegenerationRequest {
  /** Field name being applied */
  field: string;
  /** Version ID to apply */
  id: number;
  /** Order ID for tracking */
  order_id: number;
}

/**
 * Request body for applying regenerated non-claim
 */
export interface ApplyNonClaimRequest extends ApplyRegenerationRequest {
  /** The specific non-claim ID */
  orderednonclaim_id: number;
}

/**
 * Request body for applying regenerated claim
 */
export interface ApplyClaimRequest extends ApplyRegenerationRequest {
  /** The specific claim ID */
  orderedclaim_id: number;
}

/**
 * Request body for regenerating content
 */
export interface RegenerationRequest {
  /** Field to regenerate */
  field: string;
  /** User's prompt for regeneration */
  prompt: string;
}

/**
 * Request body for regenerating non-claim content
 */
export interface RegenerateNonClaimRequest extends RegenerationRequest {
  /** Specific non-claim item ID */
  nonclaim_id: number;
}

/**
 * Request body for regenerating claim content
 */
export interface RegenerateClaimRequest extends RegenerationRequest {
  /** Specific claim item ID */
  claim_id: number;
}

/**
 * Response from regeneration APIs
 */
export interface RegenerationResponse {
  data: {
    /** Array of generated versions */
    versions: Version[];
  };
}

/**
 * Prompt suggestion item
 */
export interface PromptSuggestion {
  /** The suggested prompt text */
  prompt: string;
}

/**
 * Response from prompt suggestion API
 */
export interface PromptSuggestionsResponse {
  data: {
    /** Array of prompt suggestions */
    suggestions: PromptSuggestion[];
  };
}

/**
 * Complete API interface for the editor
 * All API functions are properly typed with their request/response types
 */
export interface EditorAPIs {
  /**
   * Save the complete asset data
   * @param assetId - The asset ID
   * @param body - The asset data to save
   * @returns Promise resolving to the API response
   */
  saveApi: (assetId: number, body: SaveAssetRequest) => Promise<any>;

  /**
   * Apply a regenerated version to a field
   * @param assetId - The asset ID
   * @param body - Apply request details
   * @returns Promise resolving to the API response
   */
  applyRegeneration: (assetId: number, body: ApplyRegenerationRequest) => Promise<any>;

  /**
   * Apply regenerated non-claim content
   * @param assetId - The asset ID
   * @param body - Non-claim apply request details
   * @returns Promise resolving to the API response
   */
  applyRegeneratedNonClaim: (assetId: number, body: ApplyNonClaimRequest) => Promise<any>;

  /**
   * Apply regenerated claim content
   * @param assetId - The asset ID
   * @param body - Claim apply request details
   * @returns Promise resolving to the API response
   */
  applyRegeneratedClaim: (assetId: number, body: ApplyClaimRequest) => Promise<any>;

  /**
   * Regenerate content for a field
   * @param assetId - The asset ID
   * @param body - Regeneration request details
   * @returns Promise resolving to regeneration response with versions
   */
  regeneration: (assetId: number, body: RegenerationRequest) => Promise<RegenerationResponse>;

  /**
   * Regenerate non-claim content
   * @param assetId - The asset ID
   * @param body - Non-claim regeneration request
   * @returns Promise resolving to regeneration response with versions
   */
  regenerationNonClaim: (assetId: number, body: RegenerateNonClaimRequest) => Promise<RegenerationResponse>;

  /**
   * Regenerate claim content
   * @param assetId - The asset ID
   * @param body - Claim regeneration request
   * @returns Promise resolving to regeneration response with versions
   */
  regenerationClaim: (assetId: number, body: RegenerateClaimRequest) => Promise<RegenerationResponse>;

  /**
   * Regenerate hero image using Server-Sent Events (SSE)
   * @param assetId - The asset ID
   * @param body - Image regeneration request
   * @returns SSE instance for streaming image generation
   */
  regenerationHeroImage: (assetId: number, body: RegenerationRequest) => SSE;

  /**
   * Get prompt suggestions for a specific field
   * @param field - The field name to get suggestions for
   * @returns Promise resolving to prompt suggestions
   */
  propmtSuggestion: (field: string) => Promise<PromptSuggestionsResponse>;

  /**
   * Get regeneration history for a specific field
   * @param assetId - The asset ID
   * @param body - Regeneration history request details
   * @returns Promise resolving to regeneration history
   */
  getRegenerationHistory: (assetId: number, body: { field: string; claim_nonclaim_id?: number }) => Promise<any>;
}

// ============================================================================
// DOMAIN: Component Props
// ============================================================================

/**
 * Props for the main EditorModal component
 */
export interface EditorModalProps {
  /** The content data to edit */
  data: EditorData;
  /** Hero image URL */
  hero_image: string;
  /** Whether the modal is open */
  open: boolean;
  /** Function to control modal visibility */
  setOpen: (open: boolean) => void;
  /** Asset ID for API calls */
  id: number;
  /** 
   * Callback when asset is updated
   * @param html - The updated HTML content
   * @param data - The updated data object
   */
  setAsset: ((html: string, data: any) => void) | null;
  /** Title for the editor modal */
  editTitle: string;
  /** Initial HTML content for the iframe */
  iframeInitContent: string;
  /** Current market/locale (optional) */
  currentMarket?: string;
  /** API functions for backend communication */
  apis: EditorAPIs;
  /** 
   * Callback when images are changed
   * @param updatedImages - Array of updated images
   */
  handleImagesChange?: (updatedImages: ImageType[]) => void;
  /** 
   * Callback when non-claims are changed
   * @param updatedNonClaims - Array of updated non-claims
   */
  handleNonClaimsChange?: (updatedNonClaims: NonclaimItem[]) => void;
}

/**
 * Props for the RegenerateModal component
 */
export interface RegenerateModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Original HTML content for comparison */
  originalHtml: string;
  /** Name of the field being regenerated */
  fieldName: string;
  /** 
   * Callback to apply the regenerated content
   * @param html - The new HTML content
   */
  onApply: (html: string) => void;
  /** 
   * Callback when version changes
   * @param data - Version change data
   */
  versionChange: (data: { version: number; id: number }) => void;
  /** Asset ID for API calls */
  asset_id: number;
  /** Initial data for the field (optional) */
  intialData?: string;
  /** 
   * Callback to set the regenerated response
   * @param response - The regenerated text
   */
  setRegenerateResponse: (response: string) => void;
  /** 
   * Callback to set the new HTML from prompt editor
   * @param html - The new HTML
   */
  setNewHtmlPromptEditorHtml: (html: string) => void;
  /** Currently active tab */
  activeTab: string;
  /** API functions */
  apis: EditorAPIs;
  /** 
   * Callback to set hero image
   * @param url - New image URL
   */
  setHeroImage: (url: string) => void;
}

/**
 * Props for the TextTab component
 */
export interface TextTabProps {
  /** 
   * Function to set regenerate modal state
   * @param state - The regenerate modal state
   */
  setRegenerateModal: (state: RegenerateModalState) => void;
  /** 
   * Function to set selected field
   * @param field - The selected field name
   */
  setSelectedfield: (field: string) => void;
  /** Array of non-claim items */
  nonclaimData: NonclaimItem[];
  /** 
   * Function to update non-claim data
   * @param data - Updated non-claim array
   */
  setNonclaimData: (data: NonclaimItem[]) => void;
  /** Ant Design form instance */
  form: FormInstance;
}

/**
 * Props for the ClaimTab component
 */
export interface ClaimTabProps {
  /** 
   * Function to set regenerate modal state
   * @param state - The regenerate modal state
   */
  setRegenerateModal: (state: RegenerateModalState) => void;
  /** 
   * Function to set selected field
   * @param field - The selected field name
   */
  setSelectedfield: (field: string) => void;
  /** Array of claim items */
  claimData: ClaimItem[];
  /** 
   * Function to update claim data
   * @param data - Updated claim array
   */
  setClaimData: (data: ClaimItem[]) => void;
  /** Ant Design form instance */
  form: FormInstance;
}

/**
 * Props for the NonclaimTab component
 */
export interface NonclaimTabProps {
  /** 
   * Function to set regenerate modal state
   * @param state - The regenerate modal state
   */
  setRegenerateModal: (state: RegenerateModalState) => void;
  /** 
   * Function to set selected field
   * @param field - The selected field name
   */
  setSelectedfield: (field: string) => void;
  /** Array of non-claim items */
  nonclaimData: NonclaimItem[];
  /** 
   * Function to update non-claim data
   * @param data - Updated non-claim array
   */
  setNonclaimData: (data: NonclaimItem[]) => void;
}

// ============================================================================
// DOMAIN: Mappings & Constants
// ============================================================================

/**
 * Valid keys for HTML ID mapping
 */
export type HtmlMappingKey =
  | "subject"
  | "preheader"
  | "closing"
  | "introduction"
  | "hero_image"
  | "nonclaim"
  | "claim";

/**
 * Valid keys for backend API field mapping
 */
export type BackendMappingKey =
  | "subject"
  | "preheader"
  | "introduction"
  | "closing"
  | "hero_image"
  | "nonclaim"
  | "claim";

// ============================================================================
// DOMAIN: Utility Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  success?: boolean;
  error?: string;
}

/**
 * Notification service type for messages
 */
export interface NotificationService {
  successMessage: (message: string) => void;
  errorMessage: (message: string) => void;
  warningMessage: (message: string) => void;
  infoMessage: (message: string) => void;
}

/**
 * Modified version data for tracking
 */
export interface ModifiedVersionData {
  id: number;
  version: number;
}

