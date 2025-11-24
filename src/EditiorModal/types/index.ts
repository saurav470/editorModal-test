/**
 * Barrel export for all Editor Modal types
 * 
 * This file provides a single import point for all types used in the editor.
 * Usage: import { EditorModalProps, NonclaimItem } from './types';
 */

export type {
  // Content Types
  NonclaimItem,
  ClaimItem,
  ImageType,
  EditorData,

  // Regeneration & Versioning
  Version,
  RegenerateModalState,

  // API Types
  SaveAssetRequest,
  ApplyRegenerationRequest,
  ApplyNonClaimRequest,
  ApplyClaimRequest,
  RegenerationRequest,
  RegenerateNonClaimRequest,
  RegenerateClaimRequest,
  RegenerationResponse,
  PromptSuggestion,
  PromptSuggestionsResponse,
  EditorAPIs,

  // Component Props
  EditorModalProps,
  RegenerateModalProps,
  TextTabProps,
  ClaimTabProps,
  NonclaimTabProps,

  // Mappings & Constants
  HtmlMappingKey,
  BackendMappingKey,

  // Utility Types
  ApiResponse,
  NotificationService,
  ModifiedVersionData,
} from '../types';

