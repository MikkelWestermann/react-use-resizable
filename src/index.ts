import React, { useRef } from 'react';

type SharedProps = {
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  lockHorizontal?: boolean;
  lockVertical?: boolean;
  onResize?: (values: MoveValues) => void;
  onDragEnd?: (values: MoveValues) => void;
  onDragStart?: (values: MoveValues) => void;
  disabled?: boolean;
  maintainAspectRatio?: boolean;
};

export interface ResizableProps extends SharedProps {
  interval?: number;
  initialHeight?: number | string;
  initialWidth?: number | string;
}

export interface ResizeHandleProps extends SharedProps {
  parent?: React.RefObject<HTMLDivElement>;
  interval?: number;
  reverse?: boolean;
}

export type MoveValues = {
  newHeight: number;
  heightDiff: number;
  newWidth: number;
  widthDiff: number;
};

type HandleMouseMove = (
  startHeight: number,
  startY: number,
  startWidth: number,
  startX: number,
) => (e: Event) => void;

type HandleTouchMove = (
  startHeight: number,
  startY: number,
  startWidth: number,
  startX: number,
) => (e: Event) => void;

enum MoveEvent {
  MouseMove = 'mousemove',
  TouchMove = 'touchmove',
}

enum EndEvent {
  MouseUp = 'mouseup',
  TouchEnd = 'touchend',
}

const defaultProps: ResizableProps = {
  interval: 1,
  initialHeight: 100,
  initialWidth: 100,
  lockHorizontal: false,
  lockVertical: false,
};

export const useResizable = (options: ResizableProps) => {
  const props: ResizableProps = {
    ...defaultProps,
    ...options,
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const getRootProps = () => {
    const { initialHeight, initialWidth } = props;
    return {
      ref: parentRef,
      style: {
        height: initialHeight,
        width: initialWidth,
      },
    };
  };

  const getHandleProps = (handleProps?: ResizeHandleProps) => {
    if (!handleProps) {
      handleProps = {};
    }
    const {
      parent = parentRef,
      interval = 1,
      maxHeight = Number.MAX_SAFE_INTEGER,
      maxWidth = Number.MAX_SAFE_INTEGER,
      reverse,
      lockHorizontal,
      lockVertical,
      onResize,
      onDragEnd,
      onDragStart,
      minHeight = 0,
      minWidth = 0,
      disabled = false,
      maintainAspectRatio = false,
    } = { ...props, ...handleProps };

    const handleMove = (
      clientY: number,
      startHeight: number,
      startY: number,
      clientX: number,
      startWidth: number,
      startX: number,
    ) => {
      if (disabled) return;
      const currentWidth = parent?.current?.clientWidth || 0;
      const currentHeight = parent?.current?.clientHeight || 0;
      let roundedHeight = currentHeight;
      let roundedWidth = currentWidth;

      if (!lockVertical) {
        const newHeight = startHeight + (clientY - startY) * (reverse ? -1 : 1);
        // Round height to nearest interval
        roundedHeight = Math.round(newHeight / interval) * interval;
        if (roundedHeight <= 0) {
          roundedHeight = interval;
        }
        if (roundedHeight >= maxHeight) {
          roundedHeight = maxHeight;
        }
        if (roundedHeight <= minHeight) {
          roundedHeight = minHeight;
        }

        if (parent?.current) {
          parent.current.style.height = `${roundedHeight}px`;
        }
      }

      if (!lockHorizontal) {
        const newWidth = startWidth + (clientX - startX) * (reverse ? -1 : 1);
        // Round height to nearest interval
        roundedWidth = Math.round(newWidth / interval) * interval;
        if (roundedWidth <= 0) {
          roundedWidth = interval;
        }
        if (roundedWidth >= maxWidth) {
          roundedWidth = maxWidth;
        }
        if (roundedWidth <= minWidth) {
          roundedWidth = minWidth;
        }

        if (parent?.current) {
          parent.current.style.width = `${roundedWidth}px`;
        }
      }

      if (maintainAspectRatio) {
        const aspectRatio = currentWidth / currentHeight;
        const newAspectRatio = roundedWidth / roundedHeight;
        if (newAspectRatio > aspectRatio) {
          roundedWidth = roundedHeight * aspectRatio;
          if (parent?.current) {
            parent.current.style.width = `${roundedWidth}px`;
          }
        } else {
          roundedHeight = roundedWidth / aspectRatio;
          if (parent?.current) {
            parent.current.style.height = `${roundedHeight}px`;
          }
        }
      }

      if (onResize) {
        onResize({
          newHeight: roundedHeight,
          heightDiff: roundedHeight - currentHeight,
          newWidth: roundedWidth,
          widthDiff: roundedWidth - currentWidth,
        });
      }
    };

    const handleMouseMove: HandleMouseMove = (startHeight, startY, startWidth, startX) => (e: Event) => {
      if (!(e instanceof MouseEvent)) return;
      handleMove(e.clientY, startHeight, startY, e.clientX, startWidth, startX);
    };

    const handleTouchMove: HandleTouchMove = (startHeight, startY, startWidth, startX) => (e: Event) => {
      e.preventDefault();
      if (!(e instanceof TouchEvent)) return;
      handleMove(e.touches[0].clientY, startHeight, startY, e.touches[0].clientX, startWidth, startX);
    };

    const handleDragEnd = (
      handleMoveInstance: (e: Event) => void,
      moveEvent: 'mousemove' | 'touchmove',
      endEvent: 'mouseup' | 'touchend',
      startHeight: number,
      startWidth: number,
    ) => {
      function dragHandler() {
        document.removeEventListener(moveEvent, handleMoveInstance);
        document.removeEventListener(endEvent, dragHandler);
        if (onDragEnd) {
          const currentWidth = parent?.current?.clientWidth || 0;
          const currentHeight = parent?.current?.clientHeight || 0;
          onDragEnd({
            newHeight: currentHeight,
            heightDiff: currentHeight - startHeight,
            newWidth: currentWidth,
            widthDiff: currentWidth - startWidth,
          });
        }
      }

      return dragHandler;
    };


    const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      const startHeight = parent?.current?.clientHeight || 0;
      const startWidth = parent?.current?.clientWidth || 0;

      let moveHandler = null;
      let moveEvent = null;
      let endEvent = null;
      if (e.type === 'mousedown') {
        const { clientY, clientX } = e as React.MouseEvent;
        moveHandler = handleMouseMove(startHeight, clientY, startWidth, clientX);
        moveEvent = MoveEvent.MouseMove;
        endEvent = EndEvent.MouseUp;
      } else if (e.type === 'touchstart') {
        const { touches } = e as React.TouchEvent;
        const { clientY, clientX } = touches[0];
        moveHandler = handleTouchMove(startHeight, clientY, startWidth, clientX);
        moveEvent = MoveEvent.TouchMove;
        endEvent = EndEvent.TouchEnd;
      }

      if (!moveHandler || !moveEvent || !endEvent) return;

      if (onDragStart) {
        onDragStart({
          newHeight: startHeight,
          heightDiff: 0,
          newWidth: startWidth,
          widthDiff: 0,
        });
      }
      
      const dragEndHandler = handleDragEnd(moveHandler, moveEvent, endEvent, startHeight, startWidth);

      // Attach the mousemove/mouseup/touchmove/touchend listeners to the document
      // so that we can handle the case where the user drags outside of the element
      document.addEventListener(moveEvent, moveHandler, { passive: false });
      document.addEventListener(endEvent, dragEndHandler);
    };

    let cursor;
    if (disabled) {
      cursor = 'not-allowed';
    } else if (lockHorizontal && lockVertical) {
      cursor = 'default';
    } else if (lockHorizontal) {
      cursor = 'row-resize';
    } else if (lockVertical) {
      cursor = 'col-resize';
    } else {
      cursor = 'nwse-resize';
    }

    const style = {
      cursor,
    };

    return {
      onMouseDown: handleDown,
      onTouchStart: handleDown,
      style,
    };
  };

  return {
    rootRef: parentRef,
    getRootProps,
    getHandleProps,
  };
};
