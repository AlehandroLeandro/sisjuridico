import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/ui/ui.css";
import "./index.css";
import App from "./App.tsx";

async function prepare() {
  // Backend work (CORS, pagination, dashboard/eventos, document storage) is
  // deferred — see .specs/STATE.md. The app runs against MSW mocks that
  // mirror the spec'd contracts exactly, so every screen is testable now and
  // swapping to the real backend later just means turning this flag off.
  if (import.meta.env.VITE_USE_MOCKS !== "false") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
