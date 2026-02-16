import React, { useRef } from 'react';
import JoditEditor from 'jodit-react';

interface RichTextEditorProps {
  value: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
  height?: string | number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  height = '160px',
}) => {
  const editor = useRef(null);

  const normalizedHeight =
    typeof height === 'number' ? `${height * 40}px` : height;

  const config = {
    readonly: false,
    placeholder: placeholder || 'Start typing...',
    height: normalizedHeight,
    minHeight: '100px',
    maxHeight: '500px',
    buttons: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'ul',
      'ol',
      '|',
      'outdent',
      'indent',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'image',
      'table',
      'link',
      '|',
      'align',
      'undo',
      'redo',
    ],
    toolbarAdaptive: false,
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    statusbar: false,
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus-within:ring-2 focus-within:ring-[#0066CC] focus-within:border-transparent transition-shadow">
      <style>{`
        /* === BASE EDITOR === */
        .jodit-container {
          background: transparent !important;
          border: none !important;
        }

        .jodit-workplace {
          background: transparent !important;
        }

        .jodit-wysiwyg {
          background: transparent !important;
          color: #111827 !important;
          font-size: 0.875rem !important;
          line-height: 1.65 !important;
          padding: 12px !important;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        /* === PARAGRAPH === */
        .jodit-wysiwyg p {
          margin: 0.6rem 0;
        }

        /* === HEADINGS === */
        .jodit-wysiwyg h1 { font-size: 1.75rem; font-weight: 700; margin: 1.4rem 0 0.8rem; }
        .jodit-wysiwyg h2 { font-size: 1.5rem; font-weight: 700; margin: 1.2rem 0 0.7rem; }
        .jodit-wysiwyg h3 { font-size: 1.3rem; font-weight: 600; margin: 1rem 0 0.6rem; }
        .jodit-wysiwyg h4 { font-size: 1.1rem; font-weight: 600; margin: 0.9rem 0 0.5rem; }
        .jodit-wysiwyg h5 { font-size: 1rem; font-weight: 600; margin: 0.8rem 0 0.4rem; }
        .jodit-wysiwyg h6 { font-size: 0.9rem; font-weight: 600; margin: 0.7rem 0 0.3rem; }

        /* === LISTS === */
        .jodit-wysiwyg ul {
          list-style-type: disc !important;
          padding-left: 1.6rem !important;
          margin: 0.6rem 0;
        }

        .jodit-wysiwyg ol {
          list-style-type: decimal !important;
          padding-left: 1.6rem !important;
          margin: 0.6rem 0;
        }

        .jodit-wysiwyg ul ul { list-style-type: circle !important; }
        .jodit-wysiwyg ul ul ul { list-style-type: square !important; }

        .jodit-wysiwyg li {
          margin: 0.3rem 0;
        }

        /* === LINKS === */
        .jodit-wysiwyg a {
          color: #2563eb;
          text-decoration: underline;
          font-weight: 500;
        }

        /* === BLOCKQUOTE === */
        .jodit-wysiwyg blockquote {
          border-left: 4px solid #3b82f6;
          padding: 0.5rem 1rem;
          background: #eff6ff;
          margin: 0.8rem 0;
          border-radius: 4px;
        }

        /* === CODE === */
        .jodit-wysiwyg code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .jodit-wysiwyg pre {
          background: #0f172a;
          color: #e5e7eb;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 0.8rem 0;
        }

        /* === TABLE === */
        .jodit-wysiwyg table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.8rem 0;
        }

        .jodit-wysiwyg th,
        .jodit-wysiwyg td {
          border: 1px solid #e5e7eb;
          padding: 8px 10px;
        }

        .jodit-wysiwyg th {
          background: #f9fafb;
          font-weight: 600;
        }

        /* === TOOLBAR === */
        .jodit-toolbar {
          background: transparent !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        .jodit-toolbar__box {
          background: transparent !important;
        }
      `}</style>

      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => onChange(newContent)}
        onChange={() => { }}
      />
    </div>
  );
};

export default RichTextEditor;
