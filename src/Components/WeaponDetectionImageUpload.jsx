import { useRef, useEffect, useState } from "react";
import axios from "axios";
import sendEmailAlert from "./EmailAlert";

const WeaponDetectionHighAccuracy = ({
  sensitivity,
  recipientEmail,
  weaponDetection,
  personAlert,
  coolOff,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedSource, setSelectedSource] = useState("webcam");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [ipCameraUrl, setIpCameraUrl] = useState("");
  const lastEmailTimeRef = useRef(0);

  useEffect(() => {
    const listDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    };

    listDevices();
  }, []);

  useEffect(() => {
    if (selectedSource === "ip") {
      const defaultIp = "http://192.168.0.109:8080/video";
      setIpCameraUrl(defaultIp);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (selectedSource === "webcam") {
      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: selectedDeviceId },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Webcam error:", err);
        }
      };
      startWebcam();
    } else if (selectedSource === "ip") {
      const defaultIp = "http://192.168.0.109:8080/video";
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = defaultIp;
        videoRef.current.crossOrigin = "anonymous";
        videoRef.current.play().catch((err) => console.error("IP camera error:", err));
      }
    }

    const interval = setInterval(() => captureAndDetect(), 1000);
    return () => clearInterval(interval);
  }, [selectedDeviceId, selectedSource, ipCameraUrl]);

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

      const now = Date.now();
      const weapon = predictions.find(
        (d) => d.class.toLowerCase() === "weapon" && d.confidence > sensitivity / 100
      );
      const person = predictions.find(
        (d) => d.class.toLowerCase() === "person" && d.confidence > sensitivity / 100
      );

      if (weapon && weaponDetection && now - lastEmailTimeRef.current > coolOff * 60000) {
        lastEmailTimeRef.current = now;
        await sendEmailAlert({
          toEmail: recipientEmail,
          subject: "Weapon Detected Alert",
          message: `Weapon detected with ${Math.round(weapon.confidence * 100)}% confidence.`,
        });
      }

      if (person && personAlert && now - lastEmailTimeRef.current > coolOff * 60000) {
        lastEmailTimeRef.current = now;
        await sendEmailAlert({
          toEmail: recipientEmail,
          subject: "Person Detected Alert",
          message: `Person detected with ${Math.round(person.confidence * 100)}% confidence.`,
        });
      }
    } catch (err) {
      console.error("Detection error:", err.message);
    }

    setLoading(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto mt-6 bg-red-500 p-4 rounded">
      <div className="mb-4">
        <label className="block mb-1 text-white font-semibold">Video Source</label>
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-4 py-2 rounded border w-full"
        >
          <option value="webcam">Webcam / iVCam</option>
          <option value="ip">IP Camera (MJPEG)</option>
        </select>
      </div>

      {selectedSource === "webcam" && (
        <div className="mb-4">
          <label className="block mb-1 text-white font-semibold">Select Webcam</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="px-4 py-2 rounded border w-full"
          >
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || "Camera"}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSource === "ip" && (
        <div className="mb-4">
          <label className="block mb-1 text-white font-semibold">IP Camera URL</label>
          <input
            type="text"
            placeholder="http://192.168.0.109:8080/video"
            value={ipCameraUrl}
            onChange={(e) => setIpCameraUrl(e.target.value)}
            className="px-4 py-2 rounded border w-full"
          />
        </div>
      )}

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
        <div className="text-center text-blue-200 mt-4 animate-pulse">Detecting...</div>
      )}
    </div>
  );
};

export default WeaponDetectionHighAccuracy;
