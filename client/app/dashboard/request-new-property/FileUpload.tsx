'use client';

import Image from 'next/image';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export type ImgItem = File | string;

interface FileUploadProps {
  setImageFiles: Dispatch<SetStateAction<ImgItem[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ setImageFiles }) => {
  const onDrop = useCallback((accepted: File[]) => {
    setImageFiles(prev => [...prev, ...accepted]);
  }, [setImageFiles]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 3 * 1024 * 1024,
  });

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Upload Images</h3>
      <div
        {...getRootProps()}
        className="w-full border border-dashed rounded h-40 flex flex-col items-center justify-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <Image src="/assets/icons/fileupload.svg" alt="upload" width={24} height={24} />
        <p className="mt-2 text-sm">
          <span className="text-blue-600 underline">Click to upload</span> or drag & drop
        </p>
      </div>
    </div>
  );
};

export default FileUpload;

interface FilePreviewProps {
  imageFiles: ImgItem[];
  setImageFiles: Dispatch<SetStateAction<ImgItem[]>>;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ imageFiles, setImageFiles }) => {
  const removeAt = (i: number) => {
    setImageFiles(files => files.filter((_, idx) => idx !== i));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {imageFiles.map((item, i) => {
        const src = typeof item === 'string'
          ? item
          : URL.createObjectURL(item);

        return (
          <div key={i} className="border rounded p-2 flex flex-col items-center">
            <Image
              src={src}
              alt={`Preview ${i}`}
              width={200}
              height={200}
              className="object-cover rounded-lg"
            />
            <button onClick={() => removeAt(i)} className="text-red-500 text-xs mt-2">
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
};
