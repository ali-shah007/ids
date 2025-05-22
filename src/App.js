import { useState } from "react";
import MainMenu from "./Components/MainMenu";
import WeaponDetectionHighAccuracy from "./Components/WeaponDetectionImageUpload";

export default function App() {
  const [showDetection, setShowDetection] = useState(false);

  const [settings, setSettings] = useState({
    sensitivity: 70,
    recipientEmail: "",
    coolOff: 1.0,
    weaponDetection: true,
    personAlert: true,
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {!showDetection ? (
        <MainMenu settings={settings} setSettings={setSettings} onStart={() => setShowDetection(true)} />
      ) : (
        <WeaponDetectionHighAccuracy {...settings} />
      )}
    </div>
  );
}
