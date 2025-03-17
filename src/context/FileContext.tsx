import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileUpload {
  file: File;
  progress: number;
  status: 'Ready' | 'uploading' | 'success' | 'error' | 'processing';
  name?: string;
}

interface TranscriptResponse {
  filename: string;
  transcript: string | null;
  transcript_file: string;
  status: 'processing' | 'completed' | 'error';
}

interface FileContextType {
  files: FileUpload[];
  setFiles: React.Dispatch<React.SetStateAction<FileUpload[]>>;
  transcripts: TranscriptResponse[];
  setTranscripts: React.Dispatch<React.SetStateAction<TranscriptResponse[]>>;
  filesUploaded: boolean;
  setFilesUploaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useUpload must be used within a FileProvider');
  }
  return context;
};

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileUpload[]>(() => {
    const savedFiles = localStorage.getItem('uploadFiles');
    if (savedFiles) {
      return JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        file: new File([], file.name || file.file.name, { type: file.file.type }),
      }));
    }
    return [];
  });

  const [transcripts, setTranscripts] = useState<TranscriptResponse[]>(() => {
    const savedTranscripts = localStorage.getItem('uploadTranscripts');
    return savedTranscripts ? JSON.parse(savedTranscripts) : [];
  });

  const [filesUploaded, setFilesUploaded] = useState<boolean>(() => {
    const savedFilesUploaded = localStorage.getItem('filesUploaded');
    return savedFilesUploaded ? JSON.parse(savedFilesUploaded) : false;
  });

  useEffect(() => {
    localStorage.setItem('uploadFiles', JSON.stringify(files.map(file => ({
      ...file,
      file: { name: file.file.name, type: file.file.type },
    }))));
    localStorage.setItem('uploadTranscripts', JSON.stringify(transcripts));
    localStorage.setItem('filesUploaded', JSON.stringify(filesUploaded));
    console.log('FileContext state updated:', { files, transcripts, filesUploaded });
  }, [files, transcripts, filesUploaded]);

  return (
    <FileContext.Provider value={{ files, setFiles, transcripts, setTranscripts, filesUploaded, setFilesUploaded }}>
      {children}
    </FileContext.Provider>
  );
};
