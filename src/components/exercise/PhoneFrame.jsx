import React from 'react';
import { getButtonConfig, DEFAULT_BUTTON_CONFIG } from '@/data/phoneButtonConfigs';

/**
 * Composant pour afficher un cadre de téléphone autour de la capture d'écran
 * Affiche l'entourage avec les boutons physiques sur les côtés
 * Support de différentes configurations (Samsung, iPhone, Pixel, etc.)
 */
const PhoneFrame = ({ 
  children,
  showPhoneFrame = false,
  hideActionZones = false,
  onButtonClick = () => {},
  buttonConfig = DEFAULT_BUTTON_CONFIG // 'samsung', 'iphone', 'pixel', etc.
}) => {
  if (!showPhoneFrame) {
    return children;
  }

  // Récupérer la configuration des boutons
  const config = getButtonConfig(buttonConfig);
  const buttons = config.buttons;

  return (
    <div className="relative w-full" style={{ overflow: 'visible', margin: 0, padding: 0 }}>
      {/* Nom de la configuration - positionné en haut absolu */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-xs text-gray-500 font-semibold z-50 whitespace-nowrap" style={{ pointerEvents: 'none' }}>
        📱 {config.name}
      </div>

      {/* Contenu enfant (capture d'écran) - prend toute la largeur */}
      <div style={{ 
        position: 'relative', 
        width: '100%',
        overflow: 'visible', 
        margin: 0, 
        padding: 0
      }}>
        {children}
      </div>

      {/* Rendu des boutons au niveau du parent PhoneFrame */}
      {Object.entries(buttons).map(([key, button]) => {
        const isRight = button.position.side === 'right';
        
        return (
          <div
            key={button.id}
            style={{
              position: 'absolute',
              [isRight ? 'right' : 'left']: '-18px',
              top: button.position.top,
              transform: 'translateY(-50%)',
              minWidth: '36px',
              width: button.width || '36px',
              height: button.height || '40px',
              padding: '4px',
              backgroundColor: button.color,
              borderRadius: '8px',
              cursor: 'pointer',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: button.fontSize || '14px',
              color: 'white',
              fontWeight: '600',
              transition: 'all 0.18s ease',
              userSelect: 'none',
              pointerEvents: 'auto',
              overflow: 'visible',
              margin: 0
            }}
            className="hover:scale-105 hover:shadow-xl active:scale-95"
            onClick={() => onButtonClick(button.id)}
            title={button.description}
          >
            {button.icon}
          </div>
        );
      })}
    </div>
  );
};

export default PhoneFrame;
