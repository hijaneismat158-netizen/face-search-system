const uploadInput = document.getElementById("imageUpload") || document.getElementById("uploadInput");
const resultsDiv = document.getElementById("results") || document.getElementById("gallery");

let labeledDescriptors = [];

// =====================
// 1. LOAD MODELS
// =====================
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models")
]).then(startSystem);

async function startSystem() {
  console.log("Models Loaded");

  // OPTIONAL: add database images here
  const imageDatabase = [
    "https://drive.google.com/uc?export=view&id=FILE_ID_1",
    "https://drive.google.com/uc?export=view&id=FILE_ID_2"
  ];

  for (let imgUrl of imageDatabase) {
    try {
      const img = await faceapi.fetchImage(imgUrl);

      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        labeledDescriptors.push({
          url: imgUrl,
          descriptor: detection.descriptor
        });
      }

    } catch (err) {
      console.log("Error loading:", imgUrl);
    }
  }

  console.log("Database Ready:", labeledDescriptors.length);
}

// =====================
// 2. UPLOAD & SEARCH FACE
// =====================
uploadInput.addEventListener("change", async function () {
  const file = this.files[0];

  const img = await faceapi.bufferToImage(file);

  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("No face detected!");
    return;
  }

  const queryDescriptor = detection.descriptor;

  let results = [];

  for (let item of labeledDescriptors) {
    const distance = faceapi.euclideanDistance(
      queryDescriptor,
      item.descriptor
    );

    // THRESHOLD (IMPORTANT)
    if (distance < 0.7) {
      results.push(item.url);
    }
  }

  showResults(results);
});

// =====================
// 3. SHOW RESULTS
// =====================
function showResults(images) {
  resultsDiv.innerHTML = "";

  if (images.length === 0) {
    resultsDiv.innerHTML = "<p>No match found</p>";
    return;
  }

  images.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.width = 150;
    resultsDiv.appendChild(img);
  });
}
