// LandingPageContainer.tsx

import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

const LandingPageContainer = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        'mx-auto w-full xl:w-[1200px] px-2 sm:px-4 lg:px-8 2xl:w-[1366px] 3xl:w-[1440px]',
        className
      )}
    >
      {children}
    </div>
  );
};

export default LandingPageContainer;
  