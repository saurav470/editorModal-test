import { SSE } from "sse.js";

export type HtmlMappingKey = "subject" | "preheader" | "closing" | "introduction" | "hero_image" | "nonclaim" | "claim";
export type BackendMappingKey = "subject" | "preheader" | "introduction" | "closing" | "hero_image" | "nonclaim" | "claim";

export interface EditorProps {
  data: EditorData
  hero_image: string
  open: boolean
  setOpen: (open: boolean) => void
  id: number
  setAsset: Function | null
  editTitle: string
  iframeInitContent: string
  currentMarket?: string
  apis: {
    saveApi: (assetId: number, body: {
      asset_data: string;
      subject: string;
      preheader: string;
      opening: string;
      closing: string;
      nonclaim?: NonclaimItem[];
    }) => Promise<any>;
    applyRegeneration: (assetId: number, body: {
      field: string;
      id: number;
      order_id: number;
    }) => Promise<any>;
    applyRegeneratedNonClaim: (assetId: number, body: { field: string; id: number, order_id: number, orderednonclaim_id: number }) => Promise<any>;
    applyRegeneratedClaim: (assetId: number, body: { field: string; id: number, order_id: number, orderedclaim_id: number }) => Promise<any>;
    regeneration: (assetId: number, body: {
      field: string;
      prompt: string;
    }) => Promise<any>;
    regenerationNonClaim: (assetId: number, body: {
      field: string;
      prompt: string;
      nonclaim_id: number;
    }) => Promise<any>;
    regenerationClaim: (assetId: number, body: {
      field: string;
      prompt: string;
      claim_id: number;
    }) => Promise<any>;

    regenerationHeroImage: (assetId: number, body: {
      field: string;
      prompt: string;
    }) => SSE
    propmtSuggestion: (field: string) => Promise<any>
  }
  handleImagesChange?: (updatedImages: ImageType[]) => void
  handleNonClaimsChange?: (updatedNonClaims: NonclaimItem[]) => void
}
export interface Response {
  data: {
    html: string
  }
}

export interface RegenerateModalProps {
  setHeroImage: Function;
  open: boolean;
  onClose: () => void;
  originalHtml: string;
  // onSubmit: (prompt: string, htmlid: string, version: number) => Promise<string>;
  fieldName: string;
  onApply: (html: string) => void;
  versionChange: Function;
  asset_id: number;
  intialData?: string | undefined;
  setRegenerateResponse: Function
  setNewHtmlPromptEditorHtml: Function
  activeTab: string
  apis: {
    saveApi: (assetId: number, body: {
      asset_data: string;
      subject: string;
      preheader: string;
      opening: string;
      closing: string;
      nonclaim?: NonclaimItem[];
    }) => Promise<any>;
    applyRegeneration: (assetId: number, body: {
      field: string;
      id: number;
      order_id: number;
    }) => Promise<any>;
    regeneration: (assetId: number, body: {
      field: string;
      prompt: string;
    }) => Promise<any>;
    regenerationHeroImage: (assetId: number, body: {
      field: string;
      prompt: string;
    }) => SSE
    regenerationNonClaim: (assetId: number, body: {
      field: string;
      prompt: string;
      nonclaim_id: number;
    }) => Promise<any>;
    regenerationClaim: (assetId: number, body: {
      field: string;
      prompt: string;
      claim_id: number;
    }) => Promise<any>;
    applyRegeneratedNonClaim: (assetId: number, body: { field: string; id: number, order_id: number, orderednonclaim_id: number }) => Promise<any>;
    applyRegeneratedClaim: (assetId: number, body: { field: string; id: number, order_id: number, orderedclaim_id: number }) => Promise<any>;
    propmtSuggestion: (field: string) => Promise<any>
  }
}

export interface Version {
  id: number;
  field: string;
  prompt: string;
  data: string;
  created_at: string; // Typically an ISO date string; if you parse it, you might use Date instead.
}

// {
//   id: number;
//   // html: string;
//   prompt: string;
//   timestamp: Date;
//   data: string;
// }


export interface EditorData {
  subject: string
  preheader: string
  // supporting_text?: string
  closing: string
  intro: string
  nonclaim?: NonclaimItem[]
  claim?: ClaimItem[]
}

export interface NonclaimItem {
  id: number
  text: string
}

export interface ClaimItem {
  id: number
  text: string
}

export interface ImageType {
  id: number
  url: string
  alt?: string
}

export interface TextTabProps {
  setRegenerateModal: Function
  setSelectedfield: Function
  nonclaimData: NonclaimItem[]
  setNonclaimData: Function
}