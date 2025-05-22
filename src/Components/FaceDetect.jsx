'use client';
import  { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import Webcam from 'react-webcam';

const FaceDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runFaceDetection = async () => {
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;

    const detector = await faceDetection.createDetector(model, {
      runtime: 'tfjs',
      maxFaces: 5,
    });

    const detect = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const faces = await detector.estimateFaces(video);
        const ctx = canvasRef.current.getContext('2d');

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        faces.forEach((face) => {
          const { xMin, yMin, width, height } = face.box;
          const color = 'green';
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.font = '16px Arial';
          ctx.fillStyle = color;

          ctx.beginPath();
          ctx.fillText('Face', xMin, yMin - 5);
          ctx.rect(xMin, yMin, width, height);
          ctx.stroke();
        });
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  useEffect(() => {
    tf.ready().then(runFaceDetection);
  }, []);

  return (
    <div className="relative w-full max-w-[640px] mx-auto">
      <Webcam
        ref={webcamRef}
        muted
        playsInline
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          margin: 'auto',
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          margin: 'auto',
          zIndex: 8,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
};

export default FaceDetection;
