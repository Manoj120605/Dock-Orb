import { Sidebar } from "@/components/layout/Sidebar";
import { ChatHeader } from "@/components/layout/Header";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="workspace-shell flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        <main className="workspace-grid flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
