import React, { useState } from "react";
import { ArrowLeft, User, MapPin, Briefcase, Calendar, Star, Eye, RefreshCw, Download } from 'lucide-react';
import { MatchResult } from '../App';

interface ResultsInterfaceProps {
  matchResult: MatchResult | null;
  capturedImage: string | null;
  statusMessage?: string;  
  onBack: () => void;
}

const ResultsInterface: React.FC<ResultsInterfaceProps> = ({ matchResult, capturedImage, statusMessage, onBack }) => {
  if (!matchResult) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 max-w-md">
        <p className="text-red-300 text-lg sm:text-xl font-semibold mb-4">
          {statusMessage || "❌ User Not Found"}
        </p>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          🔙 Back to Scan
        </button>
      </div>
    </div>
  );
}



  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
            <span>Back to Scan</span>
          </button>
          <div className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-green-400" />
            <h1 className="text-white font-semibold">Match Found</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-3xl p-4 sm:p-6 mb-8 text-center mx-4 sm:mx-0">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Identity Match Found!</h2>
            <p className="text-green-300 text-sm sm:text-base px-4 sm:px-0">Our AI has successfully identified the person in your eye scan</p>
          </div>

          {/* Main Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4 sm:px-0">
            {/* Left Column - Images */}
            <div className="space-y-6">
              {/* Captured Image */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <span>Your Eye Scan</span>
                </h3>
                {capturedImage && (
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured eye scan"
                      className="w-full h-40 sm:h-48 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl"></div>
                  </div>
                )}
              </div>

              {/* Matched Profile Image */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-400" />
                  <span>Matched Profile</span>
                </h3>
                <div className="relative">
                  <img
                    src={matchResult.profileImage}
                    alt={matchResult.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 border-2 border-green-400/50 rounded-2xl"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Match Confidence</h3>
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl font-bold mb-2 ${getConfidenceColor(matchResult.confidence)}`}>
                    {matchResult.confidence*100}%
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-4">
                    <div 
                      className={`h-full transition-all duration-1000 ${getConfidenceBg(matchResult.confidence)}`}
                      style={{ width: `${matchResult.confidence*100}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {matchResult.confidence*100 >= 90 
                      ? 'Excellent match - Very high confidence' 
                      : matchResult.confidence*100 >= 75 
                        ? 'Good match - High confidence'
                        : 'Possible match - Moderate confidence'}
                  </p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{matchResult.name}</p>
                      <p className="text-gray-400 text-sm">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{matchResult.age} years old</p>
                      <p className="text-gray-400 text-sm">Age</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{matchResult.occupation}</p>
                      <p className="text-gray-400 text-sm">Occupation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{matchResult.location}</p>
                      <p className="text-gray-400 text-sm">Location</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Additional Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Profile ID</span>
                    <span className="text-white font-mono text-sm">#{matchResult.id.padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Phone Number</span>
                    <span className="text-white text-sm">{(matchResult.lastSeen)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Database Status</span>
                    <span className="text-green-400 flex items-center space-x-1 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Scan Another Eye</span>
            </button>
            
            <button
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 sm:px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={() => {
                // Mock download functionality
                const data = JSON.stringify(matchResult, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `eye-scan-result-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Download Results</span>
              <span className="sm:hidden">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsInterface;