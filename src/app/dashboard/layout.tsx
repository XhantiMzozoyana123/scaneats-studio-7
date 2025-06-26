import { BottomNav } from '@/components/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen overflow-hidden">
      {children}
      <BottomNav />
    </div>
  );
}
