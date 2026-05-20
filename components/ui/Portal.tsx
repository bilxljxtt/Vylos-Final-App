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

    // Lock body scroll
    const scrollLocks = parseInt(document.body.getAttribute('data-scroll-locks') || '0', 10);
    document.body.setAttribute('data-scroll-locks', (scrollLocks + 1).toString());
    document.body.style.overflow = 'hidden';

    return () => {
      // Unlock body scroll if last portal
      const currentLocks = parseInt(document.body.getAttribute('data-scroll-locks') || '1', 10);
      const newLocks = Math.max(0, currentLocks - 1);
      
      if (newLocks === 0) {
        document.body.removeAttribute('data-scroll-locks');
        document.body.style.overflow = '';
      } else {
        document.body.setAttribute('data-scroll-locks', newLocks.toString());
      }
    };
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("vylos-portal-root");
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
};
