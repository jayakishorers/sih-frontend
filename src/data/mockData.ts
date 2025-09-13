// mockdata.ts
import { loadModels, extractFaceEmbedding, loadImageFromUrl, isModelLoaded } from "../utils/faceUtils";

// Mock profile interface
export interface MockProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  profileImage: string;
  eyeImage: string;
  phoneNumber: string;
  verified: boolean;
  embeddings?: Float32Array[];   // ✅ embeddings stored here after generation
}

// Global cache (used for search/matching)
export let mockEmbeddingsCache: {
  label: string;
  descriptors: Float32Array[];
}[] = [];

// Main mock profiles (only metadata & image URLs)
export const mockProfiles: MockProfile[] = [
  {
    id: "001",
    name: "Sarah Johnson",
    age: 28,
    occupation: "Software Engineer",
    location: "San Francisco, CA",
    profileImage: "/images/check.webp",
    eyeImage: "/images/check.webp",
    phoneNumber: "6383112232",
    verified: true,
  },
  {
    id: "002",
    name: "Narendra Modi",
    age: 75,
    occupation: "Politician",
    location: "Gujarat,India",
    profileImage:
      "/images/modi.jpg",
    eyeImage:
      "/images/modi.jpg",
    phoneNumber: "9789128581",
    verified: true,
  },
  {
    id: "003",
    name: "Abdul Kalam",
    age: 65,
    occupation: "Scientist,Former President",
    location: "Tamil Nadu,India",
    profileImage:
      "/images/abdulkalam.jpg",
    eyeImage:
      "/images/abdulkalam.jpg",
    phoneNumber: "9789128581",
    verified: true,
  },
  // ➕ add more profiles here
];

// Build embeddings dynamically from images
export const buildMockEmbeddings = async () => {
  if (!isModelLoaded) await loadModels();

  for (const profile of mockProfiles) {
    const descriptors: Float32Array[] = [];

    const urls: (string | undefined)[] = [profile.profileImage, profile.eyeImage];
    for (const url of urls) {
      if (!url) continue;
      try {
        const img = await loadImageFromUrl(url);
        const descriptor = await extractFaceEmbedding(img);
        if (descriptor) descriptors.push(descriptor);
      } catch (err) {
        console.warn(
          `⚠️ Could not extract embedding for ${profile.name} (${url})`,
          err
        );
      }
    }

    if (descriptors.length > 0) {
      profile.embeddings = descriptors;   // ✅ embed inside profile
    }
  }

  // Fill cache from updated profiles
  mockEmbeddingsCache = mockProfiles
    .filter((p) => p.embeddings && p.embeddings.length > 0)
    .map((p) => ({
      label: p.id,
      descriptors: p.embeddings as Float32Array[],
    }));
};

// Get a random profile
export const getRandomProfile = (): MockProfile => {
  const randomIndex = Math.floor(Math.random() * mockProfiles.length);
  return mockProfiles[randomIndex];
};
