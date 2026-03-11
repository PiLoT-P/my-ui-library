import PopperjsPortalBox from '@components/customComponents/portals/popperjs-portal-box/PopperjsPortalBox';
import IconButton from '@components/customComponents/uiElelments/button/IconButton';
import { RefObject } from '@fullcalendar/core/preact.js';
import EmojiPicker from 'emoji-picker-react';
import { useState } from 'react';
import { createEmogiIcon } from '../../utils/utils-functions';
interface SmileProps{
  editorRef: RefObject<HTMLDivElement>,
  toolbarRef: RefObject<HTMLDivElement>,
  updateStateContent: () => void,
}

function Smile({
  toolbarRef,
  editorRef,
  updateStateContent,
}: SmileProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div>
      <IconButton
        icon='smile-face'
        variant="secondary"
        onClick={() => { setIsOpen(true) }}
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
          <EmojiPicker
            onEmojiClick={(param) => {
              if (editorRef.current) {
                editorRef.current.innerHTML += createEmogiIcon(param.imageUrl, param.names[0]);
                updateStateContent();
              }
            }}
          />
        </PopperjsPortalBox>
      )}
    </div>
  );
}

export default Smile;
