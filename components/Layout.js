import Sidebar from "./Sidebar";
import { useState, createContext, useContext } from "react";

// Context untuk mengelola state sidebar
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            isCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <main className="h-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
