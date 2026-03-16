import { useCallback, useRef, useSyncExternalStore } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

type ViewTransitionWithReady = {
  ready?: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>,
  ) => ViewTransitionWithReady;
};

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  disabled,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const isThemeReady =
    isHydrated &&
    (resolvedTheme === "light" || resolvedTheme === "dark");
  const isDark = resolvedTheme === "dark";
  const isDisabled = !isThemeReady || disabled;

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button || typeof document === "undefined" || isDisabled) {
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );
    const nextTheme = isDark ? "light" : "dark";
    const documentWithViewTransition = document as DocumentWithViewTransition;

    const applyTheme = () => {
      setTheme(nextTheme);
    };

    if (typeof documentWithViewTransition.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    const transition = documentWithViewTransition.startViewTransition(() => {
      flushSync(applyTheme);
    });

    const ready = transition?.ready;
    if (ready && typeof ready.then === "function") {
      void ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    }
  }, [duration, isDark, isDisabled, setTheme]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      disabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      {!isThemeReady ? <SunMoon aria-hidden="true" /> : isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
