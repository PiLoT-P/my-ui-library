import IconButton from '@components/customComponents/uiElelments/button/IconButton';

interface BoldProps{
  updateStateContent: () => void,
}

function Bold({
  updateStateContent,
}: BoldProps) {
  const handleSetBoldText = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText.trim() || range.collapsed) return;
    const strong = document.createElement('strong');

    range.surroundContents(strong);
    updateStateContent();
  }

  return (
    <div>
      <IconButton
        icon="format-bold"
        variant="secondary"
        onClick={handleSetBoldText}
      />
    </div>
  );
}

export default Bold;
