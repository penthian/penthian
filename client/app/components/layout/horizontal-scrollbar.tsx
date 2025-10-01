import React from 'react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

export default function HorizontalScrollContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className="w-[calc(95vw-15px)] overflow-x-auto sm:w-[calc(96vw-10px)]">
          <div className="mx-auto w-full p-1">{children}</div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="whitespace-nowrap p-1 sm:p-4 md:px-6 lg:px-8">
          {children}
        </div>
      )}
    </>
  );
}
