import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Load environment variables for translation script
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // This will be tree-shaken in production builds
}

createRoot(document.getElementById("root")!).render(<App />);
