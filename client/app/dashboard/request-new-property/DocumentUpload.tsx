'use client';

import { Dispatch, SetStateAction, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { File as FileIcon } from 'lucide-react';

export type DocItem = File | { fileName: string; url: string };

interface DocumentUploadProps {
    setFiles: Dispatch<SetStateAction<DocItem[]>>;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ setFiles }) => {
    const onDrop = useCallback((accepted: File[]) => {
        setFiles(prev => [...prev, ...accepted]);
    }, [setFiles]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 10 * 1024 * 1024,
    });

    return (
        <div>
            <h3 className="text-xl font-medium mb-4">Upload Documents</h3>
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

export default DocumentUpload;

interface DocumentPreviewProps {
    files: DocItem[];
    setFiles: Dispatch<SetStateAction<DocItem[]>>;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ files, setFiles }) => {
    const removeAt = (i: number) => {
        setFiles(prev => prev.filter((_, idx) => idx !== i));
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {files.map((item, i) => {
                if (item instanceof File) {
                    return (
                        <div key={i} className="border rounded p-2 flex flex-col items-center">
                            <FileIcon size={20} />
                            <p className="text-sm mt-2 text-center break-words">{item.name}</p>
                            <button onClick={() => removeAt(i)} className="text-red-500 text-xs mt-2">
                                Remove
                            </button>
                        </div>
                    );
                } else {
                    return (
                        <div key={i} className="border rounded p-2 flex flex-col items-center">
                            <FileIcon size={20} />
                            <a href={item.url} target="_blank" rel="noreferrer" className="underline text-sm text-center">
                                {item.fileName}
                            </a>
                            <button onClick={() => removeAt(i)} className="text-red-500 text-xs mt-2">
                                Remove
                            </button>
                        </div>
                    );
                }
            })}
        </div>
    );
};
