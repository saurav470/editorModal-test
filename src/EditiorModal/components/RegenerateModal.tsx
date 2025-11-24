// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Row, Col, Card, Typography, Space, Alert, Divider } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, HistoryOutlined } from "@ant-design/icons"
import { BackendMapping, html_id_mapping, TabsType, ViewMapping } from '../constants';
import type { RegenerateModalProps, Version } from '../editor.d';
import { clearSelectedAssetFieldsFromIframe, iframeScroll, iframeScrollAndHighlight, injectIframeCustomStyles, updateHtmlContent, updateHtmlImage, updateIframeContent, updateIframeImageUrl } from '../utils';
import { SSE } from 'sse.js';
const { Title, Text } = Typography;
const { TextArea } = Input;


// **Hero Image Regeneration API**
// **URL** : {{local}}/api/assets/3/image/regenerate
// **METHOD**: POST
// **PAYLOAD**: {
//     "field": "hero_image",
//     "prompt": "Replace the people with two males"
// }
// **REPONSE**: {
//     "data": {
//         "data": [
//             {
//                 "id": 17,
//                 "field": "hero_image",
//                 "prompt": "Replace the people with two males",
//                 "data": null,
//                 "url": "local/newton/images/a1b5c24a-fa8a-4c84-b8e4-34a817029473.jpg",
//                 "created_at": "2025-04-11T11:50:13.376401"
//             },]}}
// export const regenerateHeroImage = async (assetId: number, body: { field: string; prompt: string }) => {
//   updateBaseURL();
//   const res: apiResponse = await handlePostDataFromApi(siteConfig.CN_FINAL_ASSET + `/${assetId}/image/regenerate`, body);
//   return res?.data;
// };

export default function RegenerateModal({
  open,
  onClose,
  originalHtml,
  fieldName,
  onApply,
  versionChange,
  asset_id,
  intialData,
  setRegenerateResponse,
  activeTab,
  apis,
  setHeroImage,
  setNewHtmlPromptEditorHtml
}: RegenerateModalProps) {

  console.log("recived props", fieldName, intialData, asset_id, activeTab)

  // Helper function to normalize field names for mapping lookups
  const normalizeFieldName = (fieldName: string): string => {
    const normalized = fieldName.toLowerCase();
    if (normalized.startsWith('nonclaim')) {
      return 'nonclaim';
    }
    if (normalized.startsWith('claim')) {
      return 'claim';
    }
    return normalized;
  };

  // Resolve the proper HTML id to highlight for a nonclaim or claim field.
  // Supports both formats: "nonclaim_<id>"/"claim_<id>" and "Nonclaim <index>"/"Claim <index>".
  const resolveFieldHtmlId = (fieldName: string, iframe?: HTMLIFrameElement | null): string => {
    const lower = fieldName.toLowerCase();
    let selectedfieldHtmlId = lower.startsWith('nonclaim') || lower.startsWith('claim')
      ? lower
      : html_id_mapping[normalizeFieldName(fieldName) as keyof typeof html_id_mapping];
    if (!lower.startsWith('nonclaim') && !lower.startsWith('claim')) return selectedfieldHtmlId;

    // Prefer underscore format: nonclaim_<id> or claim_<id>
    const underscoreParts = fieldName.split('_');
    let fieldId: number | null = null;
    if (underscoreParts.length > 1 && !Number.isNaN(Number(underscoreParts[1]))) {
      fieldId = parseInt(underscoreParts[1]);
    }

    // If underscore format not present, fall back to "Nonclaim <index>" or "Claim <index>" space format
    if (fieldId === null) {
      const fieldParts = fieldName.split(' ');
      const fieldIndex = fieldParts.length > 1 ? parseInt(fieldParts[1]) - 1 : 0;
      if (iframe?.contentDocument) {
        const dataAttr = lower.startsWith('claim') ? 'data-claim-id' : 'data-nonclaim-id';
        const elements = iframe.contentDocument.querySelectorAll(`[${dataAttr}]`);
        if (elements[fieldIndex]) {
          const idAttr = elements[fieldIndex].getAttribute(dataAttr);
          if (idAttr && !Number.isNaN(Number(idAttr))) {
            fieldId = parseInt(idAttr);
          }
        }
      }
    }

    // If we found an id, and the iframe contains an element with that data-claim-id or data-nonclaim-id, use it
    if (fieldId !== null) {
      if (iframe?.contentDocument) {
        const dataAttr = lower.startsWith('claim') ? 'data-claim-id' : 'data-nonclaim-id';
        const target = iframe.contentDocument.querySelector(`[${dataAttr}="${fieldId}"]`);
        if (target) {
          selectedfieldHtmlId = `${lower.startsWith('claim') ? 'claim' : 'nonclaim'}_${fieldId}`;
        } else {
          // As a fallback, check for element by id
          const byId = iframe.contentDocument.getElementById(`${lower.startsWith('claim') ? 'claim' : 'nonclaim'}_${fieldId}`);
          if (byId) selectedfieldHtmlId = `${lower.startsWith('claim') ? 'claim' : 'nonclaim'}_${fieldId}`;
        }
      } else {
        // If no iframe doc available yet, at least return the constructed id
        selectedfieldHtmlId = `${lower.startsWith('claim') ? 'claim' : 'nonclaim'}_${fieldId}`;
      }
    }

    return selectedfieldHtmlId;
  };
  console.log("init data", intialData)
  const [prompt, setPrompt] = useState('');
  const [modifiedHtml, setModifiedHtml] = useState<string | null>(null);
  const [selectedFieldData, setSelectedFieldData] = useState<string | null>(intialData || null);
  console.log("selectedFieldData tested ", selectedFieldData)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionMenuVisible, setVersionMenuVisible] = useState(false);

  const iframeRefModified = React.useRef<HTMLIFrameElement>(null);
  const iframeRefOriginal = React.useRef<HTMLIFrameElement>(null);
  const [iframeModifiedLoading, setIframeModifiedLoading] = useState(false)
  const [iframeOriginalLoading, setIframeOriginalLoading] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedVersionRef = React.useRef<HTMLDivElement>(null);
  const [propmtSuggestions, setPropmtSuggestions] = React.useState([]);

  // Load prompt suggestions and regeneration history on component mount
  useEffect(() => {
    (async () => {
      try {
        // Load prompt suggestions
        const suggestionsResponse = await apis.propmtSuggestion(
          BackendMapping[normalizeFieldName(fieldName) as keyof typeof BackendMapping]
        )
        console.log("suggestions response", suggestionsResponse)
        if (suggestionsResponse && suggestionsResponse.data && suggestionsResponse.data.suggestions.length > 0) {
          setPropmtSuggestions(suggestionsResponse.data.suggestions)
        }

        // Load regeneration history
        const historyResponse = await apis.getRegenerationHistory(asset_id, {
          field: BackendMapping[normalizeFieldName(fieldName) as keyof typeof BackendMapping],
          claim_nonclaim_id: fieldName.startsWith('nonclaim_') ? parseInt(fieldName.split('_')[1]) :
            fieldName.startsWith('claim_') ? parseInt(fieldName.split('_')[1]) : undefined
        })
        console.log("history response", historyResponse)
        console.log("history response data:", historyResponse?.data)
        console.log("history response versions:", historyResponse?.data?.versions)

        if (historyResponse && historyResponse.data && historyResponse.data.versions && historyResponse.data.versions.length > 0) {
          const historyVersions = historyResponse.data.versions
          console.log("Loaded history versions:", historyVersions.length, historyVersions)
          setVersions(historyVersions)
          setSelectedVersionId(historyVersions[0].id)

          // Set the initial field data based on the latest version
          if (activeTab === TabsType.TEXT || activeTab === TabsType.NONCLAIM || activeTab === TabsType.CLAIM) {
            setSelectedFieldData(historyVersions[0].data)
          } else if (activeTab === TabsType.IMAGE) {
            setSelectedFieldData(historyVersions[0].url)
          }

          // Update version change callback
          versionChange({
            version: historyVersions.length,
            id: historyVersions[0].id
          })
        } else {
          console.log("No history versions found or empty response")
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    })()
  }, [])

  const reversedVersions = [...versions].reverse();



  useEffect(() => {
    setIframeModifiedLoading(true)
  }, [])
  useEffect(() => {
    setIframeOriginalLoading(true)
  }, [])

  useEffect(() => {
    if (originalHtml && iframeRefModified.current) {
      iframeRefModified.current.srcdoc = originalHtml
    }
  }, [])

  useEffect(() => {
    if (originalHtml && iframeRefOriginal.current) {
      iframeRefOriginal.current.srcdoc = originalHtml
    }
  }, [])


  const handleIframeModifiedLoad = () => {
    setIframeModifiedLoading(false)
    if (!selectedFieldData) {
      console.log('No selectedFieldData available to render in modified iframe');
      return;
    }

    if (activeTab === TabsType.TEXT) {
      console.log("Text iframe load update updateIframeContent", activeTab);
      updateIframeContent(selectedFieldData, fieldName, iframeRefModified)
    } else if (activeTab === TabsType.NONCLAIM) {
      console.log("Nonclaim iframe load update updateIframeContent", fieldName, selectedFieldData, activeTab);
      updateIframeContent(selectedFieldData, fieldName, iframeRefModified)
    } else if (activeTab === TabsType.CLAIM) {
      console.log("Claim iframe load update updateIframeContent", fieldName, selectedFieldData, activeTab);
      updateIframeContent(selectedFieldData, fieldName, iframeRefModified)
    }

    else {
      updateIframeImageUrl(selectedFieldData, "hero_image", iframeRefModified)
    }

    console.log("iframe is loaded...")
  }

  const handleIframeOriginalLoad = () => {
    setIframeOriginalLoading(false)
    console.log("iframe is loaded...")
  }




  useEffect(() => {
    if (iframeRefModified.current && fieldName && !iframeModifiedLoading) {
      const iframe = iframeRefModified.current;
      const selectedfieldHtmlId = resolveFieldHtmlId(fieldName, iframe);
      console.log("test iframe", selectedfieldHtmlId)
      // If iframe is already loaded
      if (iframe.contentDocument?.readyState === 'complete') {
        console.log("test iframe complete")
        injectIframeCustomStyles(iframe);
        iframeScrollAndHighlight(iframe, selectedfieldHtmlId);
      } else {
        // Otherwise wait for it to load
        const onLoad = () => {
          injectIframeCustomStyles(iframe);
          iframeScrollAndHighlight(iframe, selectedfieldHtmlId);
        };
        iframe.addEventListener('load', onLoad);
        return () => iframe.removeEventListener('load', onLoad);
      }
    }
    // Cleanup function to remove the class when component unmounts or selectedfield changes
    return () => clearSelectedAssetFieldsFromIframe(iframeRefModified);
  }, [iframeModifiedLoading]);

  useEffect(() => {
    if (iframeRefOriginal.current && fieldName && !iframeOriginalLoading) {
      const iframe = iframeRefOriginal.current;
      const selectedfieldHtmlId = resolveFieldHtmlId(fieldName, iframe);
      console.log("test iframe", selectedfieldHtmlId)
      // If iframe is already loaded
      if (iframe.contentDocument?.readyState === 'complete') {
        injectIframeCustomStyles(iframe);
        iframeScrollAndHighlight(iframe, selectedfieldHtmlId);
      } else {
        // Otherwise wait for it to load
        const onLoad = () => {
          injectIframeCustomStyles(iframe);
          iframeScrollAndHighlight(iframe, selectedfieldHtmlId);
        };
        iframe.addEventListener('load', onLoad);
        return () => iframe.removeEventListener('load', onLoad);
      }
    }
    // Cleanup function to remove the class when component unmounts or selectedfield changes
    return () => clearSelectedAssetFieldsFromIframe(iframeRefOriginal);
  }, [iframeOriginalLoading]);


  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPrompt('');
      setModifiedHtml(null);
      setError(null);
      // Don't reset versions here as they are loaded from history
    }
  }, [open, originalHtml]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };


  const handleSubmit = async (htmlid: string) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the field name from the html_id_mapping
      const field = htmlid.toLowerCase()
      const htmlId = BackendMapping[field as keyof typeof BackendMapping]
      // Determine if this submit is for a nonclaim or claim item by checking the html id string
      const isNonclaimHtmlId = field.startsWith('nonclaim_') || field === 'nonclaim';
      const isClaimHtmlId = field.startsWith('claim_') || field === 'claim';

      // Call the regenerateFinalAsset API
      let response: any | SSE;
      // If htmlid indicates a nonclaim, prioritize the nonclaim regeneration flow
      if (isNonclaimHtmlId) {
        console.log("Nonclaim regeneration called (by htmlid)", htmlid, asset_id, prompt);
        const nonclaimId = parseInt(field.split('_')[1]);
        response = await apis.regenerationNonClaim(asset_id, {
          field: "non_claim",
          prompt: prompt,
          nonclaim_id: nonclaimId
        })

        // Handle response like TEXT
        if (response && response.data.versions && response.data.versions.length > 0) {
          console.log("response (NONCLAIM)", response);

          const regeneratedData = response.data.versions;
          // Backend sends complete version list, so just replace the versions
          setVersions(regeneratedData);
          setSelectedVersionId(regeneratedData[0].id); // First item is latest

          // Latest data (for nonclaim it's usually text data)
          setSelectedFieldData(regeneratedData[0].data);

          // Update HTML with the regenerated data
          const HTML = originalHtml;
          const updatedHtml = updateHtmlContent(HTML, fieldName, regeneratedData[0].data);
          setNewHtmlPromptEditorHtml(updatedHtml);

          console.log("regeneratedData (NONCLAIM)", updatedHtml);

          versionChange({
            version: regeneratedData.length,
            id: regeneratedData[0].id
          });

          setPrompt('');
          setLoading(false);
        } else {
          throw new Error("No data returned from NONCLAIM API");
        }

      } else if (isClaimHtmlId) {
        // Claim regeneration flow
        console.log("Claim regeneration called (by htmlid)", htmlid, asset_id, prompt);
        const claimId = parseInt(field.split('_')[1]);
        response = await apis.regenerationClaim(asset_id, {
          field: "claim",
          prompt: prompt,
          claim_id: claimId
        })

        // Handle response like TEXT
        if (response && response.data.versions && response.data.versions.length > 0) {
          console.log("response (CLAIM)", response);

          const regeneratedData = response.data.versions;
          // Backend sends complete version list, so just replace the versions
          setVersions(regeneratedData);
          setSelectedVersionId(regeneratedData[0].id); // First item is latest

          // Latest data (for claim it's usually text data)
          setSelectedFieldData(regeneratedData[0].data);

          // Update HTML with the regenerated data
          const HTML = originalHtml;
          const updatedHtml = updateHtmlContent(HTML, fieldName, regeneratedData[0].data);
          setNewHtmlPromptEditorHtml(updatedHtml);

          console.log("regeneratedData (CLAIM)", updatedHtml);

          versionChange({
            version: regeneratedData.length,
            id: regeneratedData[0].id
          });

          setPrompt('');
          setLoading(false);
        } else {
          throw new Error("No data returned from CLAIM API");
        }

      } else if (activeTab === TabsType.TEXT && !isNonclaimHtmlId && !isClaimHtmlId) {
        response = await apis.regeneration(asset_id, {
          field: htmlId,
          prompt: prompt,
        })
        // Extract the data from the response
        if (activeTab === TabsType.TEXT && response && response.data.versions.length > 0 && !isNonclaimHtmlId && !isClaimHtmlId) {
          console.log("response line 183", response)
          const regeneratedData = response.data.versions
          // Backend sends complete version list, so just replace the versions
          setVersions(regeneratedData)
          setSelectedVersionId(regeneratedData[0].id) // First item is latest
          // latest data
          setSelectedFieldData(regeneratedData[0].data)
          const HTML = originalHtml
          const updatedHtml = updateHtmlContent(HTML, fieldName, regeneratedData[0].data);
          setNewHtmlPromptEditorHtml(updatedHtml)
          console.log("regeneratedData line 200:dlksvslkdj ", updatedHtml)
          versionChange({
            version: regeneratedData.length,
            id: regeneratedData[0].id
          })
          setPrompt('')
          setLoading(false)
        } else {
          throw new Error("No data returned from API")
        }
      }
      else {
        setLoading(true)
        response = apis.regenerationHeroImage(asset_id, {
          field: htmlId,
          prompt: prompt,
        })
        response.addEventListener("end", async (data: { data: string }) => {
          console.log(`sse.addEventListener("end"`, data?.data);
          if (response instanceof SSE) {
            response.close();
          }
          setLoading(false);
          let parsedData: any;
          try {
            console.log("data 🤖🤖", data);
            parsedData = JSON.parse(data.data);
            console.log("parsedData 🤖🤖", parsedData.data.data);
          } catch (error) {
            console.error("Error parsing JSON:", error);
            if (response instanceof SSE) {
              response.close();
            }
            return;
          }
          if (parsedData) {
            if (parsedData.error) {
              console.log("parsedData.error 🤖🤖", parsedData.error);
              setError("Failed to generate content. Please try again.");
            } else if (parsedData.data) {
              console.log("parsedData.data 🤖🤖", parsedData.data);
              const newVersions = parsedData.data.versions
              if (newVersions && newVersions.length > 0) {
                const regeneratedData = newVersions
                // Backend sends complete version list, so just replace the versions
                setVersions(regeneratedData)
                setSelectedVersionId(regeneratedData[0].id) // First item is latest
                setSelectedFieldData(regeneratedData[0].url)
                const HTML = originalHtml
                const updatedHtmlImage = updateHtmlImage(HTML, fieldName, regeneratedData[0].url);
                setNewHtmlPromptEditorHtml(updatedHtmlImage)
                console.log("regeneratedData line 200:dlksvslkdj ", updatedHtmlImage, fieldName)
                versionChange({
                  version: regeneratedData.length,
                  id: regeneratedData[0].id
                })
                setPrompt('')
                return;
              } else {
                throw new Error("No data returned from API")
              }
            }
          }
        });
        response.onerror = (err: any) => {
          console.log("😇😇 Error generating content:", err);
          if (response instanceof SSE) {
            response.close();
          }
          setLoading(false);
        };
      }
    } catch (err) {
      setError("Failed to generate content. Please try again.")
      console.error("Error generating content:", err)
    }
  }
  const handleApply = () => {
    // Apply the currently selected version
    const selectedVersion = versions.find(v => v.id === selectedVersionId);
    if (selectedVersion) {
      onApply(selectedVersion.data);
    } else if (modifiedHtml) {
      onApply(modifiedHtml);
    }
    onClose();
  };

  const handleVersionSelect = (versionId: number) => {
    setSelectedVersionId(versionId)

    // Find the index of the version in the reversedVersions array
    const versionIndex = reversedVersions.findIndex((v) => v.id === versionId)

    versionChange({
      version: versionIndex + 1, // Use the index in the reversed array + 1
      id: versionId,
    })

    const selectedVersion = versions.find((v) => v.id === versionId)
    console.log("selected version", selectedVersion)
    if (selectedVersion && (activeTab === TabsType.TEXT || activeTab === TabsType.NONCLAIM || activeTab === TabsType.CLAIM)) {
      console.log("Text/Nonclaim/Claim version select updateIframeContent", activeTab, selectedVersion.data);
      setSelectedFieldData(selectedVersion.data)
    } else if (selectedVersion && activeTab === TabsType.IMAGE) {
      // @ts-ignore
      setSelectedFieldData(selectedVersion.url)
    }
    setVersionMenuVisible(false)
  }


  useEffect(() => {
    console.log("🤖🤖🤖", selectedFieldData)
    if (!selectedFieldData) return;

    if (activeTab === TabsType.TEXT || activeTab === TabsType.NONCLAIM || activeTab === TabsType.CLAIM) {
      console.log("Text/Nonclaim iframe update updateIframeContent", activeTab, selectedFieldData, fieldName)
      updateIframeContent(selectedFieldData, fieldName, iframeRefModified)
    } else {
      updateIframeImageUrl(selectedFieldData, "hero_image", iframeRefModified)
    }
    const selectedfieldHtmlId = resolveFieldHtmlId(fieldName, iframeRefModified.current)
    iframeScroll(iframeRefModified.current!, selectedfieldHtmlId)
    iframeScroll(iframeRefOriginal.current!, selectedfieldHtmlId)
  }, [selectedFieldData])

  useEffect(() => {
    // console.log("version change", selectedVersionId)
    setRegenerateResponse(selectedFieldData)
  }, [selectedFieldData])

  const formatToLocal = (
    timestamp: string,
    options?: Intl.DateTimeFormatOptions
  ): string | undefined => {
    try {

      console.log(timestamp, "timestamp")
      const time_stamp_arr = timestamp.split("")
      if (timestamp[time_stamp_arr.length - 1] !== "Z") {
        timestamp = timestamp + "Z"
      }
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, options ? options : {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (error) {

    }
  };


  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVersionMenuVisible(!versionMenuVisible);
  };
  // Add click outside handler to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setVersionMenuVisible(false);
      }
    }

    // Prevent scroll when dropdown is open
    function handleWheel(event: WheelEvent) {
      if (versionMenuVisible) {
        event.stopPropagation();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    if (versionMenuVisible) {
      document.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [versionMenuVisible]);
  useEffect(() => {
    if (versionMenuVisible && selectedVersionRef.current) {
      setTimeout(() => {
        selectedVersionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [versionMenuVisible, selectedVersionId]);

  console.log("loading 431", loading, propmtSuggestions)
  console.log("versions array:", versions, "length:", versions.length)
  console.log("selectedVersionId:", selectedVersionId)

  // Debug effect to monitor versions changes
  useEffect(() => {
    console.log("Versions changed:", versions.length, versions)
  }, [versions])

  return (
    <>
      <Col span={9} style={{ height: "100%", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "0 10px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>Original</Title>

              <div style={{ position: 'relative', visibility: 'hidden' }}>
                <Button
                  // onClick={() => setVersionMenuVisible(!versionMenuVisible)}
                  style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none' }}
                >
                  Version {selectedVersionId || 1}
                </Button>
                {versionMenuVisible && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    width: 200,
                    backgroundColor: '#1a1a1a',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: 4
                  }}>
                    {versions.slice().reverse().map(version => (
                      <div
                        key={version.id}
                        onClick={() => handleVersionSelect(version.id)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #333',
                          color: 'white'
                        }}
                      >
                        <div>
                          <div>Version {version.id}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {/* {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })} */}
                            {/* {version.created_at} */}
                          </div>
                        </div>
                        {version.id === selectedVersionId && (
                          <span style={{ color: 'white' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Card
            style={{
              height: "100%",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid gray",
            }}
            bodyStyle={{
              padding: "0px",
              height: "100% ", // Subtract the header height
              display: "flex",
              flexDirection: "column",
            }}
          >
            <iframe
              // srcDoc={originalHtml}
              ref={iframeRefOriginal}
              onLoad={handleIframeOriginalLoad}
              style={{
                flex: "1",
                border: "none",
                borderRadius: "4px",
                width: "100%",
                height: "100%",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
              title="Original Content"
            />
          </Card>
        </div>
      </Col>
      <Col span={9} style={{ height: "100%", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

          <div style={{ padding: "0 10px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              {/* i need index+1 not id */}
              <Title level={5} style={{ margin: 0 }}>Modified
                {
                  versions.length ? `Version ${reversedVersions.findIndex(v => v.id === selectedVersionId) + 1 || 1}` : ""
                }

              </Title>{/* i need index+1 not id */}

              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <Button
                  onClick={handleDropdownToggle}
                  // style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none' }}  
                  style={{
                    color: "rgba(3, 78, 162, 1)",
                    visibility: versions.length > 0 ? "visible" : "hidden",
                    opacity: versions.length > 0 ? 1 : 0.5
                  }}
                // type='primary'
                >
                  <HistoryOutlined />
                  V {reversedVersions.findIndex(v => v.id === selectedVersionId) + 1 || 1}
                </Button>
                {versionMenuVisible && versions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      width: 200,
                      // height: "200px",
                      maxHeight: "200px",
                      overflow: "auto",
                      backgroundColor: '#1a1a1a',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      // marginTop: 4
                    }}>
                    {reversedVersions.slice().map((version, index) => (
                      <div
                        key={version.id}
                        onClick={() => handleVersionSelect(version.id)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #333',
                          color: 'white'
                        }}
                        ref={version.id === selectedVersionId ? selectedVersionRef : null}
                      >
                        <div>
                          <div>Version {index + 1}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {formatToLocal(version.created_at)}
                          </div>
                        </div>
                        {version.id === selectedVersionId && (
                          <span style={{ color: 'white' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Card
            // title={}
            style={{
              height: "100%",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              display: "flex",
              border: "1px solid gray",
              flexDirection: "column",
            }}
            bodyStyle={{
              padding: "0px",
              height: "100% ", // Subtract the header height
              display: "flex",
              flexDirection: "column",
            }}
          >
            <iframe
              // srcDoc={displayedHtml}
              ref={iframeRefModified}
              onLoad={handleIframeModifiedLoad}
              style={{
                flex: "1",
                border: "none",
                borderRadius: "4px",
                width: "100%",
                height: "100%",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
              title="Modified Content"
            />
          </Card>
        </div>
      </Col>
      <Col span={6} style={{ height: "100%", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "0 10px", marginBottom: "7px" }}>
            <div style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title
                level={5}
                style={{
                  // fontSize: "16px",
                  // fontWeight: 500,
                  // color: "#374151",
                  margin: 0,
                }}
              >
                Prompt setting for {(() => {
                  const mapping = ViewMapping[normalizeFieldName(fieldName) as keyof typeof ViewMapping];
                  return mapping && mapping[1] ? mapping[1] : fieldName;
                })()}
              </Title>
              {/* <div style={{ position: 'relative', visibility: 'hidden' }}>
                <Button
                  // onClick={() => setVersionMenuVisible(!versionMenuVisible)}
                  style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none' }}
                  type='primary'
                >
                  Version {selectedVersionId || 1}
                </Button>
                {versionMenuVisible && (
                  <div
                    onWheel={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      width: 200,
                      backgroundColor: '#1a1a1a',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      marginTop: 4
                    }}>
                    {versions.slice().reverse().map(version => (
                      <div
                        key={version.id}
                        onClick={() => handleVersionSelect(version.id)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #333',
                          color: 'white'
                        }}
                      >
                        <div>
                          <div>Version {version.id}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {Math.floor(Math.random() * 2) + 1} hour ago
                          </div>
                        </div>
                        {version.id === selectedVersionId && (
                          <span style={{ color: 'white' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
            </div>
          </div>
          <Card
            // title={}
            style={{
              height: "100%",
              // backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              display: "flex",
              // border: "1px solid gray",
              // border: "none",
              flexDirection: "column",
              overflowY: "auto"
            }}
            bodyStyle={{
              padding: "0px",
              height: "100% ", // Subtract the header height
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", justifyContent: "space-between", height: "100%" }}>
              <Card
                style={{
                  width: "100%",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ebf5ff",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                  // flex: 1,
                  // height: "100%",
                }}
                styles={{
                  header: { paddingBottom: 8 },
                  body: { padding: "0 16px 16px" },
                }}
              >
                <Title
                  level={5}
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1d4ed8",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0 0 0"
                  }}
                >
                  <InfoCircleOutlined style={{ width: "20px", height: "20px", marginRight: "8px" }} />
                  Guidelines for Writing Effective Prompts
                </Title>
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 0, listStyle: "none" }}>
                  <li style={{ display: "flex", alignItems: "flex-start" }}>
                    <CheckCircleOutlined
                      style={{
                        width: "16px",
                        height: "16px",
                        color: "#16a34a",
                        marginRight: "8px",
                        marginTop: "2px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      Be specific about the changes you want to make to the {fieldName.toLowerCase()}
                    </span>
                  </li>
                  {
                    activeTab === TabsType.TEXT && (
                      <li style={{ display: "flex", alignItems: "flex-start" }}>
                        <CheckCircleOutlined
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#16a34a",
                            marginRight: "8px",
                            marginTop: "2px",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#374151" }}>
                          Include tone preferences (professional, friendly, persuasive, etc.)
                        </span>
                      </li>
                    )
                  }
                  {/* <li style={{ display: "flex", alignItems: "flex-start" }}>
                  <CheckCircleOutlined
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#16a34a",
                      marginRight: "8px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#374151" }}>
                    Mention key points or benefits you want to highlight
                  </span>
                </li> */}
                  {/* <li style={{ display: "flex", alignItems: "flex-start" }}>
                  <CheckCircleOutlined
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#16a34a",
                      marginRight: "8px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#374151" }}>
                    Specify any character limits or formatting requirements
                  </span>
                </li> */}
                </ul>

                <Divider />
                <Title
                  level={5}
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1d4ed8",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0 0 0"
                  }}
                >
                  <InfoCircleOutlined style={{ width: "20px", height: "20px", marginRight: "8px" }} />
                  Prompt Suggestions
                </Title>
                <ul>
                  {
                    propmtSuggestions.map((item, index) => (
                      <li key={index} style={{ display: "flex", alignItems: "flex-start" }}>
                        <CheckCircleOutlined
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#16a34a",
                            marginRight: "8px",
                            marginTop: "2px",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#374151" }}>
                          {/* @ts-ignore */}
                          {item.prompt}
                        </span>
                      </li>
                    ))
                  }
                </ul>
              </Card>
              <Card
                style={{
                  width: "100%",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "transparent",
                  // height: "100%",
                }}
                styles={{
                  header: { paddingBottom: 8 },
                  body: { padding: "10px 20px 10px" },
                }}
              >

                <TextArea
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder={`Describe how you want to modify the ${fieldName.toLowerCase()}`}
                  style={{
                    resize: "none",
                    // minHeight: "100px",
                    marginBottom: "16px",
                    borderColor: error ? "#ef4444" : "#d1d5db",
                    // ":focus": { borderColor: "#2563eb" },
                  }}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />

                {error && <Alert type="error" message={error} style={{ marginBottom: "16px", padding: "8px" }} />}

                <Button
                  onClick={() => handleSubmit(fieldName.toLowerCase())}
                  disabled={!prompt.trim() || loading}
                  style={{
                    width: "100%",
                    backgroundColor: "#1d4ed8",
                    color: !prompt.trim() ? "#e5e7eb" : "white",
                    fontWeight: 500,
                    // ":hover": { backgroundColor: "#1e40af" },
                  }}
                  type="primary"
                  loading={loading}
                >
                  {loading ? "Regenerating..." : "Regenerate"}
                </Button>

                <Text
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    paddingTop: "8px",
                  }}
                >
                  The AI will generate a new version based on your instructions.
                </Text>

              </Card>
            </div>
          </Card>
        </div>
      </Col >
    </>

  );
}
