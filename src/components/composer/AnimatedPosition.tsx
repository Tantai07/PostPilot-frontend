import { useLayoutEffect, useRef, type ReactNode } from "react";

export function AnimatedPosition({ children, className }: { children: ReactNode; className: string }) {
  const element = useRef<HTMLDivElement>(null);
  const previous = useRef<DOMRect | null>(null);
  const animation = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    animation.current?.cancel();
    const next = node.getBoundingClientRect();
    const before = previous.current;
    if (before && !matchMedia("(prefers-reduced-motion: reduce)").matches && (before.x !== next.x || before.y !== next.y)) {
      animation.current = node.animate([{ transform: `translate(${before.x - next.x}px, ${before.y - next.y}px)` }, { transform: "translate(0, 0)" }], { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    previous.current = next;
  });
  return <div ref={element} className={className}>{children}</div>;
}
