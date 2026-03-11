import IconButton from '@components/customComponents/uiElelments/button/IconButton';
import { RefObject } from '@fullcalendar/core/preact.js';
import { createCodeBlock, moveCursorToEnd } from '../../utils/utils-functions';

interface CodeBlockProps{
  editorRef: RefObject<HTMLDivElement>,
  updateStateContent: () => void,
}

function CodeBlock({
  editorRef,
  updateStateContent,
}: CodeBlockProps) {
  const handleInsertCodeBlock = () => {
    if (editorRef.current) {
      const newCode = createCodeBlock();
      editorRef.current.innerHTML += newCode.trim();
      updateStateContent();
      moveCursorToEnd(editorRef.current);
    }
  };

  return (
    <div>
      <IconButton
        onClick={handleInsertCodeBlock}
        icon='code'
        variant="secondary"
      />
    </div>
  );
}

export default CodeBlock;
