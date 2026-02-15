import React, { useRef } from 'react';
import JoditEditor from 'jodit-react';

interface RichTextEditorProps {
  value: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editor = useRef(null);

  // const config = {
  //   readonly: false,
  //   placeholder: placeholder || 'Start typing...',
  // };
  const config = {
    readonly: false,
    placeholder: placeholder || 'Start typing...',
    height: '160px',
    minHeight: '100px',
    maxHeight: '500px',
    buttons: ['bold', 'italic', 'underline', 'strikethrough', '|', 'ul', 'ol', '|', 'outdent', 'indent', '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'image', 'table', 'link', '|', 'align', 'undo', 'redo'],
    toolbarAdaptive: false,
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    statusbar: false,
  };
  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      tabIndex={1}
      onBlur={newContent => onChange(newContent)}
      onChange={() => { }}
    />
  );
};

export default RichTextEditor;
