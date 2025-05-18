import React, { useState, useEffect } from 'react';
import './Inspo.css';
import logo from './assets/logo.png';
import crossIcon from './assets/basil_cross-outline.svg';

const DEFAULT_EXAMPLES = [
  {
    title: "Email",
    example: "Write a follow up to the email provided to you"
  },
  {
    title: "Go Deeper",
    example: "Explain this website provided to you in detail"
  },
  {
    title: "Generate Comments",
    example: "Create a comment for this thread provided to you"
  },
  {
    title: "Analyze Text",
    example: "Summarize the website provided to you"
  }
];

// Helper to check if we're in a Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

// Storage adapter that works in both contexts
const storage = {
  get: async () => {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['sophon-examples'], (result) => {
          resolve(result['sophon-examples']);
        });
      });
    } else {
      const saved = localStorage.getItem('sophon-examples');
      return saved ? JSON.parse(saved) : null;
    }
  },
  set: async (examples) => {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ 'sophon-examples': examples }, resolve);
      });
    } else {
      localStorage.setItem('sophon-examples', JSON.stringify(examples));
      return Promise.resolve();
    }
  }
};

const Inspo = ({ onExampleClick }) => {
  const [examples, setExamples] = useState(DEFAULT_EXAMPLES);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load saved examples when component mounts
    storage.get().then(savedExamples => {
      if (savedExamples) {
        setExamples(savedExamples);
      }
    });
  }, []);

  const saveExamples = async (newExamples) => {
    await storage.set(newExamples);
    setExamples(newExamples);
  };

  const handleChange = (index, field, value) => {
    const newExamples = [...examples];
    newExamples[index] = {
      ...newExamples[index],
      [field]: value
    };
    saveExamples(newExamples);
  };

  const handleReset = () => {
    saveExamples(DEFAULT_EXAMPLES);
  };

  const handleAddPrompt = () => {
    const newExamples = [...examples, {
      title: "New Prompt",
      example: "Enter your prompt here"
    }];
    saveExamples(newExamples);
    setIsEditing(true);
  };

  const handleRemove = (indexToRemove) => {
    const newExamples = examples.filter((_, index) => index !== indexToRemove);
    saveExamples(newExamples);
  };

  return (
    <div className="inspo-container">
      <img src={logo} alt="Logo" className="inspo-logo" width="48" height="48" />
      <h2>Welcome to Sophon</h2>
      <div className="examples-grid">
        {examples.map((item, i) => (
          <div 
            key={i} 
            className={`example-card ${isEditing ? 'editing' : ''}`}
            onClick={() => !isEditing && onExampleClick(item.example)}
            role="button"
            tabIndex={0}
            title={isEditing ? undefined : "Click to send this prompt"}
          >
            {isEditing ? (
              <>
                <input
                  className="title-input"
                  value={item.title}
                  onChange={(e) => handleChange(i, 'title', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  className="example-input"
                  value={item.example}
                  onChange={(e) => handleChange(i, 'example', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <button 
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
                >
                  <img src={crossIcon} alt="Remove" />
                </button>
              </>
            ) : (
              <>
                <h3>{item.title}</h3>
                <span className="example-text">{item.example}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="edit-controls">
        {isEditing ? (
          <>
            <button 
              className="done-button"
              onClick={() => setIsEditing(false)}
            >
              Done
            </button>
            <button 
              className="reset-all-button"
              onClick={handleReset}
            >
              Reset All
            </button>
          </>
        ) : (
          <>
            <button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Prompts
            </button>
            <button 
              className="add-button"
              onClick={handleAddPrompt}
            >
              Add Prompt
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Inspo;
