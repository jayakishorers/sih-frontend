import * as faceapi from "face-api.js";

/**
 * Load image safely from URL or local path
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

/**
 * Extract ImageData from canvas or image
 */
export const getImageData = (
  canvasOrImage: HTMLCanvasElement | HTMLImageElement
): ImageData => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create 2D context");

  if (canvasOrImage instanceof HTMLCanvasElement) {
    canvas.width = canvasOrImage.width;
    canvas.height = canvasOrImage.height;
    ctx.drawImage(canvasOrImage, 0, 0);
  } else {
    canvas.width = canvasOrImage.naturalWidth || canvasOrImage.width;
    canvas.height = canvasOrImage.naturalHeight || canvasOrImage.height;
    ctx.drawImage(canvasOrImage, 0, 0);
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Calculate image blur using Variance of Laplacian
 */
export const calculateBlur = (imageData: ImageData): number => {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);

  // Convert to grayscale
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Apply Laplacian kernel
  const lap = new Float32Array(width * height);
  const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let k = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ix = x + kx;
          const iy = y + ky;
          sum += gray[iy * width + ix] * kernel[k++];
        }
      }
      lap[y * width + x] = sum;
    }
  }

  // Compute variance
  const mean = lap.reduce((acc, val) => acc + val, 0) / lap.length;
  const variance = lap.reduce((acc, val) => acc + (val - mean) ** 2, 0) / lap.length;

  return variance;
};

/**
 * Detect face with landmarks + descriptor
 */
export const detectFaceWithLandmarks = async (
  img: HTMLImageElement
): Promise<
  | (faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
    > & { descriptor: Float32Array })
  | null
> => {
  try {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    const detection = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor();
    if (!detection) throw new Error("No face detected");
    return detection;
  } catch (err) {
    console.error("Face detection failed:", err);
    return null;
  }
};

/**
 * Extract eye regions from landmarks
 */
export const extractEyeRegion = (landmarks: faceapi.FaceLandmarks68) => {
  return {
    leftEye: landmarks.getLeftEye(),
    rightEye: landmarks.getRightEye(),
  };
};
