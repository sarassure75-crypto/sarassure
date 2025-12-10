import React from 'react';

    const AreaEditor = ({ area, imageDimensions, onMouseDown, onResizeMouseDown, areaType }) => {
        if (!area || !imageDimensions.width) return null;

        const scaleX = imageDimensions.width / imageDimensions.naturalWidth;
        const scaleY = imageDimensions.height / imageDimensions.naturalHeight;

        const isVisible = area.is_visible !== undefined ? area.is_visible : true;
        const opacity = isVisible ? 0.5 : 0;

        const style = {
            left: `${area.x * scaleX}px`,
            top: `${area.y * scaleY}px`,
            width: `${area.width * scaleX}px`,
            height: `${area.height * scaleY}px`,
            backgroundColor: area.color ? area.color.replace('0.5', opacity.toString()) : `rgba(239, 68, 68, ${opacity})`,
            borderColor: area.color ? area.color.replace('0.5', '1') : "rgba(239, 68, 68, 1)",
            cursor: 'move',
        };

        const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'];

        return (
            <div
                className="absolute border-2"
                style={style}
                onMouseDown={onMouseDown}
            >
                {handles.map(handleName => {
                    let cursorClass = '';
                    if ((handleName.includes('top') && handleName.includes('left')) || (handleName.includes('bottom') && handleName.includes('right'))) {
                        cursorClass = 'cursor-nwse-resize';
                    } else if ((handleName.includes('top') && handleName.includes('right')) || (handleName.includes('bottom') && handleName.includes('left'))) {
                        cursorClass = 'cursor-nesw-resize';
                    } else if (handleName === 'top' || handleName === 'bottom') {
                        cursorClass = 'cursor-ns-resize';
                    } else {
                        cursorClass = 'cursor-ew-resize';
                    }

                    return (
                        <div
                            key={handleName}
                            className={`resize-handle absolute bg-white border border-gray-700 rounded-full w-2.5 h-2.5 -m-1 ${
                                handleName.includes('left') ? 'left-0' : ''
                            } ${handleName.includes('right') ? 'right-0' : ''
                            } ${handleName.includes('top') ? 'top-0' : ''
                            } ${handleName.includes('bottom') ? 'bottom-0' : ''
                            } ${handleName === 'top' || handleName === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : ''
                            } ${handleName === 'left' || handleName === 'right' ? 'top-1/2 transform -translate-y-1/2' : ''
                            } ${cursorClass}`}
                            onMouseDown={(e) => onResizeMouseDown(e, handleName)}
                        />
                    );
                })}
            </div>
        );
    };

    export default AreaEditor;