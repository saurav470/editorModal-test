/**
 * EditorContent Component
 * 
 * Contains the tabbed editor interface with form fields
 * Manages tabs for Text, Image, and Claim editing
 */

import { Card, Tabs, Form } from "antd";
import type { FormInstance } from "antd";
import { TabsType } from "../constants";
import TextTab from "./TextTab";
import ImageTab from "./ImageTab";
import ClaimTab from "./ClaimTab";
import type { NonclaimItem, ClaimItem } from "../types";
import {
  FileText,
  Image as ImageIcon,
  FileCheck,
} from "lucide-react";

interface EditorContentProps {
  /** Ant Design form instance */
  form: FormInstance;
  /** Currently active tab */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (key: string) => void;
  /** Callback when form values change */
  onValuesChange: (changedValues: any, allValues: any) => void;
  /** Callback when form is submitted */
  onFinish: (values: any) => void;
  /** Callback to set regenerate modal state */
  setRegenerateModal: (state: { open: boolean; field: string; fieldPath: (string | number)[] }) => void;
  /** Callback to set selected field */
  setSelectedfield: (field: string) => void;
  /** Array of nonclaim items */
  nonclaimData: NonclaimItem[];
  /** Callback to update nonclaim data */
  setNonclaimData: (data: NonclaimItem[]) => void;
  /** Array of claim items */
  claimData: ClaimItem[];
  /** Callback to update claim data */
  setClaimData: (data: ClaimItem[]) => void;
  /** Hero image URL */
  heroImage: string;
}

/**
 * Editor panel with tabbed interface for different content types
 * Contains form fields and edit controls
 * 
 * @example
 * ```tsx
 * <EditorContent
 *   form={form}
 *   activeTab={TabsType.TEXT}
 *   onTabChange={handleTabChange}
 *   onValuesChange={handleValuesChange}
 *   onFinish={handleFinish}
 *   setRegenerateModal={setRegenerateModal}
 *   setSelectedfield={setSelectedfield}
 *   nonclaimData={nonclaimData}
 *   setNonclaimData={setNonclaimData}
 *   claimData={claimData}
 *   setClaimData={setClaimData}
 *   iframeContent={iframeContent}
 *   heroImage={heroImage}
 * />
 * ```
 */
export const EditorContent: React.FC<EditorContentProps> = ({
  form,
  activeTab,
  onTabChange,
  onValuesChange,
  onFinish,
  setRegenerateModal,
  setSelectedfield,
  nonclaimData,
  setNonclaimData,
  claimData,
  setClaimData,
  heroImage
}) => {
  const items = [
    {
      key: TabsType.TEXT,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={16} />
          <span>Reusable Text</span>
        </div>
      ),
      forceRender: true,
      children: (
        <TextTab
          setRegenerateModal={setRegenerateModal}
          setSelectedfield={setSelectedfield}
          nonclaimData={nonclaimData}
          setNonclaimData={setNonclaimData}
          form={form}
        />
      ),
    },
    {
      key: TabsType.IMAGE,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ImageIcon size={16} />
          <span>Image</span>
        </div>
      ),
      forceRender: true,
      children: (
        <ImageTab
          hero_image={heroImage}
          setRegenerateModal={setRegenerateModal}
        />
      ),
    },
    {
      key: TabsType.CLAIM,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileCheck size={16} />
          <span>Claim</span>
        </div>
      ),
      forceRender: true,
      children: (
        <ClaimTab
          setRegenerateModal={setRegenerateModal}
          setSelectedfield={setSelectedfield}
          claimData={claimData}
          setClaimData={setClaimData}
          form={form}
        />
      ),
    },
  ];

  return (
    <Card
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "4px",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: "10px 0px 10px 10px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Form
        form={form}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        layout="vertical"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={items}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          tabBarStyle={{ marginBottom: 12, flex: "0 0 auto" }}
          className="scrollable-tabs cn-tabs"
        />
      </Form>
    </Card>
  );
};

