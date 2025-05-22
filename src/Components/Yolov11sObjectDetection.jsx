import  { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const MODEL_URL = '/models/yolov11s/model.json';

const Yolo11sObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadGraphModel(MODEL_URL);
      setModel(loadedModel);
      console.log('Model loaded.');
    };

    const startWebcam = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    };

    loadModel();
    startWebcam();
  }, []);

  useEffect(() => {
  const video = videoRef.current;

  const handleLoadedData = () => {
    const detectFrame = async () => {
      if (!model || !video) return;

      tf.engine().startScope();

      const inputTensor = tf.browser.fromPixels(video)
        .resizeBilinear([640, 640])
        .toFloat()
        .div(255.0)
        .expandDims();

      const predictions = model.execute(inputTensor);

    
        console.log(predictions); // 👈 See what's inside

    //   drawDetections(predictions);

    //   tf.dispose(predictions);
      tf.engine().endScope();
    };

    const interval = setInterval(detectFrame, 200); // ~5 FPS

    return () => clearInterval(interval);
  };

  if (video) {
    video.addEventListener('loadeddata', handleLoadedData);
  }

  return () => {
    if (video) {
      video.removeEventListener('loadeddata', handleLoadedData);
    }
  };
}, [model]);


  const drawDetections = (predictions) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    // Dummy example — replace with real logic to parse predictions
    // For example: boxes, scores, classes = predictions
    // Below is just a sample shape parser you will likely need to adapt

    const [boxes, scores, classes] = predictions; // adjust based on output

    // Example drawing logic (you must adapt this)
    /*
    for (let i = 0; i < boxes.shape[1]; i++) {
      const [y1, x1, y2, x2] = boxes.dataSync().slice(i * 4, (i + 1) * 4);
      const score = scores.dataSync()[i];
      if (score > 0.5) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1 * 640, y1 * 480, (x2 - x1) * 640, (y2 - y1) * 480);
        ctx.fillStyle = 'red';
        ctx.fillText(`Class ${classes.dataSync()[i]}: ${score.toFixed(2)}`, x1 * 640, y1 * 480 - 10);
      }
    }
    */
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} width="640" height="480" />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default Yolo11sObjectDetection;
