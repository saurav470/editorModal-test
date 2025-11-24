import { Col, Tooltip, } from "antd";
import { RedoDot } from "lucide-react";

interface ImageTabProps {
  hero_image: string;
  setRegenerateModal: Function;
}

const getImageComponent = (url: string, handleRegenerate: Function) => {
  const iconSize = 16;

  return (
    <Col>
      <div style={{ color: "rgba(3, 78, 162, 1)", marginBottom: "4px", height: "27px", display: "flex", alignItems: "center", justifyContent: "end" }}>
        {/* hover give more information when i hower */}
        <Tooltip title={`Prompt Editor for Hero Image`} >
          {/* <MessagesSquare size={iconSize} onClick={() => handleRegenerate()} style={{ cursor: "pointer" }} /> */}
          <RedoDot size={iconSize} onClick={() => handleRegenerate()} style={{ cursor: "pointer" }} />
        </Tooltip>
      </div>
      <img src={url} width={"100%"} style={{ borderRadius: "10px", border: "1px lightgray solid" }} />
    </Col>
  );
};
export default function ImageTab({ hero_image, setRegenerateModal }: ImageTabProps) {
  const handleRegenerate = () => {
    setRegenerateModal({ open: true, field: "hero_image", fieldPath: ["hero_image"] })
  }
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        padding: "0 8px 16px 0",
        flex: "1",
      }}
    >
      {
        getImageComponent(hero_image, handleRegenerate)
      }
      {/* <p>Image tab functionality will be handled later.</p> */}
    </div>
  )
}
