import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// shadcn/ui's composable, locally-owned button pattern, adapted to ProofPilot tokens.
export function Button({
  className,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
}) {
  return (
    <button
      data-slot="button"
      className={twMerge(
        clsx(
          "button",
          variant === "default"
            ? "primary"
            : variant === "outline"
              ? "secondary"
              : "text-button",
          className,
        ),
      )}
      {...props}
    />
  );
}
