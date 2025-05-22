// src/components/WeaponDetectionHighAccuracy.jsx
import { useRef, useEffect, useState } from "react";
import axios from "axios";
import sendEmailAlert from "./EmailAlert";

const WeaponDetectionHighAccuracy = ({sensitivity, recipientEmail, weaponDetection, personAlert, coolOff}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const lastEmailTimeRef = useRef(0); // ✅ useRef instead of useState
  console.log(sensitivity, recipientEmail, weaponDetection, personAlert, coolOff);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    startWebcam();
    const interval = setInterval(() => captureAndDetect(), 1000);
    return () => clearInterval(interval);
  }, []);

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

    setLoading(true);
    try {
      const response = await axios.post(
        "https://serverless.roboflow.com/weapon-detection-cctv-v3-dataset/1",
        base64Image,
        {
          params: { api_key: "IaOqUIAk2s0bKRAaTCO9" },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const predictions = response.data.predictions || [];
      setDetections(predictions);


      const weapon = predictions.find(
        (d) => d.class.toLowerCase() === "weapon" && d.confidence > sensitivity/100
      );
      const person = predictions.find(
        (d) => d.class.toLowerCase() === "person" && d.confidence > sensitivity/100
      );

      const now = Date.now();
      
      if (weapon && weaponDetection && now - lastEmailTimeRef.current > coolOff * 60 * 1000) {
  lastEmailTimeRef.current = now; // ✅ SET FIRST TO BLOCK IMMEDIATE DUPLICATES
  await sendEmailAlert({
    toEmail: 'alishah69.ah@gmail.com',
    subject: "Weapon Detected Alert",
    message: `A weapon was detected with ${Math.round(weapon.confidence * 100)}% confidence.`,
  });
  console.log("Email sent.");
}
if (person && personAlert && now - lastEmailTimeRef.current > coolOff * 60 * 1000) {
  lastEmailTimeRef.current = now; // ✅ SET FIRST TO BLOCK IMMEDIATE DUPLICATES
  await sendEmailAlert({
    toEmail: 'alishah69.ah@gmail.com',
    subject: "Person Detected Alert",
    message: `A person was detected with ${Math.round(person.confidence * 100)}% confidence.`,
  });
  console.log("Email sent.");
}

    } catch (err) {
      console.error("Detection error:", err.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto mt-6 bg-red-500">
      <input
        type="email"
        placeholder="Enter your email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        className="block mx-auto mb-4 px-4 py-2 border border-gray-300 rounded w-96"
      />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full rounded"
        style={{ position: "relative", zIndex: 1 }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {detections.map((det, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${det.x - det.width / 2}px`,
            top: `${det.y - det.height / 2}px`,
            width: `${det.width}px`,
            height: `${det.height}px`,
            border: "2px solid red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "12px",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {det.class} ({Math.round(det.confidence * 100)}%)
        </div>
      ))}

      {loading && (
        <div className="text-center text-blue-600 mt-4 animate-pulse">
          Detecting...
        </div>
      )}
    </div>
  );
};

export default WeaponDetectionHighAccuracy;
