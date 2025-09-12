import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-green-400" />
            <h1 className="text-white font-semibold">Privacy Policy</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Privacy & Security Policy</h1>
            <p className="text-gray-300 text-base sm:text-lg px-4 sm:px-0">
              Your privacy and data security are our top priorities. Learn how we protect your biometric data.
            </p>
            <p className="text-sm text-gray-400 mt-2">Last updated: January 2024</p>
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <Lock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-400 text-sm">All biometric data is encrypted using AES-256 encryption</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <Database className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-400 text-sm">Data stored in SOC 2 compliant, isolated environments</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">User Control</h3>
              <p className="text-gray-400 text-sm">You have full control over your data and can delete it anytime</p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {/* Data Collection */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Eye className="h-6 w-6 text-blue-400" />
                <span>Data Collection</span>
              </h2>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <h3 className="text-base sm:text-lg font-semibold text-white">What We Collect:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Biometric eye features (iris patterns, pupil characteristics, scleral vessels)</li>
                  <li>Uploaded or captured eye images (temporarily stored for processing)</li>
                  <li>Technical metadata (device type, browser information, timestamp)</li>
                  <li>Optional profile information (if you create an account)</li>
                </ul>
                
                <h3 className="text-base sm:text-lg font-semibold text-white mt-6">What We DON'T Collect:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Full facial images or personal photos</li>
                  <li>Location data or GPS coordinates</li>
                  <li>Personal identification documents</li>
                  <li>Third-party social media data</li>
                </ul>
              </div>
            </div>

            {/* Data Processing */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Database className="h-6 w-6 text-green-400" />
                <span>Data Processing & Storage</span>
              </h2>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Processing Purpose:</h3>
                  <p>Biometric data is processed solely for identity verification and matching purposes. We use advanced machine learning algorithms to extract unique features from eye images.</p>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Storage Security:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All data encrypted with AES-256 encryption at rest and in transit</li>
                    <li>Biometric templates stored separately from personal information</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Access controls with multi-factor authentication for staff</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Data Retention:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Uploaded images are automatically deleted after processing (within 24 hours)</li>
                    <li>Biometric templates are stored indefinitely unless deletion is requested</li>
                    <li>Account data retained until account deletion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Rights */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-400" />
                <span>Your Rights</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 text-sm sm:text-base">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Data Control:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Request data deletion at any time</li>
                    <li>Download your stored data</li>
                    <li>Modify or correct personal information</li>
                    <li>Opt out of data processing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Transparency:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Access to processing logs</li>
                    <li>Regular privacy reports</li>
                    <li>Clear consent management</li>
                    <li>24/7 privacy support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
                <span>Important Notice</span>
              </h2>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p className="text-orange-200">
                  This is a demonstration application. In a production environment, additional privacy safeguards, 
                  compliance with GDPR, CCPA, and biometric privacy laws would be implemented.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Biometric data requires explicit user consent</li>
                  <li>Data processing must comply with local privacy regulations</li>
                  <li>Regular privacy impact assessments are required</li>
                  <li>Data breach notification procedures must be in place</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Questions About Privacy?</h2>
              <p className="text-gray-300 mb-6 text-sm sm:text-base px-4 sm:px-0">
                We're committed to transparency and protecting your privacy. Contact us with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-2xl transition-colors text-sm sm:text-base">
                  Contact Privacy Team
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 sm:px-6 rounded-2xl transition-colors text-sm sm:text-base">
                  Download Full Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;