import React, { useState, useEffect } from 'react';
import { Eye, Zap, Search, Brain, Shield } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { loadImage } from '../utils/imageUtils';
import { validateEyeImage, extractFaceEmbedding, matchEmbedding, isModelLoaded, loadModels } from '../utils/faceUtils';
import { mockProfiles, mockEmbeddingsCache } from '../data/mockData';
import { MatchResult } from '../App'; // import your type

interface ProcessingInterfaceProps {
  capturedImage: string | null;
  statusMessage?: string; 
  onProcessComplete: (result: MatchResult) => void;
}

const ProcessingInterface: React.FC<ProcessingInterfaceProps> = ({ capturedImage, onProcessComplete }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  const steps = [
    { icon: Eye, label: 'Analyzing Eye Features', description: 'Extracting iris patterns and pupil characteristics' },
    { icon: Brain, label: 'AI Processing', description: 'Deep learning analysis of unique eye markers' },
    { icon: Search, label: 'Database Search', description: 'Comparing against stored profiles' },
    { icon: Shield, label: 'Verification', description: 'Validating match accuracy and confidence' }
  ];

  const processImage = async () => {
    if (!capturedImage) return;

    try {
      // Step 1: Analyze Eye Features
      setCurrentStep(0);
      setProgress(25);
      setStatusMessage('Analyzing eye features...');
      const img = await loadImage(capturedImage);

      // Step 2: AI Processing
      setCurrentStep(1);
      setProgress(50);
      setStatusMessage('AI processing...');
      const validationResult = await validateEyeImage(img);
      if (!validationResult.isValid) throw new Error(validationResult.message);

      // Step 3: Database Search
      setCurrentStep(2);
      setProgress(75);
      setStatusMessage('Converting image to embedding and matching...');

      // Extract embedding from uploaded/captured image
      const queryEmbedding = await extractFaceEmbedding(img);
      if (!queryEmbedding) throw new Error("Failed to extract embedding from the uploaded image.");

      // Match against mockProfiles embeddings
      const bestMatch = matchEmbedding(queryEmbedding, mockEmbeddingsCache);
      let result: MatchResult;

      if (bestMatch.label === "unknown") {
        result = {
          id: "0",
          name: "Unknown",
          age: 0,
          occupation: "Unknown",
          location: "Unknown",
          confidence: 0,
          lastSeen: "",
          profileImage: "",
          verified: false,
        };
      } else {
        const profile = mockProfiles.find(p => p.id === bestMatch.label)!;
        result = {
          id: profile.id,
          name: profile.name,
          age: profile.age,
          occupation: profile.occupation,
          location: profile.location,
          confidence: 1 - bestMatch.distance, // approximate confidence
          lastSeen: profile.lastSeen,
          profileImage: profile.profileImage,
          verified: profile.verified,
        };
      }

      // Step 4: Verification
      setCurrentStep(3);
      setProgress(100);
      setStatusMessage('Verification complete!');
      onProcessComplete(result);

    } catch (error) {
      console.error('Processing failed:', error);
      setStatusMessage(error instanceof Error ? `Error: ${error.message}` : 'Unknown error occurred.');
     
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!isModelLoaded) await loadModels();
        if (mockEmbeddingsCache.length === 0) {
          // Build embeddings from existing mockProfiles (images already verified)
          await Promise.all(mockProfiles.map(async profile => {
            // Only build if not already present
            if (!profile.embeddings || profile.embeddings.length === 0) {
              const descriptors: Float32Array[] = [];
              const urls = [profile.profileImage, profile.eyeImage];
              for (const url of urls) {
                if (!url) continue;
                try {
                  const image = await loadImage(url);
                  const desc = await extractFaceEmbedding(image);
                  if (desc) descriptors.push(desc);
                } catch (err) { console.warn(err); }
              }
              if (descriptors.length > 0) profile.embeddings = descriptors;
            }
          }));

          // Fill global cache
          mockEmbeddingsCache.splice(0, mockEmbeddingsCache.length, 
            ...mockProfiles
              .filter(p => p.embeddings && p.embeddings.length > 0)
              .map(p => ({ label: p.id, descriptors: p.embeddings! }))
          );
        }

        // Start processing
        processImage();
      } catch (err) {
        console.error("Initialization failed:", err);
        setStatusMessage("Initialization failed. Check console.");
        onProcessComplete({
          id: "0",
          name: "Unknown",
          age: 0,
          occupation: "Unknown",
          location: "Unknown",
          confidence: 0,
          lastSeen: "",
          profileImage: "",
          verified: false,
        });
      }
    };

    initialize();
  }, [capturedImage, onProcessComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-900 text-white font-sans">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-spin" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Processing Your Eye Scan</h2>
          <p className="text-gray-400 text-sm sm:text-base px-4 sm:px-0">{statusMessage}</p>
        </div>

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="mb-8">
            <div className="relative max-w-48 sm:max-w-xs mx-auto">
              <img
                src={capturedImage}
                alt="Captured eye"
                className="w-full h-auto rounded-2xl shadow-lg opacity-80"
              />
              <div className="absolute inset-0 border-2 border-blue-400 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white font-semibold mt-3 text-sm sm:text-base">{Math.round(progress)}% Complete</p>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div
                key={index}
                className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-500/20 border-2 border-blue-400' 
                    : isCompleted 
                      ? 'bg-green-500/10 border border-green-400/30' 
                      : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-blue-500 animate-pulse' : isCompleted ? 'bg-green-500' : 'bg-white/10'
                }`}>
                  <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white animate-spin' : 'text-white'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-semibold text-sm sm:text-base ${isActive ? 'text-white' : isCompleted ? 'text-green-300' : 'text-gray-400'}`}>
                    {step.label}
                  </h3>
                  <p className={`text-xs sm:text-sm ${isActive ? 'text-blue-200' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                </div>
                <div className="w-6 flex-shrink-0">
                  {isCompleted && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {isActive && (
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessingInterface;
