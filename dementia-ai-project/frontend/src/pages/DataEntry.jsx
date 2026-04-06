import React, { useState } from 'react';
import { analysisAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DataEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    memory_score: '',
    recall_score: '',
    attention_score: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the data to your new Python endpoint
      await analysisAPI.submitTest({
        name: formData.name,
        age: parseInt(formData.age),
        memory_score: parseFloat(formData.memory_score),
        recall_score: parseFloat(formData.recall_score),
        attention_score: parseFloat(formData.attention_score),
      });
      // Jump to the dashboard to see the results!
      navigate('/dashboard');
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Patient Test Data</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient Name</label>
            <input type="text" name="name" onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input type="number" name="age" onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cognitive Scores (0 - 10)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Memory Score</label>
              <input type="number" step="0.1" max="10" name="memory_score" onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Recall Score</label>
              <input type="number" step="0.1" max="10" name="recall_score" onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Attention Score</label>
              <input type="number" step="0.1" max="10" name="attention_score" onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-6">
            Generate Analysis
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataEntry;
