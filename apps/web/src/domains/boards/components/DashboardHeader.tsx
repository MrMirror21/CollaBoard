import type { ReactNode } from 'react';

interface DashboardHeaderProps {
  title: string;
  actions: ReactNode;
}

export function DashboardHeader({ title, actions }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        {actions}
      </div>
    </header>
  );
}
