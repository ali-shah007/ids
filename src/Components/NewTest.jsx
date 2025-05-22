import  { useEffect, useRef, useState } from 'react';

const RoboflowWebcamInfer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setStatus('Webcam started');
      } catch (err) {
        console.error('Webcam error:', err);
        setStatus('Failed to start webcam');
      }
    };

    startWebcam();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSendFrame();
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to data URL
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const imageURL = URL.createObjectURL(blob);

      // Send to Roboflow
      try {
        const response = await fetch('https://serverless.roboflow.com/infer/workflows/projects-ckwfy/detect-count-and-visualize-2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            api_key: 'IaOqUIAk2s0bKRAaTCO9',
            inputs: {
              image: { type: 'url', value: imageURL }
            }
          })
        });

        const result = await response.json();
        setResults(result);
        setStatus('Inference complete');
        console.log(result);
      } catch (err) {
        console.error('Inference error:', err);
        setStatus('Inference failed');
      }
    }, 'image/jpeg');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow-lg text-center">
      <h2 className="text-xl font-bold mb-4">Live Roboflow Inference</h2>

      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-md border border-gray-300"
      />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <p className="mt-4 text-sm text-gray-600">Status: {status}</p>

      {/* Display results */}
      {results && results.predictions && (
        <div className="mt-4 text-left text-sm max-h-64 overflow-y-auto">
          <h3 className="font-semibold mb-2">Predictions:</h3>
          <ul className="list-disc list-inside">
            {results.predictions.map((pred, index) => (
              <li key={index}>
                {pred.class} (confidence: {(pred.confidence * 100).toFixed(2)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoboflowWebcamInfer;
