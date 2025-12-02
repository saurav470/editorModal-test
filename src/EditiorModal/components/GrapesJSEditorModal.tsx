/**
 * GrapesJSEditorModal Component
 * 
 * A full-featured HTML and layout editor using GrapesJS.
 * Provides visual editing capabilities for HTML content with:
 * - Drag and drop components
 * - Style manager
 * - Layer manager
 * - Code editor
 * - Responsive design tools
 * 
 * Features:
 * - Loads HTML content from iframe
 * - Allows editing HTML structure and styles
 * - Saves changes back to parent component
 */

import { useEffect, useRef, useState } from 'react';
import { Modal, Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import type { Editor } from 'grapesjs';
import './GrapesJSEditorModal.css';

interface GrapesJSEditorModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Initial HTML content to load */
  initialHtml?: string;
  /** Callback when content is saved */
  onSave?: (html: string, css: string) => void;
}

/**
 * GrapesJS Editor Modal Component
 * 
 * Provides a full-featured visual HTML editor with all GrapesJS capabilities
 */
export function GrapesJSEditorModal({
  open,
  onClose,
  initialHtml = '',
  onSave,
}: GrapesJSEditorModalProps) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize GrapesJS editor when modal opens
   */
  useEffect(() => {
    if (!open) {
      // Clean up editor reference when modal closes
      // Actual destruction happens in cleanup function
      if (editorRef.current) {
        const editor = editorRef.current;
        editorRef.current = null;
        // Schedule destruction to avoid React conflicts
        setTimeout(() => {
          try {
            if (editor && typeof editor.destroy === 'function') {
              editor.destroy();
            }
          } catch (error) {
            // Ignore - may already be destroyed
          }
        }, 0);
      }
      return;
    }

    // Clean up previous editor instance if exists
    if (editorRef.current) {
      try {
        const editor = editorRef.current;
        editorRef.current = null;
        setTimeout(() => {
          try {
            if (editor && typeof editor.destroy === 'function') {
              editor.destroy();
            }
          } catch (error) {
            // Ignore - may already be destroyed
          }
        }, 0);
      } catch (error) {
        console.error('Error cleaning up previous editor:', error);
      }
    }

    setIsLoading(true);

    // Use a function to check if container is ready and has dimensions
    const initEditor = () => {
      // Use the inner container if it exists, otherwise use the main container
      const container = innerContainerRef.current || containerRef.current;

      if (!container) {
        setIsLoading(false);
        return;
      }

      // Check if container has proper dimensions
      const containerHeight = container.offsetHeight;
      const containerWidth = container.offsetWidth;

      // If container doesn't have dimensions yet, wait a bit more
      if (containerHeight === 0 || containerWidth === 0) {
        setTimeout(initEditor, 100);
        return;
      }

      try {
        console.log('Initializing GrapesJS editor with container:', container);
        console.log('Container dimensions:', { height: containerHeight, width: container.offsetWidth });
        console.log('Initial HTML:', initialHtml || 'Using default');

        // Inject HTML into container first (like grapesjs-dev does with fromElement: true)
        // This ensures proper DOM structure for accurate hover/selection
        // IMPORTANT: Don't parse the HTML - use it directly to preserve exact structure
        if (initialHtml && container) {
          // Use the HTML directly - it's already body content from getCurrentHtmlForGrapesJS
          // Setting innerHTML directly preserves the exact DOM structure for accurate hover detection
          container.innerHTML = initialHtml;

          // Force a reflow to ensure browser has parsed the HTML
          // This is critical for accurate hover/selection detection
          void container.offsetHeight;
        } else if (container) {
          // Default content if no HTML provided
          container.innerHTML = '<div style="padding: 20px; min-height: 200px;">Start editing your HTML here...</div>';
        }

        // Use requestAnimationFrame + setTimeout to ensure DOM is fully ready before GrapesJS reads it
        // This is critical for accurate hover/selection detection - GrapesJS needs the DOM to be stable
        requestAnimationFrame(() => {
          // Double-check container still exists and has content
          if (!container || !container.parentElement) {
            setIsLoading(false);
            return;
          }

          // Small additional delay to ensure browser has fully parsed the HTML
          setTimeout(() => {
            // Initialize GrapesJS editor with fromElement: true (like grapesjs-dev)
            // This ensures accurate hover/selection by using the actual DOM
            const editor = grapesjs.init({
              container: container,
              height: `${containerHeight}px`,
              width: '100%',
              showOffsets: true,
              noticeOnUnload: false,
              autorender: true,
              storageManager: {
                autoload: false,
                autosave: false,
              },
              fromElement: true, // Use fromElement: true for accurate hover/selection
              // Canvas CSS to remove black borders
              canvasCss: `
            body { margin: 0; padding: 0; background: #fff !important; }
            html { margin: 0; padding: 0; background: #fff !important; }
          `,
              // Base CSS for canvas
              baseCss: `
            body { margin: 0; padding: 0; background: #fff !important; }
            html { margin: 0; padding: 0; background: #fff !important; }
          `,
              // Device Manager - hidden (not needed for drag and drop only)
              deviceManager: {},
              // Block Manager - show blocks panel for drag and drop
              blockManager: {
                appendTo: '.blocks-container',
              },
              // Layer Manager - hidden
              layerManager: {},
              // Trait Manager - hidden
              traitManager: {},
              // Selector Manager - hidden
              selectorManager: {},
              // Panels - hide default panels
              panels: {
                defaults: [],
              },
              // Style Manager - hidden
              styleManager: {},
            });

            // Store editor reference
            editorRef.current = editor;

            // Disable double-click editing (Rich Text Editor)
            editor.setCustomRte({
              enable: () => {
                // Return a no-op RTE to prevent editing
                return {
                  disable: () => { },
                  focus: () => { },
                };
              },
              disable: () => { },
              focus: () => { },
            });

            // Disable editable on all components (prevents double-click editing)
            editor.on('component:add', (component: any) => {
              component.set('editable', false);
            });

            // Also disable on component update
            editor.on('component:update', (component: any) => {
              component.set('editable', false);
            });

            // Disable editable on existing components after render
            setTimeout(() => {
              editor.getComponents().each((component: any) => {
                component.set('editable', false);
              });
            }, 100);

            // Prevent double-click from triggering RTE
            editor.on('component:dblclick', (component: any) => {
              // Prevent default double-click behavior
              return false;
            });

            // Also prevent RTE enable event
            editor.on('rte:enable', () => {
              // Prevent RTE from being enabled
              return false;
            });

            console.log('GrapesJS editor initialized:', editor);
            console.log('Editor canvas:', editor.Canvas);
            console.log('Container HTML before GrapesJS:', container.innerHTML.substring(0, 200));

            // Add custom blocks for drag and drop
            const blockManager = editor.BlockManager;

            // Text block
            blockManager.add('text-block', {
              label: 'Text',
              category: 'Basic',
              content: {
                type: 'text',
                content: 'Insert your text here',
                style: { padding: '10px' },
                editable: false, // Disable editing
              },
            });

            // Heading blocks
            blockManager.add('heading-1', {
              label: 'Heading 1',
              category: 'Typography',
              content: '<h1 style="padding: 10px;">Heading 1</h1>',
            });

            blockManager.add('heading-2', {
              label: 'Heading 2',
              category: 'Typography',
              content: '<h2 style="padding: 10px;">Heading 2</h2>',
            });

            blockManager.add('heading-3', {
              label: 'Heading 3',
              category: 'Typography',
              content: '<h3 style="padding: 10px;">Heading 3</h3>',
            });

            // Paragraph block
            blockManager.add('paragraph', {
              label: 'Paragraph',
              category: 'Typography',
              content: {
                type: 'text',
                tagName: 'p',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                style: { padding: '10px' },
                editable: false, // Disable editing
              },
            });

            // Image block
            blockManager.add('image-block', {
              label: 'Image',
              category: 'Media',
              content: {
                type: 'image',
                attributes: { src: 'https://via.placeholder.com/350x250/78c5d6/fff', alt: 'Image' },
              },
            });

            // Button block
            blockManager.add('button-block', {
              label: 'Button',
              category: 'Basic',
              content: {
                type: 'link',
                content: 'Click me',
                style: {
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px',
                },
              },
            });

            // Section block
            blockManager.add('section-block', {
              label: 'Section',
              category: 'Layout',
              content: '<div style="padding: 20px; min-height: 100px;">Section content</div>',
            });

            // Container block
            blockManager.add('container', {
              label: 'Container',
              category: 'Layout',
              content: '<div style="padding: 20px; border: 1px solid #ddd; border-radius: 4px;">Container</div>',
            });

            // Divider block
            blockManager.add('divider', {
              label: 'Divider',
              category: 'Layout',
              content: '<hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />',
            });

            // Link block
            blockManager.add('link', {
              label: 'Link',
              category: 'Basic',
              content: {
                type: 'link',
                content: 'Link text',
                attributes: { href: '#' },
              },
            });

            // Force editor to render
            editor.render();

            // Wait a bit for editor to render and verify content
            setTimeout(() => {
              const frameEl = editor.Canvas.getFrameEl();
              const frameDoc = frameEl?.contentDocument;
              console.log('Editor rendered, checking canvas:', frameEl);
              console.log('Frame document body:', frameDoc?.body?.innerHTML?.substring(0, 200));
              console.log('Components count:', editor.getComponents().length);
              setIsLoading(false);
            }, 500);
          }, 50); // Small delay to ensure DOM is ready
        }); // Close requestAnimationFrame
      } catch (error) {
        console.error('Error initializing GrapesJS editor:', error);
        message.error('Failed to initialize editor');
        setIsLoading(false);
      }
    };

    // Start initialization after a delay
    const initTimer = setTimeout(initEditor, 300);

    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      if (editorRef.current) {
        try {
          // Store reference and clear immediately to prevent re-entry
          const editor = editorRef.current;
          editorRef.current = null;

          // Use requestAnimationFrame to ensure this happens after React's cleanup
          requestAnimationFrame(() => {
            try {
              // Destroy editor after React has finished its cleanup
              if (editor && typeof editor.destroy === 'function') {
                editor.destroy();
              }
            } catch (error) {
              // Ignore errors - editor may already be destroyed
              console.warn('Editor cleanup warning:', error);
            }
          });
        } catch (error) {
          console.error('Error in cleanup function:', error);
        }
      }
    };
  }, [open, initialHtml]);

  /**
   * Handle save action
   * Extracts HTML and CSS from editor and calls onSave callback
   */
  const handleSave = () => {
    if (!editorRef.current) {
      message.warning('Editor not initialized');
      return;
    }

    try {
      const html = editorRef.current.getHtml() || '';
      const css = editorRef.current.getCss() || '';

      if (onSave) {
        onSave(html, css);
      }

      message.success('Content saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
      message.error('Failed to save content');
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    // Clean up editor reference before closing
    // The actual destruction will happen in useEffect cleanup
    if (editorRef.current) {
      const editor = editorRef.current;
      editorRef.current = null;
      // Schedule destruction after React cleanup
      setTimeout(() => {
        try {
          if (editor && typeof editor.destroy === 'function') {
            editor.destroy();
          }
        } catch (error) {
          // Ignore - may already be destroyed
        }
      }, 0);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width="95vw"
      style={{ top: 20 }}
      bodyStyle={{
        height: 'calc(100vh - 120px)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      closable={true}
      closeIcon={<CloseOutlined style={{ color: '#999' }} />}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} style={{ background: 'rgba(3, 78, 162, 1)' }}>
          Save Changes
        </Button>,
      ]}
      title="HTML & Layout Editor"
      destroyOnClose={true}
    >
      {/* Simple Toolbar */}
      <div
        style={{
          height: '50px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
          HTML & Layout Editor
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave} style={{ background: 'rgba(3, 78, 162, 1)' }}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div
        style={{
          display: 'flex',
          height: 'calc(100% - 50px)',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar - Blocks (Drag and Drop) */}
        <div
          className="blocks-container"
          style={{
            width: '250px',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
            overflow: 'auto',
            padding: '10px',
          }}
        />

        {/* Main Canvas */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            backgroundColor: '#fff',
            overflow: 'hidden',
            margin: 0,
            padding: 0,
          }}
        >
          <div
            ref={(el) => {
              innerContainerRef.current = el;
              if (el) {
                el.style.cssText = 'height: 100%; width: 100%; position: relative;';
              }
            }}
            suppressHydrationWarning
          />
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 1000,
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '16px', color: '#666' }}>Loading editor...</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

