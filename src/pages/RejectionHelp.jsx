import { useState, useEffect } from 'react';
import { callAgnesLLM } from '../utils/agnesApi';
import { REJECTION_HELP_PROMPT, fillPrompt, REJECTION_LOADING_MESSAGES, DEMO_DATA_REJECTION } from '../utils/prompts';
import { extractTextFromPDF, getPdfPageCount } from '../utils/pdfExtractor';
import DocumentChecklist from '../components/DocumentChecklist';
import { useElderlyMode } from '../context/ElderlyModeContext';

export default function RejectionHelp() {
  const { elderlyMode } = useElderlyMode();
  const [rejectionFile, setRejectionFile] = useState(null);
  const [policyFile, setPolicyFile] = useState(null);
  const [rejectionText, setRejectionText] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [step, setStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    const msgs = REJECTION_LOADING_MESSAGES;
    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const idx = msgs.indexOf(prev);
        return msgs[(idx + 1) % msgs.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [step]);

  const handlePdfUpload = async (e, setFile, setText) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    try {
      const text = await extractTextFromPDF(file);
      setText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, setFile, setText) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setFile(file);
    try {
      const text = await extractTextFromPDF(file);
      setText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  const loadDemoData = () => {
    setRejectionText(DEMO_DATA_REJECTION.rejectionText);
    setPolicyText(DEMO_DATA_REJECTION.policyText);
    setRejectionFile(null);
    setPolicyFile(null);
    setError('');
  };

  const analyse = async () => {
    if (!rejectionText || !policyText) {
      setError('Please upload both the rejection letter and your policy, or load demo data.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setStep(2);
    try {
      const prompt = fillPrompt(REJECTION_HELP_PROMPT, {
        REJECTION_TEXT: rejectionText,
        POLICY_TEXT: policyText,
      });
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

  const resetForm = () => {
    setRejectionText('');
    setPolicyText('');
    setRejectionFile(null);
    setPolicyFile(null);
    setStep(1);
    setResult(null);
    setError('');
  };

  const disputeBadgeConfig = {
    YES: { bgClass: 'bg-covered bg-opacity-10 border-covered', icon: '✅', text: 'DISPUTABLE', color: 'text-covered' },
    MAYBE: { bgClass: 'bg-warning bg-opacity-10 border-warning', icon: '⚠️', text: 'POSSIBLY DISPUTABLE', color: 'text-warning' },
    NO: { bgClass: 'bg-danger bg-opacity-10 border-danger', icon: '❌', text: 'DIFFICULT TO DISPUTE', color: 'text-danger' },
  };

  const successConfig = {
    HIGH: { text: 'HIGH', color: 'text-covered', bg: 'bg-covered bg-opacity-10' },
    MEDIUM: { text: 'MEDIUM', color: 'text-warning', bg: 'bg-warning bg-opacity-10' },
    LOW: { text: 'LOW', color: 'text-danger', bg: 'bg-danger bg-opacity-10' },
  };

  return (
    <div className={`min-h-screen ${elderlyMode ? '!bg-white' : 'bg-background'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className={`text-3xl md:text-4xl font-bold text-navy mb-2 ${elderlyMode ? '!text-4xl md:!text-5xl' : ''}`}>
            Your Claim Was Rejected. Here's How to Fight Back.
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your rejection letter and original policy. We'll tell you exactly why it was rejected, whether you can appeal, and how.
          </p>
        </div>

        {/* FIDReC Callout */}
        <div className="bg-info bg-opacity-10 border-2 border-info border-opacity-30 rounded-2xl p-5 mb-8 fade-in">
          <p className="text-gray-800">
            💡 <strong>Did you know?</strong> Singapore's Financial Industry Disputes Resolution Centre (FIDReC) handles insurance disputes for <strong>FREE</strong> — for claims up to $100,000. Most Singaporeans don't know this exists.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'
              } ${elderlyMode ? '!w-14 !h-14 !text-xl' : ''}`}>
                {s}
              </div>
              <span className={`font-medium hidden sm:inline ${step >= s ? 'text-navy' : 'text-gray-400'} ${elderlyMode ? '!text-lg' : ''}`}>
                {s === 1 ? 'Upload' : s === 2 ? 'Analysing' : 'Appeal Plan'}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-navy' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-2xl p-4 mb-6">
            <p className="text-danger text-sm">❌ {error}</p>
          </div>
        )}

        {/* STEP 1: INPUT */}
        {step === 1 && (
          <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rejection Letter Upload */}
              <div className="card">
                <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                  📩 Rejection Letter
                </label>
                <p className="text-sm text-gray-500 mb-3">Your insurance company's rejection notice</p>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, setRejectionFile, setRejectionText)}
                  onClick={() => document.getElementById('rejection-upload').click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    rejectionFile ? 'border-info bg-info bg-opacity-5' : 'border-gray-300 hover:border-navy'
                  } ${elderlyMode ? '!p-8' : ''}`}
                >
                  <input id="rejection-upload" type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, setRejectionFile, setRejectionText)} className="hidden" />
                  {rejectionFile ? (
                    <div>
                      <p className="text-2xl mb-1">📩</p>
                      <p className="font-semibold text-navy text-sm">{rejectionFile.name}</p>
                      <p className="text-xs text-gray-400">Text extracted</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-1">📤</p>
                      <p className="text-sm text-gray-500">Upload rejection letter</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy Upload */}
              <div className="card">
                <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                  📄 Original Policy
                </label>
                <p className="text-sm text-gray-500 mb-3">Your original insurance policy document</p>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, setPolicyFile, setPolicyText)}
                  onClick={() => document.getElementById('policy-upload').click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    policyFile ? 'border-covered bg-covered bg-opacity-5' : 'border-gray-300 hover:border-navy'
                  } ${elderlyMode ? '!p-8' : ''}`}
                >
                  <input id="policy-upload" type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, setPolicyFile, setPolicyText)} className="hidden" />
                  {policyFile ? (
                    <div>
                      <p className="text-2xl mb-1">📄</p>
                      <p className="font-semibold text-navy text-sm">{policyFile.name}</p>
                      <p className="text-xs text-gray-400">Text extracted</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-1">📤</p>
                      <p className="text-sm text-gray-500">Upload your policy</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={loadDemoData} className="btn-warning w-full text-center">🎯 Load Demo Data</button>

            <button
              onClick={analyse}
              disabled={!rejectionText || !policyText || isAnalyzing}
              className={`btn-primary w-full text-center text-lg ${
                (!rejectionText || !policyText || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''
              } ${elderlyMode ? '!text-xl !py-4' : ''}`}
            >
              {isAnalyzing ? 'Analysing...' : '🔍 Decode My Rejection →'}
            </button>
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 2 && (
          <div className="card text-center py-16 fade-in">
            <div className="flex flex-col items-center gap-6">
              <div className="spinner"></div>
              <h2 className={`text-2xl font-bold text-navy ${elderlyMode ? '!text-3xl' : ''}`}>Decoding Your Rejection</h2>
              <p className="text-lg text-gray-600 pulse-slow min-h-[28px]">{loadingMessage}</p>
              <div className="w-full max-w-md">
                <div className="progress-bar"><div className="progress-bar-fill bg-info" style={{ width: '60%', animation: 'pulse 2s infinite' }}></div></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && result && (
          <div className="space-y-6 fade-in">
            <div className="text-center mb-2">
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-navy underline transition-colors">← Analyse Another Rejection</button>
            </div>

            {/* [1] Rejection Decoded */}
            <div className="card fade-in">
              <h3 className="text-xl font-bold text-navy mb-2">🔍 What This Rejection Means</h3>
              <p className="text-gray-800 text-base mb-3">{result.rejection_reason_plain}</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                result.rejection_category === 'Wrong Documents' ? 'bg-warning bg-opacity-10 text-warning' :
                result.rejection_category === 'Late Submission' ? 'bg-info bg-opacity-10 text-info' :
                'bg-danger bg-opacity-10 text-danger'
              }`}>
                {result.rejection_category}
              </span>
            </div>

            {/* [2] Disputable Badge */}
            <div className={`${disputeBadgeConfig[result.is_disputable]?.bgClass || disputeBadgeConfig.NO.bgClass} border-2 rounded-2xl p-6 text-center fade-in`}>
              <span className="text-3xl">{disputeBadgeConfig[result.is_disputable]?.icon || '❌'}</span>
              <p className={`text-2xl font-bold mt-2 ${disputeBadgeConfig[result.is_disputable]?.color || 'text-danger'}`}>
                {disputeBadgeConfig[result.is_disputable]?.text || 'DIFFICULT TO DISPUTE'}
              </p>
              <p className="text-gray-600 mt-2">{result.dispute_reason}</p>
            </div>

            {/* [3] Appeal Steps */}
            <div className="card fade-in">
              <h3 className="text-xl font-bold text-navy mb-4">📝 Your Appeal Steps</h3>
              <div className="space-y-3">
                {(result.appeal_steps || []).map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="bg-navy text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                      {i + 1}
                    </span>
                    <p className="text-gray-800">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* [4] FIDReC Card */}
            {result.fidrec_eligible && (
              <div className="bg-info bg-opacity-10 border-2 border-info border-opacity-30 rounded-2xl p-6 fade-in">
                <h3 className="text-xl font-bold text-navy mb-2">🏛️ You Are Eligible to Escalate to FIDReC</h3>
                <p className="text-gray-700 mb-3">{result.fidrec_reason}</p>
                <div className="bg-white bg-opacity-60 rounded-xl p-4">
                  <p className="text-sm font-medium text-navy">
                    💡 FIDReC (Financial Industry Disputes Resolution Centre) is a FREE service for Singapore consumers.
                    They handle disputes up to S$100,000.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Website: <a href="https://www.fidrec.org.sg" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">fidrec.org.sg</a>
                  </p>
                  <p className="text-sm text-gray-600">Phone: 6327 2288 | Email: help@fidrec.org.sg</p>
                </div>
              </div>
            )}

            {/* [5] Appeal Deadline */}
            <div className={`card border-l-4 ${result.appeal_deadline_days <= 7 ? 'border-danger' : 'border-info'} fade-in`}>
              <h3 className="text-xl font-bold text-navy mb-2">⏰ Appeal Deadline</h3>
              <p className={`text-3xl font-bold ${result.appeal_deadline_days <= 7 ? 'text-danger' : 'text-navy'} ${elderlyMode ? '!text-4xl' : ''}`}>
                {result.appeal_deadline_days} days remaining
              </p>
              {result.appeal_deadline_days <= 7 && (
                <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-xl p-3 mt-3">
                  <p className="text-sm text-danger font-medium">⚠️ Urgent — your appeal deadline is approaching!</p>
                </div>
              )}
            </div>

            {/* [6] Supporting Documents */}
            {result.supporting_documents && (
              <DocumentChecklist
                documents={result.supporting_documents}
                warningText="Stronger evidence = better appeal outcome. Include all supporting documents available."
              />
            )}

            {/* Success Likelihood */}
            <div className={`card ${successConfig[result.success_likelihood]?.bg || ''} border-2 border-opacity-30 fade-in`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm text-gray-600">Success Likelihood</p>
                  <p className={`text-xl font-bold ${successConfig[result.success_likelihood]?.color}`}>
                    {result.success_likelihood}
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-warning bg-opacity-10 border-2 border-warning border-opacity-30 rounded-2xl p-6 fade-in">
              <h3 className="text-xl font-bold text-navy mb-2">💡 Appeal Tip</h3>
              <p className="text-gray-800">{result.pro_tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}