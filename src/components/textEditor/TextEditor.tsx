import { memo, useEffect, useRef, useState } from 'react';
import { cleanHTML, createQuoteHTML, createScreenshotHTML, insertHtmlAtCursor, moveCursorToEnd, updateEmptyState } from './utils/utils-functions';
import LoaderMUI from '../loaderMUI/LoaderMUI';
import { fetchUploadFile, fetchUploadFiles } from '@lib/requests/disc.requests';
import { TextEditorProps } from './utils/TextEditor.interface';
import DragAndDrop from './drag-and-drop/DragAndDrop';
import { IDefaultFile } from '@lib/interfaces/defaults.intefaces';
import EditorFilesList from './files-list/EditorFilesList';
//styles
import s from './TextEditor.module.scss';
import './TextEditorDefaultStyles.scss';
import EditorToolbar from './toolbar/EditorToolbar';

function TextEditor({
  state,
  setState,
  handleSend,
  update,
  options,
  editorAttributes,
  handleCancel,
}: TextEditorProps){
  const editorRef = useRef<HTMLDivElement | null>(null);

  const { html, files, quote, userTag } = state;
  const { 
    placeholder = 'Напишіть повідомлення...', 
    fullWidth = false, 
    blockHeight = 350,
  } = options || {};

  const setHtml = (el: string) => setState((prev) => ({...prev, html: el}));

  const [unwrap, setUnwrap] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // При монтованні встановлюємо html і placeholder
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = html;
    updateEmptyState(editorRef.current);
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;

    setHtml(newHtml);
    updateEmptyState(editorRef.current);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const clipboardItems = Array.from(e.clipboardData.items);
    let htmlContent = e.clipboardData.getData('text/html');
    const textContent = e.clipboardData.getData('text/plain');

    // Вставка тексту/HTML
    const content = htmlContent || textContent;
    if (content && editorRef.current) {
      const sanitized = cleanHTML(content);
      insertHtmlAtCursor(editorRef.current ,sanitized);
      handleInput();
    }

    // Обробка картинок (скріншотів)
    for (const item of clipboardItems){
      if (item.type.startsWith('image/')){
        const file = item.getAsFile();
        if (!file) continue;

        setIsLoading(true);
        fetchUploadFile(file).then((files) => {
          const firstFile = files[0]
          const imgHtml = createScreenshotHTML(firstFile, true);
          
          editorRef.current && insertHtmlAtCursor(editorRef.current, imgHtml);
          handleInput();
        }).finally(() => setIsLoading(false))
      }
    }
  };
  
  // Цитування повідомлень
  useEffect(() => {
    if(quote && editorRef.current){
      const quoteHtml = createQuoteHTML(quote.author, quote.content);
      const newContent = `${editorRef.current.innerHTML}<br/>${quoteHtml}`;

      editorRef.current.innerHTML = newContent;
      
      setTimeout(() => {
        handleInput();
      },0);

      moveCursorToEnd(editorRef.current);
      setState((prev) => ({...prev, quote: undefined}))
    }
  }, [quote])
  // ------

  // Вставка зображення в редактор
  const insertImageToEditor = (file: IDefaultFile) => {
    if(!editorRef.current) return;

    const html = createScreenshotHTML({
      id: file.fileGuid,
      name: file.name
    }, true);

    insertHtmlAtCursor(editorRef.current, html);
    handleInput();
  }

  // Завантаження файлів
  const handleUploadFiles = (selectedFiles: FileList, useInsertImg?: boolean) => {
    setIsLoading(true);
    fetchUploadFiles(selectedFiles).then((newFiles) => {
      const reformatFiles: IDefaultFile[] = newFiles.map((el, index) => ({ fileGuid: el.id, format: el.mime, name: el.name, id: -index }))

      if(useInsertImg){
        const imageFiles = reformatFiles.filter(file => 
          file.format.startsWith('image/')
        );

        const otherFiles = reformatFiles.filter(file => 
          !file.format.startsWith('image/')
        );

        imageFiles.forEach(file => {
          insertImageToEditor(file);
        });

        if (otherFiles.length) {
          setState((prev) => ({...prev, files: [...prev.files || [], ...otherFiles]}))
        }
      }else{
        setState((prev) => ({...prev, files: [...prev.files || [], ...reformatFiles]}))
      }

    }).finally(() => setIsLoading(false))
  }

  // Оновлення
  useEffect(() => {
    const { idUpdateElement } = update;
    if(idUpdateElement && editorRef.current){
      setUnwrap(true);

      editorRef.current.innerHTML = html,

      setTimeout(() => {
        handleInput();
      },0)

      editorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  },[update.idUpdateElement])

  // Очищення
  const handleClearContent = () => {
    if(editorRef.current){
      editorRef.current.innerText = '';
      handleInput();
    
      setState({
        html: '',
        files: undefined,
        quote: undefined,
        tagUsers: undefined,
      })

      handleCancel?.();
      // setUnwrap(false);
    }
  }

  // Очистка при ресеті
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== state.html) {
      editorRef.current.innerHTML = state.html;
      
      handleInput();
    }
  }, [state.html]);

  // Скрол і фокус, щоб створився тег
  useEffect(() => {
    if(userTag && editorRef.current){
      editorRef.current.focus();

      editorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  },[userTag])

  return (
    <DragAndDrop
      onDropFiles={(selectedFiles) => handleUploadFiles(selectedFiles, true)}
      fullWidth={fullWidth}
    >
      {isLoading && <LoaderMUI/>}
      <div
        ref={editorRef}
        role="textbox"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className={`${s.editor} ${s.empty} ${unwrap ? s.opened : ''}`}
        onFocus={() => { if(!unwrap) setUnwrap(true) }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        style={{
          minHeight: unwrap ? `${blockHeight}px` : '20px',
          maxHeight: unwrap ? `${blockHeight}px` : '20px',
        }}
        {...editorAttributes}
      />
      {unwrap &&
        <EditorToolbar
          editorRef={editorRef}
          handleClearContent={() => {
            handleClearContent();
            setUnwrap(false);
          }}
          handleSend={handleSend ? () => {handleSend(state, update.idUpdateElement)} : undefined}
          handleInput={handleInput}
          handleUploadFile={handleUploadFiles}
          options={options}
          userTag={userTag}
          setState={setState}
          isLoading={isLoading}
        />
      }
      {unwrap &&
        <EditorFilesList
          files={files}
          setState={setState}
        />
      }
    </DragAndDrop>
  );
}

export default memo(TextEditor);