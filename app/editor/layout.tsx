import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import { TabProvider } from "@/contexts/TabContext";
import { FileTreeProvider } from "@/contexts/FileTreeContext";
import { LeftPanelProvider, RightPanelProvider, BottomPanelProvider } from "@/contexts/LayoutContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import KeybindingsListener from "@/components/KeybindingsListener";
import { PyodideProvider } from "@/contexts/PyodideContext";
import Terminal from "@/components/Terminal";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
    <section className="flex flex-col h-screen overflow-hidden bg-tokyo-bg text-tokyo-fg">
        <FileTreeProvider>
          <PyodideProvider>
            <LeftPanelProvider>
            <RightPanelProvider>
              <BottomPanelProvider>
                <TabProvider>
                  <KeybindingsListener />
                  <Header />
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-tokyo-bg relative">
                      <div className="flex-1 overflow-auto bg-tokyo-bg">
                        {children}
                      </div>
                      <Terminal />
                    </main>
                    <RightPanel />
                  </div>
                </TabProvider>
              </BottomPanelProvider>
            </RightPanelProvider>
          </LeftPanelProvider>
          </PyodideProvider>
        </FileTreeProvider>
    </section>
  </ProtectedRoute>

  )
}

export default layout