import { mockProfiles } from "../data/mockData";
import { loadImage, detectFaceWithLandmarks, extractEyeRegion } from "./imageUtils";
import { extractFaceEmbedding, loadModels } from "./faceUtils";  

/**
 * Embedding structure with face + optional eye descriptors
 */
export interface ProfileEmbedding {
  label: string; // profile.id
  faceDescriptors: Float32Array[]; // required
  leftEye?: Float32Array;
  rightEye?: Float32Array;
}

/**
 * Build embeddings for all mock profiles (face + eyes)
 */
export const buildMockEmbeddings = async (): Promise<ProfileEmbedding[]> => {
  await loadModels();
  const embeddings: ProfileEmbedding[] = [];

  for (const profile of mockProfiles) {
    try {
      const faceImg = await loadImage(profile.profileImage);
      const faceDescriptor = await extractFaceEmbedding(faceImg);

      if (!faceDescriptor) {
        console.warn(`Skipping ${profile.name}: no face embedding.`);
        continue; // skip invalid
      }

      let leftEyeDesc: Float32Array | undefined;
      let rightEyeDesc: Float32Array | undefined;

      if (profile.eyeImage) {
        try {
          const eyeImg = await loadImage(profile.eyeImage);
          const eyeDetection = await detectFaceWithLandmarks(eyeImg);

          if (eyeDetection) {
            const eyeLandmarks = extractEyeRegion(eyeDetection.landmarks);
            leftEyeDesc = new Float32Array(eyeLandmarks.leftEye.flatMap(p => [p.x, p.y]));
            rightEyeDesc = new Float32Array(eyeLandmarks.rightEye.flatMap(p => [p.x, p.y]));
          }
        } catch (eyeErr) {
          console.warn(`Eye extraction failed for ${profile.name}`, eyeErr);
        }
      }

      embeddings.push({
        label: profile.id,
        faceDescriptors: [faceDescriptor], // always non-empty
        leftEye: leftEyeDesc,
        rightEye: rightEyeDesc,
      });
    } catch (err) {
      console.error(`Error building embedding for ${profile.name}`, err);
    }
  }

  return embeddings;
};
