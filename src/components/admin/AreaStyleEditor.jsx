
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import AreaStyleEditorClient from './AreaStyleEditorClient';

const AreaStyleEditor = ({ area, onAreaChange }) => {
  const containerRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      if (!rootRef.current) {
        rootRef.current = createRoot(containerRef.current);
      }
      
      rootRef.current.render(
        <React.StrictMode>
          <AreaStyleEditorClient area={area} onAreaChange={onAreaChange} />
        </React.StrictMode>
      );
    }
    
    // Cleanup function to unmount the React root when the component is unmounted
    return () => {
      if (rootRef.current) {
        // Delay unmount to allow React to clean up properly
        setTimeout(() => {
          if (rootRef.current) {
            rootRef.current.unmount();
            rootRef.current = null;
          }
        }, 0);
      }
    };
  }, [area, onAreaChange]);

  return <div ref={containerRef}></div>;
};

export default AreaStyleEditor;
