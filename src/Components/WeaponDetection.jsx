import { useRef, useEffect, useState } from "react";
import axios from "axios";

const WeaponDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Access the webcam
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });

    const interval = setInterval(() => {
      captureAndDetect();
    }, 100); // Adjust the interval (ms) for faster/slower detection

    return () => clearInterval(interval);
  }, []);

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Base64 (strip the data prefix)
    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

    setLoading(true);
    try {
      const response = await axios({
        method: "POST",
        url: "https://serverless.roboflow.com/weapon-detection-m7qso/1",
        params: {
          api_key: "IaOqUIAk2s0bKRAaTCO9",
        },
        data: base64Image,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setDetections(response.data.predictions || []);
    } catch (error) {
      console.error("Detection error:", error.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto mt-6">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full rounded"
        style={{ position: "relative", zIndex: 1 }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Draw detections */}
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
            color: "red",
            fontWeight: "bold",
            fontSize: "12px",
            zIndex: 2,
          }}
        >
          {det.class} ({Math.round(det.confidence * 100)}%)
        </div>
      ))}

      {loading && (
        <div className="text-center text-blue-600 mt-4">Detecting...</div>
      )}
    </div>
  );
};

export default WeaponDetection;
