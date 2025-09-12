  import * as faceapi from "@vladmandic/face-api";
  import { calculateBlur, getImageData } from "./imageUtils";
  import { mockProfiles, MockProfile } from "../data/mockData";

  export let isModelLoaded = false;
  let modelLoadingPromise: Promise<void> | null = null;

  // Cache embeddings to avoid rebuilding every time
  let mockEmbeddingsCache: { label: string; descriptors: Float32Array[] }[] = [];

  export interface ValidationResult {
    isValid: boolean;
    message: string;
  }

  type InputElement = HTMLImageElement | HTMLCanvasElement;

  /* -------------------------------------------------------------------------- */
  /*                               MODEL LOADING                                */
  /* -------------------------------------------------------------------------- */
  export const loadModels = async (baseUrl = "/models"): Promise<void> => {
    if (isModelLoaded) return;
    if (modelLoadingPromise) return modelLoadingPromise;

    modelLoadingPromise = (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(baseUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(baseUrl),
        ]);
        isModelLoaded = true;
        console.log("✅ Face-API models loaded from", baseUrl);
      } catch (errLocal) {
        console.warn("Local model load failed, trying CDN fallback", errLocal);
        const MODEL_URL =
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        isModelLoaded = true;
        console.log("✅ Face-API models loaded from CDN");
      } finally {
        modelLoadingPromise = null;
      }
    })();

    return modelLoadingPromise;
  };

  /* -------------------------------------------------------------------------- */
  /*                             IMAGE LOADING HELPERS                          */
  /* -------------------------------------------------------------------------- */
  export const loadImageFromUrl = async (url: string): Promise<HTMLImageElement> => {
    const tryDirect = () =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
          await img.decode();
          resolve(img);
        };
        img.onerror = (e) => reject(e);
        img.src = url;
      });

    try {
      return await tryDirect();
    } catch {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch image ${url}: ${resp.status}`);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = objectUrl;
      await img.decode();
      URL.revokeObjectURL(objectUrl);
      return img;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                           IMAGE VALIDATION (QUALITY)                       */
  /* -------------------------------------------------------------------------- */
  export const validateEyeImage = async (
    input: InputElement
  ): Promise<ValidationResult> => {
    try {
      if (!isModelLoaded) await loadModels();

      const width = input instanceof HTMLImageElement ? input.naturalWidth || input.width : input.width;
      const height = input instanceof HTMLImageElement ? input.naturalHeight || input.height : input.height;

      if (width < 100 || height < 100) return { isValid: false, message: "Image resolution too low." };
      if (width > 2000 || height > 2000) return { isValid: false, message: "Image resolution too high." };

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
      const detections = await faceapi.detectAllFaces(input, options).withFaceLandmarks().withFaceDescriptors();

      if (!detections || detections.length === 0) return { isValid: false, message: "No face detected." };
      if (detections.length > 1) return { isValid: false, message: "Multiple faces detected." };

      const landmarks = detections[0].landmarks;
      if ((landmarks.getLeftEye()?.length ?? 0) === 0 && (landmarks.getRightEye()?.length ?? 0) === 0)
        return { isValid: false, message: "Eyes not detected." };

      const imageData = getImageData(input);
      const blurValue = calculateBlur(imageData);
      if (blurValue < 100) return { isValid: false, message: "Image too blurry." };

      const faceScore = detections[0].detection.score ?? 0;
      if (faceScore < 0.7) return { isValid: false, message: "Face detection confidence too low." };

      return { isValid: true, message: "Image is valid" };
    } catch (err) {
      console.error("validateEyeImage error", err);
      return { isValid: false, message: err instanceof Error ? err.message : String(err) };
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                          FACE EMBEDDING GENERATION                         */
  /* -------------------------------------------------------------------------- */
  export const extractFaceEmbedding = async (
    input: InputElement
  ): Promise<Float32Array | null> => {
    if (!isModelLoaded) await loadModels();

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(input, options).withFaceLandmarks().withFaceDescriptor();
      if (!detection || !detection.descriptor) return null;

      return new Float32Array(detection.descriptor);
    } catch (err) {
      console.error("extractFaceEmbedding failed:", err);
      return null;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                          MATCHING EMBEDDINGS                               */
  /* -------------------------------------------------------------------------- */
  export const matchEmbedding = (
    queryEmbedding: Float32Array,
    labeledEmbeddings: { label: string; descriptors: Float32Array[] }[],
    threshold = 0.6
  ): { label: string; distance: number } => {
    const labeledFaceDescriptors = labeledEmbeddings.map(
      (entry) => new faceapi.LabeledFaceDescriptors(entry.label, entry.descriptors)
    );
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, threshold);
    const bestMatch = faceMatcher.findBestMatch(queryEmbedding);
    return { label: bestMatch.label, distance: bestMatch.distance };
  };

  /* -------------------------------------------------------------------------- */
  /*                        BUILD EMBEDDINGS FROM MOCK DATA                     */
  /* -------------------------------------------------------------------------- */
  export const buildMockEmbeddings = async () => {
    if (!isModelLoaded) await loadModels();

    const embeddings: { label: string; descriptors: Float32Array[] }[] = [];

    for (const profile of mockProfiles) {
      const descriptors: Float32Array[] = [];
      const urls = [profile.profileImage, profile.eyeImage];

      for (const url of urls) {
        if (!url) continue;
        try {
          const img = await loadImageFromUrl(url);
          const descriptor = await extractFaceEmbedding(img);
          if (descriptor) descriptors.push(descriptor);
        } catch (err) {
          console.warn(`⚠️ Could not extract embedding for ${profile.name} (${url})`, err);
        }
      }

      if (descriptors.length > 0) {
        profile.embeddings = descriptors;
        embeddings.push({ label: profile.id, descriptors });
      }
    }

    mockEmbeddingsCache = embeddings;
    return embeddings;
  };

  /* -------------------------------------------------------------------------- */
  /*                    VALIDATE IMAGE AGAINST MOCK PROFILES                    */
  /* -------------------------------------------------------------------------- */
  export const validateAgainstMockData = async (
    input: HTMLImageElement
  ): Promise<{ isValid: boolean; message: string; profile?: MockProfile }> => {
    try {
      if (!isModelLoaded) await loadModels();
      if (mockEmbeddingsCache.length === 0) await buildMockEmbeddings();
      if (mockEmbeddingsCache.length === 0) return { isValid: false, message: "No embeddings available." };

      const queryEmbedding = await extractFaceEmbedding(input);
      if (!queryEmbedding) return { isValid: false, message: "Could not generate embedding." };

      const bestMatch = matchEmbedding(queryEmbedding, mockEmbeddingsCache);
      if (bestMatch.label === "unknown") return { isValid: false, message: "No match found in dataset" };

      const matchedProfile = mockProfiles.find((p) => p.id === bestMatch.label);

      return {
        isValid: true,
        message: `Matched ${matchedProfile?.name} (distance ${bestMatch.distance.toFixed(3)})`,
        profile: matchedProfile,
      };
    } catch (err) {
      console.error("validateAgainstMockData error", err);
      return { isValid: false, message: err instanceof Error ? err.message : String(err) };
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              FULL PIPELINE                                 */
  /* -------------------------------------------------------------------------- */
  export const matchFace = async (
    input: HTMLImageElement
  ): Promise<{ profile?: MockProfile; message: string }> => {
    await loadModels();
    const validation = await validateEyeImage(input);
    if (!validation.isValid) {
      return { message: validation.message }; // ✅ stops here for dummy images
    }
    const result = await validateAgainstMockData(input);
    return { profile: result.profile, message: result.message };
  };

