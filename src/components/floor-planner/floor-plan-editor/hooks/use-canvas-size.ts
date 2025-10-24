import { useState, useLayoutEffect } from 'react';

const initialCanvasSize = { width: 1000, height: 550 };

export function useCanvasSize(containerRef: React.RefObject<HTMLElement | null>) {
  const [canvasSize, setCanvasSize] = useState(initialCanvasSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateSize() {
      setCanvasSize({
        width: container?.clientWidth || initialCanvasSize.width,
        height: container?.clientHeight || initialCanvasSize.height,
      });
    }

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return canvasSize;
}