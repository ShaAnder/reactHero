import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// This is the entry point for the whole app.
// We grab the #root div from index.html and tell React to render our App there.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
