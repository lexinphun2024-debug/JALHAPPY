import { useState } from 'react';

/**
 * DocumentChecklist - Interactive document collection tracker
 * @param {string[]} documents - List of document names
 * @param {string} warningText - Optional warning message
 */
export default function DocumentChecklist({ documents, warningText }) {
  const [checked, setChecked] = useState({});

  const total = documents.length;
  const collected = Object.values(checked).filter(Boolean).length;
  const progress = total > 0 ? (collected / total) * 100 : 0;

  const toggle = (index) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="card fade-in">
      <h3 className="text-xl font-bold text-navy mb-4">
        📋 Collect These Documents RIGHT NOW
      </h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-600">Documents collected</span>
          <span className="text-sm font-bold text-navy">{collected}/{total}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2 mb-4">
        {documents.map((doc, index) => (
          <label
            key={index}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              checked[index]
                ? 'bg-covered bg-opacity-10 border-2 border-covered'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[index]}
              onChange={() => toggle(index)}
              className="sr-only"
            />
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                checked[index]
                  ? 'bg-covered text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {checked[index] && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className={`font-medium ${checked[index] ? 'text-covered line-through' : 'text-gray-800'}`}>
              {doc}
            </span>
          </label>
        ))}
      </div>

      {/* Warning box */}
      {warningText && (
        <div className="bg-warning bg-opacity-10 border border-warning border-opacity-30 rounded-xl p-4">
          <p className="text-sm text-gray-800">
            ⚠️ {warningText}
          </p>
        </div>
      )}
    </div>
  );
}