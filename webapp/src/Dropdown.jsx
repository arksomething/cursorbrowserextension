import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Dropdown = ({ options, value, onChange, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [userPlan, setUserPlan] = useState('Free');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const checkUserPlan = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserPlan(userDoc.data().plan || 'Free');
        }
      }
    };

    checkUserPlan();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserPlan();
      } else {
        setUserPlan('Free');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedValue(option.value);
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div 
        className={`dropdown-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="dropdown-selected">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="dropdown-arrow">▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-list">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-item ${selectedValue === option.value ? 'selected' : ''} ${option.plan === 'Plus' && userPlan !== 'Plus' ? 'plus-plan' : ''}`}
              onClick={() => {
                if (option.plan === 'Plus' && userPlan !== 'Plus') {
                  alert('This model requires a Plus subscription. Please upgrade to access it.');
                  return;
                }
                handleSelect(option);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

