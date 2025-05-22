import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const RoboflowWebcamControl = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [processedFrame, setProcessedFrame] = useState('');
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Webcam error:', err);
      }
    };
    getCamera();
  }, []);

  const sendFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw current frame on canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    try {
      const res = await axios.post('http://localhost:5000/predict', { image: dataUrl });
      setProcessedFrame(res.data.image); // Set result as base64
    } catch (err) {
      console.error('Inference error:', err);
    }
  };

  const startDetection = () => {
    if (!intervalId) {
      const id = setInterval(sendFrame, 500); // Every 500ms
      setIntervalId(id);
    }
  };

  const stopDetection = () => {
    clearInterval(intervalId);
    setIntervalId(null);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-lg mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Roboflow Object Detection</h2>
      
      <video ref={videoRef} autoPlay muted playsInline width="640" height="480" className="hidden" />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />

      {processedFrame && (
        <img src={processedFrame} alt="Detected" className="rounded border mt-4" />
      )}

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={startDetection} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Start Detection
        </button>
        <button onClick={stopDetection} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Stop Detection
        </button>
      </div>
    </div>
  );
};

export default RoboflowWebcamControl;
