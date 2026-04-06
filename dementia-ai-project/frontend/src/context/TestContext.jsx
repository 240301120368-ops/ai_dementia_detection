import React, { createContext, useState, useContext } from 'react';

const TestContext = createContext();

export const useTestContext = () => useContext(TestContext);

export const TestProvider = ({ children }) => {
  const [testScores, setTestScores] = useState({
    patient_id: 1, // Using the seeded ID from your database
    memory_score: 0,
    recall_score: 0,
    attention_score: 0,
  });

  const updateScore = (testName, score) => {
    setTestScores(prev => ({ ...prev, [testName]: score }));
  };

  return (
    <TestContext.Provider value={{ testScores, updateScore }}>
      {children}
    </TestContext.Provider>
  );
};
