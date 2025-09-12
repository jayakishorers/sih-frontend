export interface MatchResult {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  confidence: number;
  lastSeen: string;
  profileImage: string;
  verified: boolean;
}

export interface ProfileEmbedding {
  label: string; // profile.id
  faceDescriptors: Float32Array[];
  leftEye?: Float32Array;
  rightEye?: Float32Array;
}
