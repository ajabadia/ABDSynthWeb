"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  accent?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, hoverEffect = false, accent = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { scale: 1.01, borderColor: "rgba(0, 240, 255, 0.3)" } : {}}
        className={cn(
          "glass-panel relative rounded-md p-6 transition-colors duration-500",
          accent && "border-l-2 border-l-primary",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
