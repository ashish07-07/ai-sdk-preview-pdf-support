
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [uploading, setIsUploading] = useState<boolean>(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  async function changeFunction(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      // Reset parsed text when a new file is selected
      setParsedText(null);
    }
  }

  async function quiznavigator(e: any) {
    e.preventDefault();
    router.push('/quizlet2');
  }

  async function handleSubmit() {
    if (!file) {
      alert("No file selected. Please select a PDF file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("filepond", file);

    try {
      const response:any= await axios.post("/api/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setParsedText(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <label style={styles.fileInputLabel}>
          <input 
            type="file" 
            onChange={changeFunction} 
            style={styles.fileInput}
            accept="application/pdf"
          />
          <span style={styles.fileInputText}>
            {file ? file.name : 'Choose PDF File'}
          </span>
        </label>

        {/* Only show the Submit button if no parsing has been done yet */}
        {!parsedText && (
          <button 
            onClick={handleSubmit} 
            disabled={uploading}
            style={{
              ...styles.button,
              ...(uploading ? styles.buttonDisabled : {}),
              marginTop: '20px'
            }}
          >
            {uploading ? (
              <div style={styles.spinner}></div>
            ) : "Submit File"}
          </button>
        )}

        {parsedText && (
          <div style={styles.resultBox}>
            <p style={styles.resultText}>Content successfully parsed!</p>
          </div>
        )}

        {/* Show QuizletZone button when parsing is complete */}
        {parsedText && (
          <button 
            onClick={quiznavigator}
            style={{
              ...styles.button,
              marginTop: '20px'
            }}
          >
            Go to QuizletZone
          </button>
        )}
        
        {/* Add option to upload a different file after successful parsing */}
        {parsedText && (
          <button 
            onClick={() => setParsedText(null)}
            style={{
              ...styles.button,
              marginTop: '20px',
              backgroundColor: 'rgba(31, 110, 125, 0.7)'
            }}
          >
            Upload Different File
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'rgba(31, 110, 125, 0.1)',
    padding: '20px',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  fileInputLabel: {
    display: 'block',
    width: '100%',
    padding: '15px 20px',
    backgroundColor: 'rgba(31, 110, 125, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(31, 110, 125, 0.2)',
    },
  },
  fileInput: {
    display: 'none',
  },
  fileInputText: {
    color: 'rgb(31, 110, 125)',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '15px 20px',
    backgroundColor: 'rgb(31, 110, 125)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    ':hover:not(:disabled)': {
      backgroundColor: 'rgba(31, 110, 125, 0.8)',
      transform: 'translateY(-2px)',
    },
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    opacity: '0.7',
  },
  spinner: {
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  resultBox: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'rgba(31, 110, 125, 0.1)',
    borderRadius: '8px',
    animation: 'fadeIn 0.5s ease',
  },
  resultText: {
    color: 'rgb(31, 110, 125)',
    margin: '0',
    textAlign: 'center' as const,
  },
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  '@keyframes fadeIn': {
    from: { opacity: '0', transform: 'translateY(10px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
};