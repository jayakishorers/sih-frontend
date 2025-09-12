import React, { useRef, useState, useEffect } from "react";
import { Upload, X, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { loadModels, validateEyeImage, extractFaceEmbedding, matchEmbedding , matchFace} from "../utils/faceUtils";
import { buildMockEmbeddings } from "../utils/mockEmbeddingBuilder";  // ✅ real embeddings

interface UploadInterfaceProps {
  onImageCapture: (image: string) => void;
  onBack: () => void;
  modelsLoaded?: boolean;
  loadingModels?: boolean;
}

const UploadInterface: React.FC<UploadInterfaceProps> = ({
  onImageCapture,
  onBack,
  modelsLoaded: parentModelsLoaded,
  loadingModels: parentLoadingModels = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [mockEmbeddings, setMockEmbeddings] = useState<any[]>([]); // ✅ store embeddings here

  // Load models + build embeddings
  useEffect(() => {
    if (parentModelsLoaded !== undefined) {
      setModelsLoaded(parentModelsLoaded);
      setLoadingModels(parentLoadingModels);
      return;
    }

    const init = async () => {
      try {
        setLoadingModels(true);
        await loadModels();
        const built = await buildMockEmbeddings();
        setMockEmbeddings(built);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Model/embedding load failed:", err);
        setError("Failed to load models or embeddings. Check your network.");
      } finally {
        setLoadingModels(false);
      }
    };

    init();
  }, [parentModelsLoaded, parentLoadingModels]);

  const handleFileSelect = (file: File) => {
    setError(null);
    setResult(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const processImage = async () => {
  if (!modelsLoaded) {
    setError("Models are still loading. Please wait...");
    return;
  }
  if (!previewImage) return;

  const img = new Image();
  img.src = previewImage;
  img.crossOrigin = "anonymous";

  try {
    await img.decode(); // Ensure the image is fully loaded
    const result = await matchFace(img); // ✅ full pipeline

    if (!result.profile) {
      setResult(`❌ ${result.message}`);
    } else {
      setResult(`✅ Matched ${result.profile.name} (ID: ${result.profile.id})`);
    }

    onImageCapture(previewImage);
  } catch (err) {
    console.error("Error processing image:", err);
    setError("Failed to process image. Try another one.");
  }
};


  const resetUpload = () => {
    setPreviewImage(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
            <X className="h-6 w-6" />
            <span>Cancel</span>
          </button>
          <div className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-blue-400" />
            <h1 className="text-white font-semibold">Upload Eye Image</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Upload Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full mx-auto">
          {!previewImage ? (
            <div
              className={`relative bg-white/5 backdrop-blur-sm border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
                dragOver ? "border-blue-400 bg-blue-400/10" : "border-white/20 hover:border-white/40"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {dragOver ? "Drop your image here" : "Upload Eye Image"}
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm sm:text-base px-4 sm:px-0">
                    Drag and drop your eye image here, or click to browse
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Choose File
                </button>
                <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                  <p>Supported formats: JPG, PNG, WebP</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {error && (
                <div className="mt-6 bg-red-900/50 border border-red-500 rounded-2xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm sm:text-base">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 text-center">Image Preview</h3>
                <div className="relative max-w-sm sm:max-w-md mx-auto">
                  <img src={previewImage} alt="Eye preview" className="w-full h-auto rounded-2xl shadow-lg" />
                  <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl"></div>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-2xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              {result && (
                <div className="bg-green-900/40 border border-green-500 rounded-2xl p-4 flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-300 text-sm">{result}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={processImage}
                  disabled={!modelsLoaded}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                    !modelsLoaded ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Eye className="h-5 w-5" />
                  <span>{loadingModels ? "Loading Models..." : "Process Image"}</span>
                </button>

                <button
                  onClick={resetUpload}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 sm:px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>Choose Different</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadInterface;
