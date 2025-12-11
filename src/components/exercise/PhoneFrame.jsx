import React from 'react';

/**
 * Composant pour afficher un cadre de téléphone autour de la capture d'écran
 * Affiche l'entourage avec les boutons physiques sur les côtés
 */
const PhoneFrame = ({ 
  children,
  showPhoneFrame = false,
  hideActionZones = false,
  onButtonClick = () => {}
}) => {
  if (!showPhoneFrame) {
    return children;
  }

  const buttonStyles = {
    power: {
      right: '0px',
      top: '35%',
      width: '12px',
      height: '40px',
      backgroundColor: '#ef4444',
      label: '⏻'
    },
    volumeUp: {
      left: '0px',
      top: '25%',
      width: '12px',
      height: '40px',
      backgroundColor: '#3b82f6',
      label: '🔊'
    },
    volumeDown: {
      left: '0px',
      top: '40%',
      width: '12px',
      height: '40px',
      backgroundColor: '#06b6d4',
      label: '🔉'
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Entourage du téléphone */}
      <div className="relative aspect-[9/16] w-full max-w-sm bg-black rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
        {/* Encoche (notch) en haut */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>

        {/* Écran principal */}
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>

        {/* Bouton Power (côté droit) */}
        <div
          style={{
            position: 'absolute',
            right: '-12px',
            top: '35%',
            transform: 'translateY(-50%)',
            width: '12px',
            height: '40px',
            backgroundColor: '#ef4444',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          className="hover:scale-110 hover:shadow-lg active:scale-95"
          onClick={() => onButtonClick('power')}
          title="Bouton d'allumage"
        >
          ⏻
        </div>

        {/* Bouton Volume+ (côté gauche, haut) */}
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '25%',
            transform: 'translateY(-50%)',
            width: '12px',
            height: '40px',
            backgroundColor: '#3b82f6',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          className="hover:scale-110 hover:shadow-lg active:scale-95"
          onClick={() => onButtonClick('volumeUp')}
          title="Bouton volume haut"
        >
          🔊
        </div>

        {/* Bouton Volume- (côté gauche, bas) */}
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '40%',
            transform: 'translateY(-50%)',
            width: '12px',
            height: '40px',
            backgroundColor: '#06b6d4',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          className="hover:scale-110 hover:shadow-lg active:scale-95"
          onClick={() => onButtonClick('volumeDown')}
          title="Bouton volume bas"
        >
          🔉
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
