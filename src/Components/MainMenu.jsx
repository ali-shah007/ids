const MainMenu = ({ settings, setSettings, onStart }) => {
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleStart = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!settings.recipientEmail || !emailRegex.test(settings.recipientEmail)) {
      alert("Please enter a valid recipient email address.");
      return;
    }
    onStart();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('/bg-img2.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 space-y-8 border border-gray-200 dark:border-gray-700 z-10">
        <h1 className="text-3xl font-extrabold text-center text-[#390979] dark:text-white">
          Intrusion Detection System
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Configure detection settings and start monitoring in real-time.
        </p>

        {/* Sensitivity */}
        <div>
          <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1">
            Sensitivity: <span className="font-bold text-[#390979]">{settings.sensitivity}</span>
          </label>
          <input
            type="range"
            min="60"
            max="100"
            value={settings.sensitivity}
            onChange={(e) => handleChange("sensitivity", parseInt(e.target.value))}
            className="w-full accent-[#390979]"
          />
        </div>

        {/* Cool-Off Period */}
        <div>
          <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1">
            Cool-Off Period: <span className="font-bold text-[#390979]">{settings.coolOff.toFixed(1)} min</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="15"
            step="0.1"
            value={settings.coolOff}
            onChange={(e) => handleChange("coolOff", parseFloat(e.target.value))}
            className="w-full accent-[#390979]"
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1">
            Recipient Email:
          </label>
          <input
            type="email"
            value={settings.recipientEmail}
            onChange={(e) => handleChange("recipientEmail", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#390979] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., user@example.com"
          />
        </div>

        {/* Toggles */}
        <div className="flex justify-between items-center">
          <span className="text-gray-800 dark:text-gray-200 font-medium">Weapon Detection</span>
          <button
            onClick={() => handleChange("weaponDetection", !settings.weaponDetection)}
            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${
              settings.weaponDetection ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <span
              className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 ${
                settings.weaponDetection ? "left-7 -translate-x-full" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-800 dark:text-gray-200 font-medium">Person Alert</span>
          <button
            onClick={() => handleChange("personAlert", !settings.personAlert)}
            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${
              settings.personAlert ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <span
              className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 ${
                settings.personAlert ? "left-7 -translate-x-full" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3 bg-[#390979] hover:bg-[#2c0769] text-white font-semibold rounded-lg transition duration-300 shadow-md"
        >
          Start Detection
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
