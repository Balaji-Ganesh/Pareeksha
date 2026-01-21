import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "h-10 px-4 py-2 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:opacity-50 disabled:pointer-events-none",

          variant === "default" &&
            "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",

          variant === "outline" &&
            "border border-border bg-background hover:bg-muted",

          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",

          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
