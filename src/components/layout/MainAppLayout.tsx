import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainAppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string; // Optional, can be derived or have a default
  initialSidebarOpen?: boolean;
  activePath?: string; // For highlighting active sidebar item
}

const MainAppLayout: React.FC<MainAppLayoutProps> = ({
  children,
  pageTitle = 'Dashboard Overview',
  initialSidebarOpen = true,
  activePath = '/', // Default active path
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(initialSidebarOpen);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className={cn('min-h-screen bg-background flex', {
      // This approach allows the main content area to adjust its margin
      // if sidebar was absolutely positioned or had dynamic width classes
      // For grid, it's simpler: grid columns define width.
    })}>
      <Sidebar isOpen={isSidebarOpen} activePath={activePath} className="h-screen" />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <Header onToggleSidebar={toggleSidebar} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainAppLayout;
