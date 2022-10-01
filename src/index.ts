import React, { useMemo, useRef } from 'react';

type SharedProps = {
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  lockHorizontal?: boolean;
  lockVertical?: boolean;
  onMove?: (values: MoveValues) => void;
  onDragEnd?: (values: MoveValues) => void;
  disabled?: boolean;
};

export interface ResizableProps extends SharedProps {
  interval?: number;
  initialHeight?: number;
  initialWidth?: number;
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
) => (e: MouseEvent) => void;

type HandleTouchMove = (
  startHeight: number,
  startY: number,
  startWidth: number,
  startX: number,
) => (e: TouchEvent) => void;

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

  const getHandleProps = (handleProps: ResizeHandleProps) => {
    const {
      parent = parentRef,
      interval = 1,
      maxHeight = Number.MAX_SAFE_INTEGER,
      maxWidth = Number.MAX_SAFE_INTEGER,
      reverse,
      lockHorizontal,
      lockVertical,
      onMove,
      onDragEnd,
      minHeight = 0,
      minWidth = 0,
      disabled = false,
    } = { ...props, ...handleProps };

    const handleMove = useMemo(() => {
      return (
        clientY: number,
        startHeight: number,
        startY: number,
        clientX: number,
        startWidth: number,
        startX: number,
      ) => {
        if (disabled) return;
        const currentWidth = parent?.current!.clientWidth || 0;
        const currentHeight = parent?.current!.clientHeight || 0;
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
        }

        if (parent?.current) {
          parent.current.style.width = `${roundedWidth}px`;
          parent.current.style.height = `${roundedHeight}px`;
        }

        if (onMove) {
          onMove({
            newHeight: roundedHeight,
            heightDiff: roundedHeight - currentHeight,
            newWidth: roundedWidth,
            widthDiff: roundedWidth - currentWidth,
          });
        }
      };
    }, [parent, maxWidth, maxHeight, minWidth, minHeight, interval, lockHorizontal, lockVertical, reverse, onMove]);

    const handleMouseMove: HandleMouseMove = (startHeight, startY, startWidth, startX) => (e) => {
      handleMove(e.clientY, startHeight, startY, e.clientX, startWidth, startX);
    };

    const handleTouchMove: HandleTouchMove = (startHeight, startY, startWidth, startX) => (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientY, startHeight, startY, e.touches[0].clientX, startWidth, startX);
    };

    const handleDragEnd = useMemo(() => {
      return (
        handleMouseMoveInstance: (e: MouseEvent) => void,
        handleTouchMoveInstance: (e: TouchEvent) => void,
        startHeight: number,
        startWidth: number,
      ) => {
        function dragHandler(e: MouseEvent | TouchEvent) {
          document.removeEventListener('mousemove', handleMouseMoveInstance);
          document.removeEventListener('mouseup', dragHandler);
          document.removeEventListener('touchmove', handleTouchMoveInstance);
          document.removeEventListener('touchend', dragHandler);
          if (onDragEnd) {
            const currentWidth = parent?.current!.clientWidth || 0;
            const currentHeight = parent?.current!.clientHeight || 0;
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
    }, [parent, handleMouseMove, handleTouchMove]);

    const handleDown = (clientY: number, clientX: number) => {
      const startHeight = parent?.current?.clientHeight || 0;
      const startWidth = parent?.current?.clientWidth || 0;

      // Attach the mousemove/mouseup/touchmove/touchend listeners to the document
      // so that we can handle the case where the user drags outside of the element
      const mouseMoveHandler = handleMouseMove(startHeight, clientY, startWidth, clientX);
      const touchMoveHandler = handleTouchMove(startHeight, clientY, startWidth, clientX);
      const dragEndHandler = handleDragEnd(mouseMoveHandler, touchMoveHandler, startHeight, startWidth);

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', dragEndHandler);
      document.addEventListener("touchmove", touchMoveHandler, { passive: false });
      document.addEventListener('touchend', dragEndHandler);
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
      onMouseDown: (e: React.MouseEvent) => {
        handleDown(e.clientY, e.clientX);
      },
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        handleDown(e.touches[0].clientY, e.touches[0].clientX);
      },
      style,
    };
  };

  return {
    rootRef: parentRef,
    getRootProps,
    getHandleProps,
  };
};
