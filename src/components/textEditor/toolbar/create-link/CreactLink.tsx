import PopperjsPortalBox from '@components/customComponents/portals/popperjs-portal-box/PopperjsPortalBox';
import Button from '@components/customComponents/uiElelments/button/Button';
import IconButton from '@components/customComponents/uiElelments/button/IconButton';
import TextInput from '@components/customComponents/uiElelments/textInput/TextInput';
import { FormEvent, useRef, useState } from 'react';
import s from './CreactLink.module.scss';
import { createEditorLink } from '../../utils/utils-functions';

interface CreactLinkPops{
  updateStateContent: () => void,
}

function CreactLink({
  updateStateContent,
}: CreactLinkPops) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [selectedText, setSelectedText] = useState<string>('');
  const [link, setLink] = useState<string>('');

  const containerRef = useRef<HTMLSpanElement | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLink = createEditorLink(link, selectedText);

    if (containerRef.current) {
      const temp = document.createElement('div');
      temp.innerHTML = newLink;
      const anchor = temp.firstChild as HTMLElement;

      if (anchor) {
        containerRef.current.replaceWith(anchor);
        updateStateContent();
      }

      containerRef.current = null;
    }

    setIsOpen(false);
    setLink('');
    setSelectedText('');
  }

  const handleCreateSpanForLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const editorSelectedText = selection.toString();

    if (!editorSelectedText.trim() || range.collapsed) return;

    const span = document.createElement('span');
    const id = 'link-selection';
    span.dataset.refId = id;

    range.surroundContents(span);

    containerRef.current = span;
    setSelectedText(editorSelectedText);
    setIsOpen(true);
  }

  const handleClose = () => {
    setIsOpen(false);

    if (containerRef.current) {
      const textNode = document.createTextNode(selectedText);
      containerRef.current.replaceWith(textNode);
      containerRef.current = null;
    }
  }

  return (
    <div>
      <IconButton
        icon="link"
        onClick={handleCreateSpanForLink}
        variant="secondary"
      />
      {isOpen && (
        <PopperjsPortalBox
          containerRef={containerRef}
          handleClose={handleClose}
        >
          <form
            onSubmit={handleSubmit}
            className={s.form_block}
          >
            <TextInput
              value={selectedText}
              onChange={(e) => { setSelectedText(e.target.value) }}
              placeholder="Введіть текст"
            />
            <TextInput
              value={link}
              onChange={(e) => { setLink(e.target.value) }}
              placeholder="Введіть посилання"
            />
            <Button
              type="submit"
            >
              Створити посилання
            </Button>
          </form>
        </PopperjsPortalBox>
      )}
    </div>
  );
}

export default CreactLink;
