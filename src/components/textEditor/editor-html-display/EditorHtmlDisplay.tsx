import { CSSProperties, MouseEvent, useEffect, useRef, useState } from 'react';
import s from './EditorHtmlDisplay.module.scss';
import { useUserInfoSidebar } from '@components/providers/userInfoProvider/userInfoProvider';
import { urlForFileServer } from '@lib/requests/disc.requests';
import { useGlobalViewer } from '@components/providers/globalViewerProvider/GlobalViewerProvider';
import { parseContentToHTML } from './utils/utils-functions';

interface EditorHtmlDisplayProps {
  content: string,
  
  styles?: CSSProperties;
  className?: string;

  isNestedModal?: boolean,

  handleCreateQuoteContent?: (content: string) => void;
}

function EditorHtmlDisplay({
  content,
  isNestedModal = false,
  className,
  styles,
  handleCreateQuoteContent,
}: EditorHtmlDisplayProps){
  const { openSidebar } = useUserInfoSidebar();
  const { openViewer } = useGlobalViewer();

  const blockRef = useRef<HTMLDivElement | null>(null);
  const quoteButtonRef = useRef<HTMLButtonElement | null>(null);

  const [quoteButtonVisible, setQuoteButtonVisible] = useState(false);
  const [quoteButtonPosition, setQuoteButtonPosition] = useState({ top: 0, left: 0 });
  const [quoteText, setQuoteText] = useState('');
  
  const handleClickInBlock = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    const target = e.target as HTMLElement;
    const isUserLink = target.tagName === 'A' && target.classList.contains('user-marker');
    const isScreenshot = target.tagName === 'IMG' && target.classList.contains('screenshot');

    if(isUserLink){
      e.preventDefault();
      const userId = target.getAttribute('data-user-id');
      userId && openSidebar(Number(userId), isNestedModal);
    }
    
    if(isScreenshot){
      e.preventDefault();
      const { src, alt: name } = target as HTMLImageElement;
      const fileGuid = src.replace(urlForFileServer(''), '');

      if(fileGuid.length){
        openViewer('gallery', {
          currentImage: {fileGuid, index: 0, name },
          images: [{fileGuid, name}],
        })
      }
    }
  }

  // Цитування
  useEffect(() => {
    if(!handleCreateQuoteContent || !blockRef.current) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        setQuoteButtonVisible(false);
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setQuoteButtonVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const parentRect = blockRef.current!.getBoundingClientRect();

      setQuoteText(text);
      
      setQuoteButtonPosition({
        top: rect.top - parentRect.top - 30,
        left: rect.left - parentRect.left,
      });

      setQuoteButtonVisible(true);
    }

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;

      if (
        !blockRef.current?.contains(target) &&
        !quoteButtonRef.current?.contains(target)
      ) {
        setQuoteButtonVisible(false);
      }
    };

    const el = blockRef.current;
    
    el.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      el.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  },[handleCreateQuoteContent])
  /* ----- */

  const handleQuoteClick = () => {
    if (handleCreateQuoteContent && quoteText) {
      handleCreateQuoteContent(quoteText);
    }
    setQuoteButtonVisible(false);
    window.getSelection()?.removeAllRanges(); // прибираємо виділення
  };

  return (
    <div className={s.wrapper}>
      <div
        ref={blockRef}
        className={`${className} ${s.text_display}`}
        style={{ ...styles }}
        dangerouslySetInnerHTML={{ __html: parseContentToHTML(content) }}
        onClick={handleClickInBlock}
      />
      {quoteButtonVisible &&
        <button
          type='button'
          ref={quoteButtonRef}
          style={{
            position: 'absolute',
            top: quoteButtonPosition.top,
            left: quoteButtonPosition.left,
            zIndex: 10,
          }}
          onClick={handleQuoteClick}
          className={s.quote_btn}
        >
          Цитувати
        </button>
      }
    </div>
  );
}

export default EditorHtmlDisplay;