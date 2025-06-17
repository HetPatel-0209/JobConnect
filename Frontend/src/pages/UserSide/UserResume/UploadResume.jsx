import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react';

const UploadResume = ({ onClose }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateFile = (file) => {
    if (!file) return false;
    
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size should be less than 5MB.');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (validateFile(file)) {
      setFileName(file.name);
      setError('');
      handleUpload(file);
    } else {
      setFileName('');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (validateFile(file)) {
      setFileName(file.name);
      setError('');
      handleUpload(file);
    } else {
      setFileName('');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Save file info to localStorage
      const resumeData = {
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        size: file.size
      };
      localStorage.setItem('userResume', JSON.stringify(resumeData));
    }, 2000);
  };

  const resetUpload = () => {
    setFileName('');
    setError('');
    setUploadSuccess(false);
    setIsUploading(false);
  };

  if (uploadSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-6">Your resume has been uploaded successfully.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              {fileName}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetUpload}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Upload Another
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-gray-600">
            To get personalized job recommendations and apply to positions, please upload your resume.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : isUploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Uploading your resume...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-gray-600" />
              </div>
              
              <p className="text-gray-700 font-medium mb-2">
                Drag and drop your resume here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supported format: <span className="font-medium text-gray-700">PDF only</span> • Max 5MB
              </p>

              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <label
                htmlFor="fileInput"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </label>
            </>
          )}
        </div>

        {/* Selected File */}
        {fileName && !isUploading && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-green-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Selected File:</p>
                <p className="text-sm text-green-700">{fileName}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
            >
              Maybe later
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Skip for now
              </button>
              {fileName && !isUploading && (
                <button
                  onClick={() => handleUpload({ name: fileName })}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Upload Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
