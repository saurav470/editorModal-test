// @ts-nocheck
/**
 * Constants and mappings for the Editor Modal
 * 
 * This file contains all constant values, enums, and mapping objects used
 * throughout the editor component.
 */

import type { HtmlMappingKey, BackendMappingKey } from "./types";

/**
 * Enum for different tab types in the editor
 */
export enum TabsType {
  /** Text editing tab (subject, preheader, etc.) */
  TEXT = "text",
  /** Image editing tab */
  IMAGE = "image",
  /** Non-claim editing tab */
  NONCLAIM = "nonclaim",
  /** Claim editing tab */
  CLAIM = "claim"
}

/**
 * Maps field names to their corresponding HTML element IDs in the iframe
 * Used to locate and update specific elements in the preview
 */
export const html_id_mapping: Record<HtmlMappingKey, string> = {
  subject: "subject_line",
  preheader: "preview",
  closing: "closing",
  introduction: "intro",
  hero_image: "hero_image",
  nonclaim: "nonclaim_id",
  claim: "claim_id",
} as const;

/**
 * Maps frontend field names to backend API field names
 * Used when making API calls to ensure correct field identification
 */
export const BackendMapping: Record<BackendMappingKey, string> = {
  subject: "subject",
  preheader: "preheader",
  introduction: "introduction",
  closing: "closing",
  hero_image: "hero_image",
  nonclaim: "non_claim",
  claim: "claim",
} as const;

/**
 * Maps field names to their display names in the UI
 * First element is the primary display name, second is alternative
 */
export const ViewMapping: Record<BackendMappingKey, string[]> = {
  subject: ["Subject Line", "subject line"],
  preheader: ["Preheader", "preheader"],
  introduction: ["Introduction", "introduction"],
  closing: ["Closing", "closing"],
  hero_image: ["Image", "Image"],
  nonclaim: ["Nonclaim", "nonclaim"],
  claim: ["Claim", "claim"],
} as const;

/**
 * CSS styles for custom scrollbars in the iframe
 * Applied to the iframe content to provide better UX
 */
export const scrollBarStyles = `
<style>
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-track {
    border-radius: 12px;
  }
  ::-webkit-scrollbar-thumb {
    background: lightgray;
    border-radius: 12px;
  }
  html {
    padding: 10px;
  }
</style>
` as const;

/**
 * CSS class name for highlighting selected elements in the iframe
 */
export const SELECTED_ELEMENT_CLASS = 'selected_cn_asset_feild' as const;

/**
 * CSS class name for highlighting selected claim elements (without bottom border)
 */
export const SELECTED_CLAIM_CLASS = 'selected_cn_asset_feild_exlude_button_dash' as const;
