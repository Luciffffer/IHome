import { IDevice } from '@/models/Device';
import { Html } from '@react-three/drei';
import { useFloorUI } from '@/contexts/floor-ui-context';
import DeviceIcon from '../../devices/device-icon';

interface Device3DProps {
  device: IDevice;
}

const DEVICE_HEIGHT = 0.05;

function Device3D({ device }: Device3DProps) {
  const { openDeviceDetail } = useFloorUI();

  return (
    <Html
      center
      position={[device.x, DEVICE_HEIGHT + 0.1, device.y]}
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        transform: 'translate(-50%, -50%)',
      }}
      distanceFactor={10}
      zIndexRange={[100, 200]}
    >
      <div
        className="relative cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          openDeviceDetail(device);
        }}
      >
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full 
            shadow-lg bg-background dark:bg-muted`}
        >
          <DeviceIcon device={device} className="w-7 h-7" />
        </div>
      </div>
    </Html>
  );
}

export default Device3D;
