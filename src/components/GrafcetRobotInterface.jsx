import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const GrafcetRobotInterface = () => {
  // Available function blocks
  const functionBlocks = [
    { id: 'grab', label: 'Grab', hasParameter: false },
    { id: 'rotate', label: 'Rotate', hasParameter: true, paramType: 'angle', unit: '°' },
    { id: 'move', label: 'Move', hasParameter: true, paramType: 'distance', unit: 'mm' },
    { id: 'delay', label: 'Delay', hasParameter: true, paramType: 'time', unit: 's' }
  ];

  // State for the sequence of steps
  const [sequence, setSequence] = useState([]);
  
  // State for the currently selected step
  const [selectedStep, setSelectedStep] = useState(null);
  
  // Ref for tracking dragged item
  const dragItem = useRef(null);

  //const [finalCode, setFinalCode] = useState("");

  const send = () =>{
    console.log(generateCode())
  }

  // State for parameter values
  const [paramValues, setParamValues] = useState({});

  // Handle drag start
  const handleDragStart = (e, blockType) => {
    dragItem.current = blockType;
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (dragItem.current) {
      const block = functionBlocks.find(block => block.id === dragItem.current);
      const newStep = {
        stepId: `step-${sequence.length + 1}`, // unique step id
        blockId: block.id, // original function block id
        ...block
      };

      setSequence([...sequence, newStep]);

      if (newStep.hasParameter) {
        setParamValues({
          ...paramValues,
          [newStep.stepId]: 0 // use stepId as key
        });
      }

      dragItem.current = null;
    }
  };

  // Handle parameter change
  const handleParamChange = (stepId, value) => {
    setParamValues({
      ...paramValues,
      [stepId]: value
    });
  };

  // Remove step from sequence
  const removeStep = (stepId) => {
    setSequence(sequence.filter(step => step.id !== stepId));
    const newParamValues = { ...paramValues };
    delete newParamValues[stepId];
    setParamValues(newParamValues);
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  // Move step up in sequence
  const moveStepUp = (index) => {
    if (index > 0) {
      const newSequence = [...sequence];
      [newSequence[index], newSequence[index - 1]] = [newSequence[index - 1], newSequence[index]];
      setSequence(newSequence);
    }
  };

  // Move step down in sequence
  const moveStepDown = (index) => {
    if (index < sequence.length - 1) {
      const newSequence = [...sequence];
      [newSequence[index], newSequence[index + 1]] = [newSequence[index + 1], newSequence[index]];
      setSequence(newSequence);
    }
  };

  // Generate code for the sequence
  const generateCode = () => {
    return sequence.map(step => {
      if (step.hasParameter) {
        return `${step.label}(${paramValues[step.stepId] || 0}${step.unit})`;
      }
      return `${step.label}()`;
    }).join('\n');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Grafcet Robot Programming Interface</h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Function Blocks Panel */}
        <div className="w-64 bg-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Function Blocks</h2>
          <div className="space-y-2">
            {functionBlocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
                className="bg-white p-3 rounded shadow cursor-grab border-2 border-blue-500"
              >
                {block.label}
                {block.hasParameter && 
                  <span className="text-xs ml-2 text-gray-500">
                    ({block.paramType}: {block.unit})
                  </span>
                }
              </div>
            ))}
            <button
                onClick={send}
                className="bg-blue-900 p-3 rounded shadow border-2 border-blue-100 w-full text-white text-left cursor-pointer hover:bg-blue-800 checked:bg-blue-700">
              Run
            </button>
          </div>
        </div>

        {/* Grafcet Diagram */}
        <div className="flex-1 p-4 overflow-auto">
          <div 
            className="min-h-full border-2 border-dashed border-gray-400 rounded p-4 bg-white"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h2 className="text-lg font-semibold mb-4">Grafcet Diagram</h2>
            
            {sequence.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Drag and drop function blocks here to build your sequence
              </div>
            ) : (
              <div className="space-y-1">
                {sequence.map((step, index) => (
                  <div key={step.id} className="relative">
                    {/* Connection line */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-3 w-0.5 h-3 bg-black"></div>
                    )}
                    
                    <div 
                      className={`flex items-center mb-4 ${selectedStep === step.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedStep(step.id)}
                    >
                      {/* Step number circle */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Step content */}
                      <div className="ml-4 flex-1 p-3 bg-gray-100 rounded shadow">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{step.label}</span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => moveStepUp(index)}
                              disabled={index === 0}
                              className={`p-1 ${index === 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                              ↑
                            </button>
                            <button 
                              onClick={() => moveStepDown(index)}
                              disabled={index === sequence.length - 1}
                              className={`p-1 ${index === sequence.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                              ↓
                            </button>
                            <button 
                              onClick={() => removeStep(step.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        
                        {step.hasParameter && (
                          <div className="mt-2">
                            <label className="block text-sm text-gray-600">
                              {step.paramType === 'angle' ? 'Angle (degrees)' : 
                               step.paramType === 'distance' ? 'Distance (mm)' : 'Time (seconds)'}
                            </label>
                            <div className="flex items-center mt-1">
                              <input
                                  type="number"
                                  value={paramValues[step.stepId] || 0}
                                  onChange={(e) => handleParamChange(step.stepId, parseFloat(e.target.value))}
                                  className="w-24 p-1 border rounded"
                              />
                              <span className="ml-2">{step.unit}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Code Preview Panel */}
        <div className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-lg font-semibold mb-4">Code Preview</h2>
          <pre className="bg-gray-900 p-3 rounded text-green-400 text-sm overflow-auto h-64">
            {generateCode()}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default GrafcetRobotInterface;