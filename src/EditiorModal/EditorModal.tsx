/**
 * EditorModal Component
 * 
 * Main modal for editing email assets including:
 * - Text fields (subject, preheader, intro, closing)
 * - Nonclaim statements
 * - Claim statements  
 * - Hero images
 * 
 * Features:
 * - Live preview with iframe
 * - AI-powered content regeneration
 * - Side-by-side editing with highlighting
 * - Synchronized state between form, iframe, and data
 */

import { useState, useEffect, useRef } from "react";
import { Modal, Row, Col, Form } from "antd";
import { BackendMapping, TabsType, html_id_mapping } from "./constants";
import {
  removeHighlight,
  injectIframeCustomStyles,
  iframeScrollAndHighlight,
  prepareHtmlWithIds
} from "./utils";
import {
  useMessageNotification,
  // useNonclaimSync,
  useClaimSync,
  useIframeHighlight,
  useIframeContent
} from "./hooks";
import {
  EditorModalHeader,
  RegenerateModal,
  EditorPreview,
  EditorContent
} from './components';
import type { EditorModalProps, NonclaimItem } from "./types";
// @ts-ignore
import "./EditorModal.css";
import { useAppSelector } from "../../../Store/hooks";
import { RootState } from "../../../Store";

/**
 * Main editor modal component for email asset editing
 * Manages form state, iframe synchronization, and content regeneration
 */
export function EditorModal({
  data,
  open,
  setOpen,
  id,
  setAsset,
  editTitle,
  iframeInitContent,
  apis,
  hero_image,
  handleImagesChange,
}: EditorModalProps) {
  // Constants
  console.log(
    "hero_image in editor modal:", hero_image
  )
  const { orderId } = useAppSelector((state: RootState) => state.contentNewtonReducer);

  // Form and refs
  const [form] = Form.useForm();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // UI state
  const [selectedfield, setSelectedfield] = useState("");
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("contentNewtonChannel") === "email_fragment"
      ? TabsType.IMAGE
      : TabsType.TEXT
  );
  const [loading, setLoading] = useState(false);

  // Data state
  const [editData, setEditData] = useState(data);
  const [heroImage, setHeroImage] = useState(hero_image);
  const [nonclaimData, setNonclaimData] = useState<NonclaimItem[]>(data.nonclaim || []);
  const [claimData, setClaimData] = useState<{ id: number; text: string }[]>(data.claim || []);
  const [initialFormValues, setInitialFormValues] = useState<any>(null);

  // Regeneration state
  const [regenerateModal, setRegenerateModal] = useState<{
    open: boolean;
    field: string;
    fieldPath: (string | number)[];
  }>({
    open: false,
    field: "",
    fieldPath: [],
  });
  const [regenerateResponse, setRegenerateResponse] = useState<string>("");
  const [modifiedData, setModifiedData] = useState({ id: 0, version: 0 });

  // Custom hooks
  const { contextHolder, successMessage, errorMessage, infoMessage } = useMessageNotification();
  const { iframeContent, setIframeContent, iframeLoading, setIframeLoading } = useIframeContent({
    iframeInitContent,
    iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
    nonclaimData,
    open
  });

  // Sync claim data with iframe (nonclaim sync disabled - handled by updateIframeContent)
  // useNonclaimSync({ iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>, nonclaimData });
  useClaimSync({ iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>, claimData });
  useIframeHighlight({ iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>, selectedfield });

  // Notification service for child components
  const NontificationService = {
    successMessage,
    errorMessage,
    warningMessage: (text?: string) => console.warn(text),
    infoMessage,
  };

  // Initialize form values when data changes
  useEffect(() => {
    setEditData(data);
    setNonclaimData(data.nonclaim || []);
    setClaimData(data.claim || []);
    setActiveTab(TabsType.TEXT);
  }, [open]);

  // Set form values and update iframe
  useEffect(() => {
    const formValues = {
      subject: editData.subject || "",
      preheader: editData.preheader || "",
      closing: editData.closing || "",
      introduction: editData.intro || "",
      nonclaim: editData.nonclaim || [],
      claim: editData.claim || [],
    };

    form.setFieldsValue(formValues);
    setNonclaimData(editData.nonclaim || []);
    setClaimData(editData.claim || []);
    setInitialFormValues(formValues);

    // Update iframe content with the form values
    if (iframeRef.current) {
      setTimeout(() => {
        updateIframeContent(formValues);
      }, 100);
    }
  }, [editData, form, open]);

  // Set selected field when switching to image tab
  useEffect(() => {
    if (activeTab === TabsType.IMAGE) {
      setSelectedfield("hero_image");
    } else {
      setSelectedfield("");
    }
  }, [activeTab]);

  /**
   * Updates iframe content with form values
   * Modifies text fields and hero image in the iframe DOM
   */
  const updateIframeContent = (values: any) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;

    if (values) {
      // Update text fields
      const fieldMappings = [
        { key: 'subject', id: 'subject_line' },
        { key: 'preheader', id: 'preview' },
        { key: 'introduction', id: 'intro' },
        { key: 'closing', id: 'closing' }
      ];

      fieldMappings.forEach(({ key, id }) => {
        const element = doc.getElementById(id);
        if (element && values[key] !== undefined) {
          element.textContent = values[key] || "";
        }
      });

      // Update hero image
      const ImageElement = doc.getElementById("hero_image");
      if (ImageElement) {
        const imageElement = ImageElement.querySelector('img');
        if (imageElement) {
          imageElement.src = heroImage;
        }
      }

      // Update nonclaim data - Nonclaims now have IDs in HTML from backend, same as claims
      if (values.nonclaim && values.nonclaim.length > 0) {
        values.nonclaim.forEach((item: NonclaimItem) => {
          // Try to find element by data attribute or id (same as claims)
          const byData = doc.querySelector(`[data-nonclaim-id="${item.id}"]`);
          const byId = doc.getElementById(`nonclaim_${item.id}`);
          const targetElement = (byData as Element) || (byId as Element);

          if (targetElement) {
            targetElement.textContent = item.text;
            const htmlElement = targetElement as HTMLElement;
            htmlElement.style.cursor = 'pointer';
            htmlElement.style.border = '1px solid transparent';
            htmlElement.style.padding = '4px';
            htmlElement.style.borderRadius = '4px';
            // Ensure attributes are set
            (targetElement as HTMLElement).id = `nonclaim_${item.id}`;
            targetElement.setAttribute('data-nonclaim-id', item.id.toString());
          }
        });
      }

      // Update claim data
      if (values.claim && values.claim.length > 0) {
        values.claim.forEach((item: { id: number; text: string }) => {
          // Try to find element by data attribute or id
          const byData = doc.querySelector(`[data-claim-id="${item.id}"]`);
          const byId = doc.getElementById(`claim_${item.id}`);
          const targetElement = (byData as Element) || (byId as Element);

          if (targetElement) {
            targetElement.textContent = item.text;
            const htmlElement = targetElement as HTMLElement;
            htmlElement.style.cursor = 'pointer';
            htmlElement.style.padding = '4px';
            htmlElement.style.borderRadius = '4px 4px 0 0px';
            // Ensure attributes are set
            (targetElement as HTMLElement).id = `claim_${item.id}`;
            targetElement.setAttribute('data-claim-id', item.id.toString());
          }
        });
      }
    }
  };

  /**
   * Handles form value changes and updates iframe
   * Uses setTimeout to ensure form state is fully updated before reading
   */
  const onValuesChange = () => {
    // Use setTimeout to ensure form has finished updating
    // This ensures getFieldsValue returns the complete, updated state
    setTimeout(() => {
      const completeValues = form.getFieldsValue();

      if (completeValues.nonclaim) {
        setNonclaimData(completeValues.nonclaim);
      }
      if (completeValues.claim) {
        setClaimData(completeValues.claim);
      }
      updateIframeContent(completeValues);
    }, 0);
  };

  /**
   * Handles iframe load event
   */
  const handleIframeLoad = () => {
    setIframeLoading(false);
    updateIframeContent(form.getFieldsValue());

    injectIframeCustomStyles(iframeRef.current!);
    const htmlId = selectedfield.toLowerCase().startsWith('nonclaim_') ||
      selectedfield.toLowerCase().startsWith('claim_')
      ? selectedfield.toLowerCase()
      : html_id_mapping[selectedfield as keyof typeof html_id_mapping];
    iframeScrollAndHighlight(iframeRef.current!, htmlId);
  };

  /**
   * Handles tab change
   */
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey as TabsType);
  };

  /**
   * Closes regenerate modal
   */
  const handleModalClose = () => {
    setRegenerateModal({ open: false, field: "", fieldPath: [] });
  };

  /**
   * Exits from prompt editor
   */
  const handelExitToPromptEditor = () => {
    setRegenerateModal({ open: false, field: "", fieldPath: [] });
    if (activeTab === TabsType.TEXT) {
      setSelectedfield("");
    }
    setModifiedData({ id: 0, version: 0 });
  };

  /**
   * Resets form to initial values
   */
  const resetForm = () => {
    if (initialFormValues) {
      form.setFieldsValue(initialFormValues);
      updateIframeContent(initialFormValues);
    }
  };

  /**
   * Saves the asset with current form values
   */
  const onFinish = async (values: any) => {
    try {
      updateIframeContent(values);
      removeHighlight(iframeRef.current!);

      // Get the full HTML content from iframe
      let iframeHtmlString = "";
      const iframeDocument = iframeRef.current!.contentDocument ||
        iframeRef.current!.contentWindow?.document;
      if (iframeDocument) {
        iframeHtmlString = iframeDocument.documentElement.outerHTML;
      }

      await apis.saveApi(id, {
        asset_data: iframeHtmlString,
        subject: values.subject,
        preheader: values.preheader,
        opening: values.introduction,
        closing: values.closing,
        nonclaim: values.nonclaim || [],
        claim: values.claim || [],
      });

      if (setAsset) {
        setAsset(iframeHtmlString, {
          subject: values.subject,
          preheader: values.preheader,
          intro: values.introduction,
          closing: values.closing,
          nonclaim: values.nonclaim || [],
          claim: values.claim || [],
          heroImage
        });
      }

      setSelectedfield("");
      successMessage("Asset saved successfully!");
    } catch (err) {
      console.error("Error saving banner:", err);
      errorMessage("Error saving asset!");
    }
  };

  /**
   * Handles modal cancel/close
   */
  const onCancel = () => {
    setOpen(false);
    regenerateModal.open && handleModalClose();
    setModifiedData({ id: 0, version: 0 });
    setSelectedfield("");
  };

  /**
   * Validates and saves form
   */
  const onOk = async () => {
    try {
      setLoading(true);
      await form.validateFields();
      const values = form.getFieldsValue();
      await onFinish(values);
      setOpen(false);
    } catch (err) {
      console.error("Form validation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Applies regenerated content version
   * Updates form, state, and iframe with the new content
   */
  const handleApply = async (modifiedVersion: number, modifiedVersionNumber: number) => {
    try {
      if (modifiedVersionNumber === 0) {
        infoMessage("No changes are made to the content");
        return;
      }

      // Check if this is a text/nonclaim/claim tab operation
      if (activeTab === TabsType.TEXT || activeTab === TabsType.NONCLAIM || activeTab === TabsType.CLAIM) {
        const field = BackendMapping[regenerateModal.field.toLowerCase() as keyof typeof BackendMapping];

        // Determine if this is a nonclaim or claim item
        const isNonclaim = regenerateModal.field.startsWith("nonclaim");
        const isClaim = regenerateModal.field.startsWith("claim");
        const prefix = isNonclaim ? "nonclaim" : isClaim ? "claim" : null;

        // Handle non-nonclaim/non-claim fields (subject, preheader, etc.)
        if (!prefix) {
          await apis.applyRegeneration(id, { field, id: modifiedVersion, order_id: orderId });
          form.setFieldValue(regenerateModal.fieldPath, regenerateResponse);

          // Trigger form update to sync iframe
          const values = form.getFieldsValue();
          form.setFieldsValue(values);
          updateIframeContent(values);

          if (setAsset) {
            const currentHtml = iframeRef.current?.contentDocument?.documentElement.outerHTML || iframeContent;
            setAsset(currentHtml, {
              ...values,
              nonclaim: nonclaimData,
              claim: claimData,
              heroImage: heroImage
            });
          }

          handleModalClose();
          setModifiedData({ id: 0, version: 0 });
          successMessage(`Content version ${modifiedVersionNumber} applied successfully!`);
          return;
        }

        // Handle nonclaim/claim items
        const itemId = parseInt(regenerateModal.field.split("_")[1] || "0");

        // Call the appropriate backend API
        if (isNonclaim) {
          await apis.applyRegeneratedNonClaim(id, {
            field: "non_claim",
            id: modifiedVersion,
            order_id: orderId,
            orderednonclaim_id: itemId,
          });
        } else if (isClaim) {
          await apis.applyRegeneratedClaim(id, {
            field: "claim",
            id: modifiedVersion,
            order_id: orderId,
            orderedclaim_id: itemId,
          });
        }

        // Update the local data array with the new regenerated text
        const updatedDataArray = (isNonclaim ? nonclaimData : claimData).map((item) =>
          item.id === itemId ? { ...item, text: regenerateResponse } : item
        );

        // Update state with the new array
        if (isNonclaim) {
          setNonclaimData(updatedDataArray);
        } else {
          setClaimData(updatedDataArray);
        }

        // Update the form with the new data
        form.setFieldValue(regenerateModal.fieldPath, regenerateResponse);
        const currentFormValues = form.getFieldsValue();
        const updatedFormValues = {
          ...currentFormValues,
          [prefix]: updatedDataArray
        };
        form.setFieldsValue(updatedFormValues);




        // Now update the iframe content
        const iframeDoc = iframeRef.current?.contentDocument;
        if (iframeDoc) {
          const target = iframeDoc.querySelector(`[data-${prefix}-id="${itemId}"]`) ||
            iframeDoc.getElementById(`${prefix}_${itemId}`);
          console.log("line 498")
          if (target) {
            target.textContent = regenerateResponse;
            (target as HTMLElement).id = `${prefix}_${itemId}`;
            target.setAttribute(`data-${prefix}-id`, itemId.toString());

            const updatedHtml = iframeDoc.documentElement.outerHTML;
            setIframeContent(updatedHtml);

            console.log("yaha set karta hu")

            if (iframeRef.current) {
              injectIframeCustomStyles(iframeRef.current);
              removeHighlight(iframeRef.current);
              iframeScrollAndHighlight(iframeRef.current, `${prefix}_${itemId}`);
            }

            if (setAsset) {
              console.log("yaha set karta hu 2")

              setAsset(updatedHtml, {
                ...updatedFormValues,
                ...(isNonclaim ? { claim: claimData } : { nonclaim: nonclaimData }),
                heroImage: heroImage
              });
            }
          }
        }

        handleModalClose();
        setModifiedData({ id: 0, version: 0 });
        successMessage(`Content version ${modifiedVersionNumber} applied successfully!`);

      } else {
        // Handle image regeneration

        const field = BackendMapping[regenerateModal.field.toLowerCase() as keyof typeof BackendMapping];
        const updatedData = await apis.applyRegeneration(id, { field, id: modifiedVersion, order_id: orderId });
        console.log("updatedData after image regeneration:", updatedData);
        setHeroImage(updatedData?.data?.hero_image_url);

        if (setAsset) {
          const currentValues = form.getFieldsValue();
          const currentHtml = iframeRef.current?.contentDocument?.documentElement.outerHTML || iframeContent;
          setAsset(currentHtml, {
            ...currentValues,
            heroImage: updatedData?.data?.hero_image_url,
            claim: claimData,
            nonclaim: nonclaimData
          });
        }

        handleModalClose();
        setModifiedData({ id: 0, version: 0 });
        successMessage(`Content version ${modifiedVersionNumber} applied successfully!`);
        handleImagesChange?.(updatedData?.data?.images_data || []);
      }
    } catch (err) {
      errorMessage(`Error applying content version ${modifiedVersion}`);
      console.error("Error applying content:", err);
    }
  };

  /**
   * Prepares HTML content with nonclaim IDs for RegenerateModal
   */
  const prepareHtmlWithNonclaimIds = (htmlContent: string): string => {
    return prepareHtmlWithIds(htmlContent, nonclaimData, claimData);
  };

  return (
    <>
      {contextHolder}
      <Modal
        keyboard={false}
        maskClosable={false}
        className="cn-fullscreen-modal"
        open={open}
        centered={true}
        onCancel={onCancel}
        okButtonProps={{ style: { display: "none" } }}
        cancelText="Close"
        cancelButtonProps={{ disabled: false }}
        width="calc(100vw - 64px)"
        closeIcon={false}
        styles={{
          body: {
            height: "calc(90vh - 84px)",
            display: "flex",
            flexDirection: "column",
            padding: "0",
            overflow: "hidden",
          },
        }}
        title={
          <EditorModalHeader
            setOpen={setOpen}
            regenerateModal={regenerateModal}
            form={form}
            initialValues={initialFormValues}
            resetForm={resetForm}
            onOk={onOk}
            editTitle={editTitle}
            modifiedData={modifiedData}
            exitPromptEditor={handelExitToPromptEditor}
            notificationService={NontificationService}
            applyChanges={handleApply}
            hasImageChanges={heroImage !== hero_image}
          />
        }
      >
        <Row
          gutter={[8, 8]}
          style={{
            width: "100%",
            height: "100%",
            margin: 0,
            overflow: "hidden",
          }}
        >
          {regenerateModal.open ? (
            <RegenerateModal
              open={regenerateModal.open}
              onClose={handleModalClose}
              originalHtml={
                prepareHtmlWithNonclaimIds(
                  (iframeRef.current?.contentDocument?.documentElement.outerHTML) || iframeContent
                )
              }
              fieldName={regenerateModal.field}
              onApply={() => { }} // Handled by handleApply instead
              versionChange={setModifiedData}
              setRegenerateResponse={setRegenerateResponse}
              asset_id={id}
              intialData={
                regenerateModal.field &&
                  (regenerateModal.field.startsWith('nonclaim_') || regenerateModal.field.startsWith('claim_'))
                  ? (() => {
                    const parts = regenerateModal.field.split('_');
                    const itemId = parts.length > 1 ? parseInt(parts[1]) : NaN;
                    const isNonClaim = regenerateModal.field.startsWith('nonclaim_');
                    const dataArray = isNonClaim ? nonclaimData : claimData;
                    const found = dataArray.find(item => item.id === itemId);
                    return found ? found.text : form.getFieldValue(regenerateModal.fieldPath) || heroImage;
                  })()
                  : activeTab === TabsType.TEXT
                    ? form.getFieldValue(regenerateModal.fieldPath)
                    : heroImage
              }
              activeTab={activeTab}
              apis={apis}
              setHeroImage={setHeroImage}
              setNewHtmlPromptEditorHtml={() => { }}
            />
          ) : (
            <>
              {/* Editor Section */}
              <Col span={12} style={{ height: "100%", padding: "0 4px" }}>
                <EditorContent
                  form={form}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onValuesChange={onValuesChange}
                  onFinish={onFinish}
                  setRegenerateModal={setRegenerateModal}
                  setSelectedfield={setSelectedfield}
                  nonclaimData={nonclaimData}
                  setNonclaimData={setNonclaimData}
                  claimData={claimData}
                  setClaimData={setClaimData}
                  heroImage={heroImage}
                />
              </Col>

              {/* Preview Section */}
              <Col span={12} style={{ height: "100%", padding: "0 4px" }}>
                <EditorPreview
                  iframeRef={iframeRef as React.RefObject<HTMLIFrameElement>}
                  iframeContent={iframeContent}
                  iframeLoading={iframeLoading}
                  loading={loading}
                  onIframeLoad={handleIframeLoad}
                />
              </Col>
            </>
          )}
        </Row>
      </Modal>
    </>
  );
}
