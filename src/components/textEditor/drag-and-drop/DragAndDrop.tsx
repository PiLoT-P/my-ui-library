import { ReactNode, useState } from 'react';
import s from './DragAndDrop.module.scss';

interface DragAndDropProps {
  onDropFiles: (files: FileList) => void;
  children: ReactNode;
  fullWidth: boolean,
}

function DragAndDrop({
  onDropFiles,
  children,
  fullWidth,
}: DragAndDropProps){
  const [isDragActive, setIsDragActive] = useState(false);
  const [_, setDragCounter] = useState(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((c) => c + 1);
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((c) => {
      const next = c - 1;
      if (next === 0) setIsDragActive(false);
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragActive(false);
    setDragCounter(0);

    const files = e.dataTransfer.files;
    console.log('files: ', files)
    if (files.length) {
      onDropFiles(files);
    }
  }

  return (
    <div
      className={`${s.container}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        maxWidth: fullWidth ? 'auto' : '700px',
      }}
    >
      {children}

      {isDragActive && (
        <div className={s.overlay}>
          <p>Відпустіть файли тут</p>
        </div>
      )}
    </div>
  );
}

export default DragAndDrop;