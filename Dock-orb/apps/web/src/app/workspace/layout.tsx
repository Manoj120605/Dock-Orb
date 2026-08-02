import { Sidebar } from "@/components/layout/Sidebar";
import { ChatHeader } from "@/components/layout/Header";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
