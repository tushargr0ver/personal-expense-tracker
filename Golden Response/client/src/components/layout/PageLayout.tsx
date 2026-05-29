import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

import { Outlet } from 'react-router-dom';

interface PageLayoutProps {
  title?: string;
}

export default function PageLayout({ title }: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-[280px]">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mx-auto max-w-7xl animate-fade-in"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
