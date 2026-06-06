console.log("SCRIPT LOADED");

// =====================
// IMAGE DATABASE
// =====================
const imageDatabase = [
  "./images/827A0231.jpg",
  "./images/DSC_0493.jpg"
];

// =====================
// STORAGE
// =====================
let labeledDescriptors = [];

// =====================
// LOAD MODELS (IMPORTANT)
// =====================
async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('./models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('./models');

  console.log("Models loaded");
}

// =====================
// LOAD IMAGE & GET FACE DESCRIPTOR
// =====================
async function getLabeledFaceDescriptions() {
  const labels = ["person"]; // boleh tambah nama later

  return Promise.all(
    labels.map(async (label) => {

      const descriptions = [];

      for (let imgPath of imageDatabase) {
        const img = await faceapi.fetchImage(imgPath);

        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          descriptions.push(detections.descriptor);
        }
      }

      console.log(`${label} descriptors:`, descriptions.length);

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

// =====================
// MAIN RUN
// =====================
async function start() {
  await loadModels();

  labeledDescriptors = await getLabeledFaceDescriptions();

  console.log("TOTAL LABELS:", labeledDescriptors.length);

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

  console.log("Face matcher ready");
}

start();
