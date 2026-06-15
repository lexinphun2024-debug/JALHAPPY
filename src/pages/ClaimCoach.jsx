import { useState, useEffect } from 'react';
import { callAgnesLLM } from '../utils/agnesApi';
import { CLAIM_COACH_PROMPT, fillPrompt, LOADING_MESSAGES, DEMO_DATA_CLAIM_COACH } from '../utils/prompts';
import { extractTextFromPDF, getPdfPageCount } from '../utils/pdfExtractor';
import CoverageTag from '../components/CoverageTag';
import DocumentChecklist from '../components/DocumentChecklist';
import { useElderlyMode } from '../context/ElderlyModeContext';
import { generateClaimImage, generateClaimVideo } from '../utils/agnesApi';

const INSURANCE_TYPES = [
  'Select Insurance Type',
  'Health Insurance',
  'Travel Insurance',
  'Life Insurance',
  'Personal Accident',
];

export default function ClaimCoach() {
  const { elderlyMode, selectedLanguage } = useElderlyMode();
  const [claimType, setClaimType] = useState('');
  const [incident, setIncident] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [step, setStep] = useState(1); // 1=input, 2=loading, 3=results
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(LOADING_MESSAGES);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  // Rotate loading messages
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const idx = loadingMessages.indexOf(prev);
        return loadingMessages[(idx + 1) % loadingMessages.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [step, loadingMessages]);

  // Handle PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);

    try {
      const pageCount = await getPdfPageCount(file);
      setPdfPageCount(pageCount);

      const text = await extractTextFromPDF(file);
      setPdfText(text);
      setPolicyText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setPdfFile(file);
    try {
      const pageCount = await getPdfPageCount(file);
      setPdfPageCount(pageCount);
      const text = await extractTextFromPDF(file);
      setPdfText(text);
      setPolicyText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  // Load demo data
  const loadDemoData = () => {
    setClaimType(DEMO_DATA_CLAIM_COACH.type);
    setIncident(DEMO_DATA_CLAIM_COACH.incident);
    setPolicyText(DEMO_DATA_CLAIM_COACH.policyText);
    setPdfFile(null);
    setPdfText('');
    setPdfPageCount(0);
    setError('');
  };

  // Analyse claim
  const analyseClaim = async () => {
    if (!incident || (!policyText && !pdfFile)) {
      setError('Please enter an incident description and upload a policy or load demo data.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setStep(2);

    try {
      const fullPolicyText = policyText || pdfText;
      let prompt = fillPrompt(CLAIM_COACH_PROMPT, {
        TYPE: claimType || 'General Insurance',
        INCIDENT: incident,
        POLICY_TEXT: fullPolicyText,
      });

      // Prepend elderly mode prefix if applicable
      if (elderlyMode && selectedLanguage !== 'en') {
        // Will be handled by the caller; for now the LLM response will be in English
      }

      const data = await callAgnesLLM(prompt);
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message);
      setStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy call script to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Script copied to clipboard!');
  };

  // Generate visual card
  const handleGenerateImage = async () => {
    if (!result) return;
    setImageLoading(true);
    try {
      const res = await generateClaimImage(
        `Insurance claim summary card for ${result.insurer_name || 'insurance company'}: ${result.covered_explanation}. Documents needed: ${result.documents.join(', ')}. Deadline: ${result.deadline_days} days.`
      );
      setImageResult(res);
    } catch {
      // Placeholder already returned
    } finally {
      setImageLoading(false);
    }
  };

  // Generate video summary
  const handleGenerateVideo = async () => {
    if (!result) return;
    setVideoLoading(true);
    try {
      const res = await generateClaimVideo(
        `Video summary of insurance claim for ${result.insurer_name || 'insurance company'}: ${result.covered_explanation}.`
      );
      setVideoResult(res);
    } catch {
      // Placeholder already returned
    } finally {
      setVideoLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setClaimType('');
    setIncident('');
    setPolicyText('');
    setPdfFile(null);
    setPdfText('');
    setPdfPageCount(0);
    setStep(1);
    setResult(null);
    setError('');
    setImageResult(null);
    setVideoResult(null);
  };

  return (
    <div className={`min-h-screen ${elderlyMode ? '!bg-white' : 'bg-background'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8 fade-in">
          <h1 className={`text-3xl md:text-4xl font-bold text-navy mb-2 ${elderlyMode ? '!text-4xl md:!text-5xl' : ''}`}>
            Your Personal Claim Action Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us what happened and upload your policy. We'll give you a step-by-step action plan.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s
                    ? 'bg-navy text-white'
                    : 'bg-gray-200 text-gray-500'
                } ${elderlyMode ? '!w-14 !h-14 !text-xl' : ''}`}
              >
                {s}
              </div>
              <span className={`font-medium hidden sm:inline ${
                step >= s ? 'text-navy' : 'text-gray-400'
              } ${elderlyMode ? '!text-lg' : ''}`}>
                {s === 1 ? 'Input' : s === 2 ? 'Analysis' : 'Results'}
              </span>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-navy' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-2xl p-4 mb-6 fade-in">
            <div className="flex items-center gap-2">
              <span className="text-danger font-bold">❌</span>
              <p className="text-danger text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 1: INPUT */}
        {step === 1 && (
          <div className="space-y-6 fade-in">
            {/* Insurance Type Dropdown */}
            <div className="card">
              <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                1. Select Insurance Type
              </label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
                className={`input-field ${elderlyMode ? '!text-xl !py-4 !px-6' : ''}`}
              >
                {INSURANCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Incident Description */}
            <div className="card">
              <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                2. What happened? Tell us in plain English
              </label>
              <textarea
                value={incident}
                onChange={(e) => setIncident(e.target.value)}
                placeholder="e.g. I got dengue fever in Bali and was hospitalised for 3 days. My flight back was also delayed."
                rows={5}
                className={`input-field resize-none ${elderlyMode ? '!text-xl !py-4 !px-6 !min-h-[180px]' : ''}`}
              />
            </div>

            {/* PDF Upload */}
            <div className="card">
              <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                3. Upload Your Policy PDF (optional — or use demo data)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  pdfFile
                    ? 'border-covered bg-covered bg-opacity-5'
                    : 'border-gray-300 hover:border-navy hover:bg-navy hover:bg-opacity-5'
                }`}
                onClick={() => document.getElementById('pdf-upload').click()}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                {pdfFile ? (
                  <div>
                    <span className="text-4xl mb-2 block">📄</span>
                    <p className="font-semibold text-navy text-lg">{pdfFile.name}</p>
                    {pdfPageCount > 0 && (
                      <p className="text-sm text-gray-500 mt-1">{pdfPageCount} page{pdfPageCount > 1 ? 's' : ''} • Text extracted</p>
                    )}
                    {pdfText && (
                      <p className="text-xs text-gray-400 mt-1">{pdfText.length} characters extracted</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl mb-2 block">📤</span>
                    <p className="font-medium text-gray-600">Drag & drop your policy PDF here</p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Data Button */}
            <button
              onClick={loadDemoData}
              className="btn-warning w-full text-center"
            >
              🎯 Load Demo Data
            </button>

            {/* Analyse Button */}
            <button
              onClick={analyseClaim}
              disabled={!incident || (!policyText && !pdfFile) || isAnalyzing}
              className={`btn-primary w-full text-center text-lg ${
                (!incident || (!policyText && !pdfFile) || isAnalyzing)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${elderlyMode ? '!text-xl !py-4' : ''}`}
            >
              {isAnalyzing ? 'Analyzing...' : '🔍 Analyse My Claim →'}
            </button>
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 2 && (
          <div className="card text-center py-16 fade-in">
            <div className="flex flex-col items-center gap-6">
              <div className="spinner"></div>
              <h2 className={`text-2xl font-bold text-navy ${elderlyMode ? '!text-3xl' : ''}`}>
                Analysing Your Claim
              </h2>
              <p className="text-lg text-gray-600 pulse-slow min-h-[28px]">
                {loadingMessage}
              </p>
              <div className="w-full max-w-md mt-4">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill bg-info"
                    style={{ width: '60%', animation: 'pulse 2s infinite' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && result && (
          <div className="space-y-6 fade-in">
            {/* Success Banner */}
            <div className="text-center mb-6">
              <button
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-navy underline transition-colors"
              >
                ← Start New Claim
              </button>
            </div>

            {/* [1] Coverage Status */}
            <CoverageTag
              status={result.covered}
              explanation={result.covered_explanation}
              clauseReference={result.clause_reference}
            />

            {/* [2] Document Checklist */}
            <DocumentChecklist
              documents={result.documents || []}
              warningText="Always submit your FINAL bill — interim invoices are the #1 reason claims get rejected in Singapore."
            />

            {/* [3] Deadline Card */}
            <div className="card fade-in">
              <h3 className="text-xl font-bold text-navy mb-3">⏰ Your Claim Deadline</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className={`text-4xl font-bold ${
                  (result.deadline_days || 30) <= 7 ? 'text-danger' : 'text-navy'
                } ${elderlyMode ? '!text-5xl' : ''}`}>
                  {result.deadline_days || 30} days
                </span>
                <span className="text-gray-500">remaining</span>
              </div>
              <p className="text-gray-600 mb-3">Exact deadline: Submit within {result.deadline_days || 30} days of your incident</p>
              {result.deadline_warning && (
                <div className="bg-warning bg-opacity-10 border border-warning border-opacity-30 rounded-xl p-3">
                  <p className="text-sm text-gray-800">⚠️ {result.deadline_warning}</p>
                </div>
              )}
            </div>

            {/* [4] Call Script */}
            <div className="card fade-in">
              <h3 className="text-xl font-bold text-navy mb-3">📞 What to Say When You Call Your Insurer</h3>
              <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-info mb-3">
                <p className="text-base text-gray-800 italic leading-relaxed">
                  "{result.call_script}"
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => copyToClipboard(result.call_script)}
                  className="text-sm bg-info text-white rounded-lg px-4 py-2 hover:bg-opacity-90 transition-colors cursor-pointer"
                >
                  📋 Copy to Clipboard
                </button>
                {result.insurer_hotline && (
                  <p className="text-sm text-gray-600">
                    📱 Insurer hotline: <a href={`tel:${result.insurer_hotline}`} className="font-bold text-navy hover:underline">{result.insurer_hotline}</a>
                  </p>
                )}
              </div>
            </div>

            {/* [5] Rejection Risks */}
            <div className="card fade-in">
              <h3 className="text-xl font-bold text-navy mb-3">🚫 Watch Out For These</h3>
              <div className="flex flex-wrap gap-2">
                {(result.rejection_risks || []).map((risk, i) => (
                  <span
                    key={i}
                    className="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-full text-sm font-medium border border-danger border-opacity-20"
                  >
                    ⚠️ {risk}
                  </span>
                ))}
              </div>
            </div>

            {/* [6] Pro Tip */}
            <div className="bg-warning bg-opacity-10 border-2 border-warning border-opacity-30 rounded-2xl p-6 fade-in">
              <h3 className="text-xl font-bold text-navy mb-2">💡 Insider Tip</h3>
              <p className="text-gray-800">{result.pro_tip}</p>
            </div>

            {/* Insurer Info Bar */}
            {result.insurer_name && (
              <div className="bg-navy text-white rounded-2xl p-5 fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Your Insurer</p>
                    <p className="text-2xl font-bold">{result.insurer_name}</p>
                  </div>
                  {result.insurer_hotline && (
                    <a
                      href={`tel:${result.insurer_hotline}`}
                      className="bg-covered text-white rounded-xl px-6 py-3 font-bold hover:bg-opacity-90 transition-colors"
                    >
                      📞 {result.insurer_hotline}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="card fade-in">
              <h3 className="text-xl font-bold text-navy mb-4">🚀 Next Steps</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateImage}
                  disabled={imageLoading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {imageLoading ? (
                    <><div className="spinner !w-5 !h-5 !border-2"></div> Generating...</>
                  ) : (
                    <>🎨 Generate Visual Claim Card</>
                  )}
                </button>
                <button
                  onClick={handleGenerateVideo}
                  disabled={videoLoading}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  {videoLoading ? (
                    <><div className="spinner !w-5 !h-5 !border-2"></div> Generating...</>
                  ) : (
                    <>🎬 Generate Video Summary</>
                  )}
                </button>
                <button
                  onClick={() => {
                    // Toggle elderly mode and regenerate
                    window.dispatchEvent(new CustomEvent('toggle-elderly'));
                  }}
                  className="btn-warning col-span-1 sm:col-span-2 flex items-center justify-center gap-2"
                >
                  👴 Switch to Elderly Mode
                </button>
              </div>

              {/* Image/Video Results */}
              {imageResult && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">📸 Visual Claim Card:</p>
                  <img
                    src={imageResult.url}
                    alt="Claim Card"
                    className="w-full max-w-md rounded-xl mx-auto"
                  />
                  {imageResult.status === 'placeholder' && (
                    <p className="text-xs text-warning mt-2 text-center">
                      🚧 Coming Soon — Image generation powered by Agnes AI
                    </p>
                  )}
                </div>
              )}
              {videoResult && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">🎬 Video Summary:</p>
                  <img
                    src={videoResult.url}
                    alt="Video Summary"
                    className="w-full max-w-md rounded-xl mx-auto"
                  />
                  {videoResult.status === 'placeholder' && (
                    <p className="text-xs text-warning mt-2 text-center">
                      🚧 Coming Soon — Video generation powered by Agnes AI
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}