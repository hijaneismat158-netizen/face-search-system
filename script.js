console.log("SCRIPT LOADED");

// =====================
// IMAGE DATABASE (FIX PATH HERE)
// =====================
const imageDatabase = [
  "./gallery/827A0231.jpg",
  "./gallery/_DSC8395.jpg"
];

// =====================
// STORAGE
// =====================
let labeledDescriptors = [];
let faceMatcher;

// =====================
// LOAD MODELS
// =====================
async function loadModels() {
  try {
    console.log("Loading models...");

    await faceapi.nets.ssdMobilenetv1.loadFromUri('./models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('./models');

    console.log("Models loaded successfully");
  } catch (err) {
    console.error("❌ MODEL LOAD FAILED:", err);
  }
}

// =====================
// GET FACE DESCRIPTORS
// =====================
async function getLabeledFaceDescriptions() {
  const label = "person";
  const descriptions = [];

  for (let imgPath of imageDatabase) {
    try {
      const img = await faceapi.fetchImage(imgPath);

      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        descriptions.push(detections.descriptor);
        console.log("Face found in:", imgPath);
      } else {
        console.log("No face detected in:", imgPath);
      }

    } catch (err) {
      console.error("Image error:", imgPath, err);
    }
  }

  if (descriptions.length === 0) {
    console.warn("⚠️ No faces found in database images!");
  }

  return [new faceapi.LabeledFaceDescriptors(label, descriptions)];
}

// =====================
// START APP
// =====================
async function start() {
  await loadModels();

  labeledDescriptors = await getLabeledFaceDescriptions();

  console.log("TOTAL LABELS:", labeledDescriptors.length);

  if (labeledDescriptors.length > 0) {
    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    console.log("Face matcher ready");
  } else {
    console.warn("Face matcher NOT created (no data)");
  }
}

// =====================
// RUN
// =====================
start();
