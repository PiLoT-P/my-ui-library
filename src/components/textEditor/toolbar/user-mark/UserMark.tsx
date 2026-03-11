import PopperjsPortalBox from '@components/customComponents/portals/popperjs-portal-box/PopperjsPortalBox';
import IconButton from '@components/customComponents/uiElelments/button/IconButton';
import { RefObject } from '@fullcalendar/core/preact.js';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { IMembersUG } from '@lib/interfaces/defaults.intefaces';
import { createUserLink, moveCursorToEnd } from '../../utils/utils-functions';
import EditorUsersList from './users-list/EditorUsersList';
import { TextEditorState } from '../../utils/TextEditor.interface';

interface UserMarkPorps {
  userTag?: IMembersUG,

  editorRef: RefObject<HTMLDivElement>,
  toolbarRef: RefObject<HTMLDivElement>,

  updateStateContent: () => void,
  
  setState: Dispatch<SetStateAction<TextEditorState>>
}

function UserMark({
  editorRef,
  toolbarRef,
  userTag,
  updateStateContent,
  setState
}: UserMarkPorps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleKeyUp = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const offset = range.startOffset;

    if (container.nodeType === Node.TEXT_NODE && offset > 0) {
      const text = container.textContent || '';
      const charBefore = text[offset - 1];

      if (charBefore === '+') {
        setIsOpen(true);
        // Потрібно повне відображення, для появи попапу
        if (editorRef.current) {
          editorRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }
    }
  }

  const handleAddUserMarker = useCallback((link: string, user?: IMembersUG) => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      const plusIndex = currentHTML.lastIndexOf('+');
      let newText = currentHTML;

      if (plusIndex !== -1) {
        newText = currentHTML.slice(0, plusIndex) + link + currentHTML.slice(plusIndex + 1);
      } else {
        newText = currentHTML + link;
      }

      editorRef.current.innerHTML = newText;
      updateStateContent();
      moveCursorToEnd(editorRef.current);
      /* Додавання користувача в масив тегів */
      if (user) setState((prev) => ({...prev, tagUsers: [...prev.tagUsers || [], user]}));
    }
    setIsOpen(false);
  }, [ updateStateContent, editorRef ])

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.addEventListener('keyup', handleKeyUp);
    return () => editor.removeEventListener('keyup', handleKeyUp);
  }, [editorRef])

  useEffect(() => {
    if(userTag){
      const [lastName, firstName] = userTag.name.split(' ');
      const buttonHTML = createUserLink({...userTag, lastName, firstName});

      handleAddUserMarker(buttonHTML, userTag);
      setState((prev) => ({...prev, userTag: undefined}))
    }
  },[userTag])

  return (
    <div>
      <IconButton
        onClick={() => { setIsOpen(true) }}
        icon='email'
        variant="secondary"
      />
      {isOpen && (
        <PopperjsPortalBox
          containerRef={toolbarRef}
          handleClose={() => { setIsOpen(false) }}
          disabledMinWidth
          style={{
            overflow: 'visible',
            padding: '0px',
          }}
        >
          <EditorUsersList
            addUserMarker={handleAddUserMarker}
            closeModal={() => setIsOpen(false)}
          />
        </PopperjsPortalBox>
      )}
    </div>
  );
}

export default UserMark;
