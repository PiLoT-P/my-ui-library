import { IDefaultFile } from '@lib/interfaces/defaults.intefaces';
import s from './EditorFilesList.module.scss';
import { Dispatch, memo, SetStateAction } from 'react';
import { TextEditorState } from '../utils/TextEditor.interface';
import Icon from '@components/customComponents/uiElelments/icon-display/Icon';
import { urlForFileServer } from '@lib/requests/disc.requests';
import IconButton from '@components/customComponents/uiElelments/button/IconButton';

interface EditorFilesListProps{
  files?: IDefaultFile[]
  setState: Dispatch<SetStateAction<TextEditorState>>
}

function EditorFilesList({
  files,
  setState,
}: EditorFilesListProps){
  if(!files || !files.length) return;

  const handleDeleteFile = (id: number) => {
    setState((prev) => ({
      ...prev,
      files: prev.files?.filter((el) => el.id !== id)
    }))
  }

  return (
    <div className={s.container}>
      <ul className={s.list}>
        {files.map((file, index) => {
          const isImg = file.format.includes('image');
          return (
            <li 
              key={index}
              className={s.item}
              title={decodeURIComponent(file.name)}
            >
              <div className={s.actions}>
                <IconButton
                  icon='magic-wand'
                  variant='transparent'
                />
                <IconButton
                  icon='cancel'
                  variant='transparent'
                  onClick={() => {handleDeleteFile(file.id)}}
                />
              </div>
              {!isImg && <Icon name='file-empty' width={30} height={30}/>}
              {isImg &&
                <img 
                  src={urlForFileServer(file.fileGuid)} 
                  className={s.file_img}
                  alt={file.name} 
                />
              }
              <p className={s.name}>{decodeURIComponent(file.name)}</p>
            </li>
          );
        })}
      </ul>
    </div>  
  );
}

export default memo(EditorFilesList);