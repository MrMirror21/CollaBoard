import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function PageLayout() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}
