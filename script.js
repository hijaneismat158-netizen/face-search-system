const imageUpload = document.getElementById('imageUpload');
const gallery = document.getElementById('gallery');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]).then(() => {
  console.log("Models loaded");
});

imageUpload.addEventListener('change', async () => {
  gallery.innerHTML = "";

  const files = imageUpload.files;

  for (let file of files) {
    const img = await loadImage(file);
    gallery.appendChild(img);

    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions()
    );

    const canvas = faceapi.createCanvasFromMedia(img);
    gallery.appendChild(canvas);

    faceapi.matchDimensions(canvas, img);

    const resized = faceapi.resizeResults(detections, img);
    faceapi.draw.drawDetections(canvas, resized);
  }
});

function loadImage(file) {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.width = 200;
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
  });
}
