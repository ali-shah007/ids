export const drawRectangle = (detections, ctx) => {
  detections.forEach(prediction => {
    const [x, y, width, height] = prediction['bbox'];
    const text = prediction['class'];

    const color = 'green';
    ctx.strokeStyle = color; // Fixed typo: "strokeSylt" -> "strokeStyle"
    ctx.font = '16px Arial'; // Added font size
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.fillText(text, x, y - 5); // Draw label slightly above the box
    ctx.rect(x, y, width, height); // Fixed: order is (x, y, width, height)
    ctx.stroke();
  });
};
