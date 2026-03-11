import IconButton from '@components/customComponents/uiElelments/button/IconButton';

interface ItalicProps{
  updateStateContent: () => void,
}

function Italic({
  updateStateContent,
}:ItalicProps) {
  const handleSetItalicText = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText.trim() || range.collapsed) return;
    const italic = document.createElement('i');

    range.surroundContents(italic);
    updateStateContent();
  }

  return (
    <div>
      <IconButton
        icon="format-italic"
        variant="secondary"
        onClick={handleSetItalicText}
      />
    </div>
  );
}

export default Italic;
