"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#171a21",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      }}
    />
  );
}
