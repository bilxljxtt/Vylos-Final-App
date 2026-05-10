"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Ensure portal root exists
    if (!document.getElementById("vylos-portal-root")) {
      const el = document.createElement("div");
      el.id = "vylos-portal-root";
      document.body.appendChild(el);
    }
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("vylos-portal-root");
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
};
