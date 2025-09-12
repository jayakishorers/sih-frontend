import React from 'react';
import { Eye, Camera, Upload, Zap, Shield, Users, ArrowRight, Sparkles } from 'lucide-react';
import { AppState } from '../App';

interface HomePageProps {
  onStateChange: (state: AppState) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStateChange }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-20 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Eye className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EyeID Pro</h1>
                <p className="text-xs text-gray-400">AI-Powered Eye Recognition</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-300">
              <span className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>Latest AI Technology</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Identify Anyone by Their
              <span className="block text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text">
                Eye Pattern
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed px-4 sm:px-0">
              Revolutionary AI technology that analyzes iris patterns, pupil characteristics, 
              and scleral features to identify individuals with unprecedented accuracy.
            </p>
            <p className="text-base sm:text-lg text-gray-400 mb-8 px-4 sm:px-0">
              Works across different lighting conditions, angles, and image qualities
            </p>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 px-4 sm:px-0">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">99.7%</h3>
              <p className="text-gray-400">Accuracy Rate</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">&lt;2s</h3>
              <p className="text-gray-400">Processing Time</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">10M+</h3>
              <p className="text-gray-400">Profiles Stored</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4 sm:px-0">
            <button
              onClick={() => onStateChange('camera')}
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <Camera className="h-6 w-6" />
                <span className="text-base sm:text-lg">Scan Your Eye</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
            </button>
            
            <button
              onClick={() => onStateChange('upload')}
              className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-3">
                <Upload className="h-6 w-6" />
                <span className="text-base sm:text-lg">Upload Eye Image</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* How it Works */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10 max-w-3xl mx-4 sm:mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">How Eye Recognition Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-white">Capture</h4>
                <p className="text-gray-400 text-sm leading-relaxed">AI extracts iris patterns, pupil shape, and scleral vessels from your eye image</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-white">Analyze</h4>
                <p className="text-gray-400 text-sm leading-relaxed">Deep learning models compare features against our secure database</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-white">Identify</h4>
                <p className="text-gray-400 text-sm leading-relaxed">Get instant results with confidence scores and personal details</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;