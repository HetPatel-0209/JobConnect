import React, { useState } from 'react';
import Navbaruser from '../../../components/common/Navbaruser';
import './UploadResume.css';

const UploadResume = ({ onClose }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      setError('');
    } else {
      setFileName('');
      setError('Only PDF files are allowed.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      setError('');
    } else {
      setFileName('');
      setError('Only PDF files are allowed.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Navbaruser />
      <div className="upload-container" onDrop={handleDrop} onDragOver={handleDragOver}>
        <h2>Upload Your Resume</h2>
        <p>
          To get personalized job recommendations and apply to positions,
          please upload your resume first.
        </p>
        <div className="upload-icon">
          <i className="fa fa-upload"></i>
        </div>
        <p>Drag and drop your resume here, or click to select</p>
        <small>Supported format: <strong>PDF only</strong></small>

        <input
          type="file"
          id="fileInput"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div className="action-buttons">
          <label htmlFor="fileInput" className="select-btn">Select</label>
          {fileName && <p className="file-name">Selected File: {fileName}</p>}
          {error && <p className="upload-error" style={{ color: 'red' }}>{error}</p>}
          <div className="skip" onClick={onClose}>May be later or Not now</div>
        </div>
      </div>
    </>
  );
};

export default UploadResume;
