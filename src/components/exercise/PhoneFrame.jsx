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
    <div className="relative w-full px-8" style={{ overflow: 'visible', margin: 0, padding: '0 32px' }}>
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
              [isRight ? 'right' : 'left']: '0px',
              top: button.position.top,
              transform: 'translateY(-50%)',
              minWidth: '44px',
              width: button.width || '44px',
              height: button.height || '48px',
              padding: '6px',
              backgroundColor: button.color,
              borderRadius: '10px',
              cursor: 'pointer',
              zIndex: 9999,
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: button.fontSize || '18px',
              color: 'white',
              fontWeight: '700',
              transition: 'all 0.18s ease',
              userSelect: 'none',
              pointerEvents: 'auto',
              overflow: 'visible',
              margin: 0,
              border: '2px solid rgba(255,255,255,0.2)'
            }}
            className="hover:scale-110 hover:shadow-2xl active:scale-95"
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
