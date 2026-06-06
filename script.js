const uploadInput =
  document.getElementById("imageUpload") ||
  document.getElementById("uploadInput");

const resultsDiv =
  document.getElementById("results") ||
  document.getElementById("gallery");

let labeledDescriptors = [];

// =====================
// 1. LOAD MODELS
// =====================
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models")
])
.then(startSystem)
.catch(err => console.log("Model error:", err));


// =====================
// 2. BUILD DATABASE (LOCAL IMAGES ONLY)
// =====================
async function startSystem() {
  console.log("Models Loaded");

  // 🔥 IMPORTANT: USE LOCAL FILES ONLY
  const imageDatabase = [
    "./images/827A0231.jpg",
    "./images/DSC_0493.jpg"
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
      console.log("Error loading image:", imgUrl);
    }
  }

  console.log("Database Ready:", labeledDescriptors.length);
}


// =====================
// 3. FACE SEARCH
// =====================
uploadInput.addEventListener("change", async function () {
  const file = this.files[0];

  if (!file) return;

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

  let bestMatch = null;
  let bestDistance = 1;

  for (let item of labeledDescriptors) {
    const distance = faceapi.euclideanDistance(
      queryDescriptor,
      item.descriptor
    );

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = item.url;
    }
  }

  if (bestMatch && bestDistance < 0.7) {
    showResults([bestMatch]);
  } else {
    showResults([]);
  }
});


// =====================
// 4. SHOW RESULTS
// =====================
function showResults(images) {
  resultsDiv.innerHTML = "";

  if (images.length === 0) {
    resultsDiv.innerHTML = "<p>No match found</p>";
    return;
  }

  images.forEach(url => {
    const box = document.createElement("div");

    const img = document.createElement("img");
    img.src = url;
    img.width = 150;

    const text = document.createElement("p");
    text.innerText = "Match Found";

    box.appendChild(img);
    box.appendChild(text);

    resultsDiv.appendChild(box);
  });
}
