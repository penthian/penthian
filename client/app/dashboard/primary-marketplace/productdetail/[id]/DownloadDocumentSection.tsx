import React, { useState } from 'react';
import { ArrowDownToLine, DownloadIcon, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/app/components/ui/drop-down';

type DownloadDocumentsProps = {
  documents: { fileName: string; url: string }[];
};

const DownloadDocuments = ({ documents = [] }: DownloadDocumentsProps) => {
  // State to track which document (by index) is currently downloading.
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // Client-side function to download the file as a Blob
  const handleDownload = async (
    fileUrl: string,
    fileName: string,
    index: number
  ) => {
    try {
      // Set loading for the clicked button.
      setDownloadingIndex(index);

      // Fetch the file.
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Convert response to a Blob.
      const blob = await response.blob();

      // Create a temporary URL for the Blob.
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element.
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;

      // Trigger the download.
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the object URL.
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.log("Error downloading file: ", error);
    } finally {
      // Reset loading state regardless of success or failure.
      setDownloadingIndex(null);
    }
  };

  if (documents.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='flex w-full justify-between items-center gap-2 text-grey-6 text-base font-medium'>
        Confidential Documents
        <ArrowDownToLine className='h-8 3xl:h-10 w-8 3xl:w-10 p-1 border rounded-full' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='max-w-80'>
        {documents &&
          documents.map((doc, index) => (
            <DropdownMenuItem
              key={index}
              disabled={downloadingIndex === index}
              onClick={() => handleDownload(doc.url, doc.fileName, index)}
              className={cn(`cursor-pointer`, downloadingIndex === index ? 'opacity-50' : 'hover:bg-white/60')}
            >
              <>
                {doc.fileName}
                {/* <DownloadIcon /> */}
                {downloadingIndex === index && <LoaderCircle size={20} className='animate-spin' />}
              </>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadDocuments;
