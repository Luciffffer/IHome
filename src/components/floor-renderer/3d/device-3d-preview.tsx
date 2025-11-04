import { Html } from '@react-three/drei';
import { Lightbulb, Lock, Thermometer, Volume2 } from 'lucide-react';

// Preview ghost device component
function Device3DPreview({
  type,
  position,
  isValid,
}: {
  type: string;
  position: [number, number, number];
  isValid: boolean;
}) {
  const Icon =
    type === 'light'
      ? Lightbulb
      : type === 'thermostat'
      ? Thermometer
      : type === 'door-lock'
      ? Lock
      : Volume2;

  const color =
    type === 'light'
      ? '#fbbf24'
      : type === 'thermostat'
      ? '#ef4444'
      : type === 'door-lock'
      ? '#3b82f6'
      : '#8b5cf6';

  return (
    <Html
      center
      position={position}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        transform: 'translate(-50%, -50%)',
      }}
      distanceFactor={10}
    >
      <div className="relative">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${
            isValid ? 'bg-background dark:bg-muted' : 'bg-red-100'
          }`}
        >
          <Icon
            className="w-7 h-7"
            style={{ color: isValid ? color : '#ef4444' }}
          />
        </div>

        {/* Invalid placement indicator - rendered as a ring around the icon */}
        {!isValid && (
          <div
            className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse"
            style={{
              width: '56px',
              height: '56px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
    </Html>
  );
}

export default Device3DPreview;
