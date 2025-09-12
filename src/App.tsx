import React, { useState, useEffect } from "react";
import { Eye, Shield, Zap, Users } from "lucide-react";
import HomePage from "./components/HomePage";
import CameraInterface from "./components/CameraInterface";
import UploadInterface from "./components/UploadInterface";
import ProcessingInterface from "./components/ProcessingInterface";
import ResultsInterface from "./components/ResultsInterface";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { MockProfile } from "./data/mockData";
import { loadModels, extractFaceEmbedding,validateEyeImage } from "./utils/faceUtils";
import { buildMockEmbeddings, ProfileEmbedding } from "./utils/mockEmbeddingBuilder";
import { detectFaceWithLandmarks } from "./utils/imageUtils";

export type AppState = "home" | "camera" | "upload" | "processing" | "results" | "privacy";

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

function App() {
  const [currentState, setCurrentState] = useState<AppState>("home");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [mockEmbeddings, setMockEmbeddings] = useState<ProfileEmbedding[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  // ✅ Load models and build mock embeddings on mount
  useEffect(() => {
    const init = async () => {
      try {
        setStatusMessage("Loading AI models...");
        await loadModels();
        setModelsLoaded(true);
        setLoadingModels(false);
        setStatusMessage("Models loaded successfully!");

        const embeddings = await buildMockEmbeddings();
        setMockEmbeddings(embeddings);
      } catch (err) {
        console.error("Init failed:", err);
        setModelsLoaded(false);
        setLoadingModels(false);
        setStatusMessage("Failed to load AI models. Check network.");
      }
    };
    init();
  }, []);

  const handleStateChange = (newState: AppState) => {
    setCurrentState(newState);
  };

  // 🔹 Euclidean distance between two embeddings
  const calculateDistance = (a: Float32Array, b: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

  const handleImageCapture = async (imageData: string) => {
    if (!modelsLoaded) {
      setStatusMessage("Models are still loading. Please wait...");
      return;
    }

    setCapturedImage(imageData);
    setCurrentState("processing");
    setStatusMessage("Analyzing image...");

    try {
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
// ✅ Add face/eye validation here
const validation = await validateEyeImage(img); 
if (!validation.isValid) {
  setStatusMessage(validation.message); // e.g., "No face detected" or "Multiple faces detected"
  setMatchResult(null);
  setTimeout(() => setCurrentState("results"), 2000);
  return; // stop further processing
}

      // Step 1: Detect face + landmarks
      const detection = await detectFaceWithLandmarks(img);
      if (!detection) {
        setStatusMessage("No face detected.");
        setMatchResult(null);
        setTimeout(() => setCurrentState("results"), 2000);
        return;
      }

      // Step 2: Extract embedding
      const faceEmbedding = await extractFaceEmbedding(img);
      if (!faceEmbedding) {
        setStatusMessage("Could not generate face embedding.");
        setMatchResult(null);
        setTimeout(() => setCurrentState("results"), 2000);
        return;
      }

      // Step 3: Compare with mock embeddings
      // Step 3: Compare with mock embeddings
let bestMatch: { profile: MockProfile; distance: number } | null = null;

for (const mock of mockEmbeddings) {
  for (const mockDesc of mock.faceDescriptors) {
    const dist = calculateDistance(faceEmbedding, mockDesc);

    if (!bestMatch || dist < bestMatch.distance) {
      const profile = (await import("./data/mockData")).mockProfiles.find(
        (p) => p.id === mock.label
      );
      if (profile) {
        bestMatch = { profile, distance: dist };
      }
    }
  }
}

// ✅ If no match found, set matchResult = null
const CONFIDENCE_THRESHOLD = 0.5; // 50%, adjust as needed

if (!bestMatch || 1 - bestMatch.distance < CONFIDENCE_THRESHOLD) {
  setStatusMessage("User Not Found");
  setMatchResult(null);
  setTimeout(() => setCurrentState("results"), 2000);
  return;
}


// Step 4: Build match result
const result: MatchResult = {
  id: bestMatch.profile.id,
  name: bestMatch.profile.name,
  age: bestMatch.profile.age,
  occupation: bestMatch.profile.occupation,
  location: bestMatch.profile.location,
  confidence: Math.round(Math.max(0, 1 - bestMatch.distance) * 100),
  lastSeen: bestMatch.profile.lastSeen,
  profileImage: bestMatch.profile.profileImage,
  verified: bestMatch.profile.verified,
};

setMatchResult(result);
setStatusMessage(`Match found: ${result.name}`);
setTimeout(() => setCurrentState("results"), 2000);

    } catch (err) {
      console.error("Error during image processing:", err);
      setStatusMessage("Processing failed. Please try again.");
      setMatchResult(null);
      setTimeout(() => setCurrentState("results"), 2000);
    }
  };

  const renderCurrentInterface = () => {
  switch (currentState) {
    case "home":
      return <HomePage onStateChange={handleStateChange} />;
    case "camera":
      return (
        <CameraInterface
          onImageCapture={handleImageCapture}
          onBack={() => setCurrentState("home")}
          modelsLoaded={modelsLoaded}
          loadingModels={loadingModels}
        />
      );
    case "upload":
      return (
        <UploadInterface
          onImageCapture={handleImageCapture}
          onBack={() => setCurrentState("home")}
          modelsLoaded={modelsLoaded}
          loadingModels={loadingModels}
        />
      );
    case "processing":
      return (
        <ProcessingInterface
          capturedImage={capturedImage}
          statusMessage={statusMessage}
          onProcessComplete={(result) => {
            console.log("Process complete:", result);
            setMatchResult(result);
            setCurrentState("results");
          }}
        />
      );

    // ✅ NEW: Handle results screen
    case "results":
      return (
        <ResultsInterface
          matchResult={matchResult}
          capturedImage={capturedImage}
          statusMessage={statusMessage}
          onBack={() => setCurrentState("home")}
        />
      );

    case "privacy":
      return <PrivacyPolicy onBack={() => setCurrentState("home")} />;
    default:
      return <HomePage onStateChange={handleStateChange} />;
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">{renderCurrentInterface()}</div>

        {/* Footer only on home */}
        {currentState === "home" && (
          <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <Eye className="h-6 w-6 text-blue-400" />
                  <span className="text-white font-semibold">EyeID Pro</span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-300">
                  <button
                    onClick={() => setCurrentState("privacy")}
                    className="hover:text-blue-400 transition-colors"
                  >
                    Privacy Policy
                  </button>
                  <span className="hover:text-blue-400 transition-colors cursor-pointer">
                    Terms of Service
                  </span>
                  <span className="hover:text-blue-400 transition-colors cursor-pointer">
                    About Us
                  </span>
                  <span className="hover:text-blue-400 transition-colors cursor-pointer">
                    Contact
                  </span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    <span>Fast AI</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">10M+ Users</span>
                    <span className="sm:hidden">10M+</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
