import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCcw, Zap, Eye } from 'lucide-react';

interface CameraInterfaceProps {
  onImageCapture: (imageData: string) => void;
  onBack: () => void;
  modelsLoaded?: boolean;       // ✅ optional flag for loaded models
  loadingModels?: boolean;      // ✅ optional flag for model loading
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({
  onImageCapture,
  onBack,
  modelsLoaded = false,
  loadingModels = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);

        videoRef.current.onloadedmetadata = () => setIsCameraReady(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsStreaming(false);
    setIsCameraReady(false);
  };

  const captureImage = () => {
    if (!modelsLoaded) {
      alert('Models are still loading. Please wait...');
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onImageCapture(imageData);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
            <span>Cancel</span>
          </button>
          <div className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-blue-400" />
            <h1 className="text-white font-semibold">Eye Scanner</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-2xl w-full mx-auto">
          {error ? (
            <div className="bg-red-900/50 border border-red-500 rounded-2xl p-8 text-center">
              <Camera className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Camera Error</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto max-h-80 sm:max-h-96 object-cover"
                />

                {/* Eye Tracking Overlay */}
                {isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-32 h-20 sm:w-48 sm:h-32 border-2 border-blue-400 rounded-full opacity-80">
                      <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {(loadingModels || !isCameraReady) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center">
                      <Zap className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-2" />
                      <p className="text-white">
                        {loadingModels ? 'Loading AI Models...' : 'Initializing camera...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Position Your Eye</h3>
                <p className="text-gray-400 mb-4 text-sm sm:text-base px-4 sm:px-0">
                  Align your eye within the blue circle. Ensure good lighting and keep steady.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={captureImage}
                    disabled={!isCameraReady || !modelsLoaded}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Capture Eye Scan</span>
                  </button>

                  <button
                    onClick={() => {
                      stopCamera();
                      setTimeout(startCamera, 100);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 sm:px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Reset Camera</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraInterface;
