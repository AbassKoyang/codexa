import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import { TabProvider } from "@/contexts/TabContext";
import { FileTreeProvider } from "@/contexts/FileTreeContext";
import { LeftPanelProvider, RightPanelProvider, BottomPanelProvider } from "@/contexts/LayoutContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import KeybindingsListener from "@/components/KeybindingsListener";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
    <section className="flex flex-col h-screen overflow-hidden bg-tokyo-bg text-tokyo-fg">
        <FileTreeProvider>
          <LeftPanelProvider>
            <RightPanelProvider>
              <BottomPanelProvider>
                <TabProvider>
                  <KeybindingsListener />
                  <Header />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-auto bg-tokyo-bg">
                      {children}
                    </main>
                    <RightPanel />
                  </div>
                </TabProvider>
              </BottomPanelProvider>
            </RightPanelProvider>
          </LeftPanelProvider>
        </FileTreeProvider>
    </section>
  </ProtectedRoute>

  )
}

export default layout