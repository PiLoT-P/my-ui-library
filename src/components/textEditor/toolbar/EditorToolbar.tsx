import IconButton from '@components/customComponents/uiElelments/button/IconButton';
import s from './EditorToolbar.module.scss';
import Italic from './italic/Italic';
import Bold from './bold/Bold';
import { Dispatch, memo, SetStateAction, useRef } from 'react';
import { RefObject } from '@fullcalendar/core/preact.js';
import Smile from './smile/Smile';
import UserMark from './user-mark/UserMark';
import CodeBlock from './code-block/CodeBlock';
import CreactLink from './create-link/CreactLink';
import { TextEditorOptios, TextEditorState } from '../utils/TextEditor.interface';
import { IMembersUG } from '@lib/interfaces/defaults.intefaces';

interface ToolbarProps{
  editorRef: RefObject<HTMLDivElement>,

  handleSend?: () => void,
  handleClearContent: () => void,

  handleInput: () => void,
  handleUploadFile: (selectedFiles: FileList, useInsertImg?: boolean) => void,

  options?: TextEditorOptios,
  userTag?: IMembersUG,
  setState: Dispatch<SetStateAction<TextEditorState>>

  isLoading?: boolean,
}

function EditorToolbar({
  editorRef,
  handleClearContent,
  handleSend,
  handleInput,
  handleUploadFile,
  options,
  userTag,
  setState,
  isLoading,
}: ToolbarProps){
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const { isDesabledFiles = false } = options || {};

  return (
    <div 
      ref={toolbarRef}
      className={s.container}
    >
      <ul className={s.tools_list}>
        <li className={s.item}>
          <Smile
            editorRef={editorRef}
            toolbarRef={toolbarRef}
            updateStateContent={handleInput}
          />
        </li>
        <li className={s.item}>
          <UserMark
            editorRef={editorRef}
            toolbarRef={toolbarRef}
            userTag={userTag}
            setState={setState}
            updateStateContent={handleInput}
          />
        </li>
        <li className={s.item}>
          <CodeBlock
            editorRef={editorRef}
            updateStateContent={handleInput}
          />
        </li>
        <li className={s.item}><CreactLink updateStateContent={handleInput}/></li> 
        <li className={s.item}><Bold updateStateContent={handleInput}/></li>
        <li className={s.item}><Italic updateStateContent={handleInput}/></li>
        {!isDesabledFiles &&
          <li className={s.item}>
            <IconButton
              icon='attach-file'
              onFileSelect={(files) => {
                handleUploadFile(files, false);
              }}
              className={s.toolbar_btn}
              disabled={isLoading}
            />
          </li>
        }
      </ul>
      <div className={s.actions_block}>
        <IconButton
          icon='cancel'
          variant='secondary'
          onClick={handleClearContent}
          disabled={isLoading}
        />
        {handleSend &&
          <IconButton
            icon='send'
            onClick={handleSend}
            disabled={isLoading}
          />
        }
      </div>
    </div>
  );
}

export default memo(EditorToolbar);