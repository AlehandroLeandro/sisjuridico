import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function ShellLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ padding: 26, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
