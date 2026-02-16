import { useState, useEffect, useCallback } from 'react';

export const useInteractiveArea = (initialArea, imageDimensions) => {
  const [area, setArea] = useState(initialArea);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);

  useEffect(() => {
    setArea(initialArea);
  }, [initialArea]);

  const getMousePositionOnImage = useCallback(
    (e, imageRef) => {
      if (!imageRef.current) return { x: 0, y: 0 };
      const rect = imageRef.current.getBoundingClientRect();
      const scaleX = imageDimensions.naturalWidth / imageDimensions.width;
      const scaleY = imageDimensions.naturalHeight / imageDimensions.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [imageDimensions]
  );

  const handleMouseDown = useCallback(
    (e, imageRef) => {
      if (e.target.classList.contains('resize-handle')) return;
      setIsDragging(true);
      const pos = getMousePositionOnImage(e, imageRef);
      setDragStart({ x: pos.x - area.x, y: pos.y - area.y });
    },
    [getMousePositionOnImage, area]
  );

  const handleResizeMouseDown = useCallback(
    (e, handleName, imageRef) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeHandle(handleName);
      const pos = getMousePositionOnImage(e, imageRef);
      setDragStart({ x: pos.x, y: pos.y });
    },
    [getMousePositionOnImage, setIsResizing, setResizeHandle]
  );

  const handleMouseMove = useCallback(
    (e, imageRef) => {
      if (!isDragging && !isResizing) return;
      if (!imageRef.current) return;

      const pos = getMousePositionOnImage(e, imageRef);
      let { x, y, width, height } = area;

      if (isDragging) {
        let newX = Math.round(pos.x - dragStart.x);
        let newY = Math.round(pos.y - dragStart.y);
        newX = Math.max(0, Math.min(newX, imageDimensions.naturalWidth - width));
        newY = Math.max(0, Math.min(newY, imageDimensions.naturalHeight - height));
        setArea((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        const deltaX = pos.x - dragStart.x;
        const deltaY = pos.y - dragStart.y;

        if (resizeHandle.includes('right')) width = Math.max(10, Math.round(width + deltaX));
        if (resizeHandle.includes('left')) {
          width = Math.max(10, Math.round(width - deltaX));
          x = Math.round(x + deltaX);
        }
        if (resizeHandle.includes('bottom')) height = Math.max(10, Math.round(height + deltaY));
        if (resizeHandle.includes('top')) {
          height = Math.max(10, Math.round(height - deltaY));
          y = Math.round(y + deltaY);
        }

        x = Math.max(0, Math.min(x, imageDimensions.naturalWidth - width));
        y = Math.max(0, Math.min(y, imageDimensions.naturalHeight - height));
        width = Math.min(width, imageDimensions.naturalWidth - x);
        height = Math.min(height, imageDimensions.naturalHeight - y);

        setArea((prev) => ({ ...prev, x, y, width, height }));
        setDragStart({ x: pos.x, y: pos.y });
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      area,
      imageDimensions,
      getMousePositionOnImage,
      resizeHandle,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  return {
    area,
    setArea,
    handleMouseDown,
    handleResizeMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
