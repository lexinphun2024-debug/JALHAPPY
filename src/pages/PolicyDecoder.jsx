import { useState, useEffect } from 'react';
import { callAgnesLLM } from '../utils/agnesApi';
import { POLICY_DECODER_PROMPT, fillPrompt, POLICY_DECODER_LOADING_MESSAGES, DEMO_DATA_POLICY_DECODER } from '../utils/prompts';
import { extractTextFromPDF, getPdfPageCount } from '../utils/pdfExtractor';
import { useElderlyMode } from '../context/ElderlyModeContext';

export default function PolicyDecoder() {
  const { elderlyMode } = useElderlyMode();
  const [policyFile, setPolicyFile] = useState(null);
  const [policyText, setPolicyText] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [step, setStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    const msgs = POLICY_DECODER_LOADING_MESSAGES;
    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const idx = msgs.indexOf(prev);
        return msgs[(idx + 1) % msgs.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [step]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPolicyFile(file);
    try {
      const pages = await getPdfPageCount(file);
      setPageCount(pages);
      const text = await extractTextFromPDF(file);
      setPolicyText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setPolicyFile(file);
    try {
      const pages = await getPdfPageCount(file);
      setPageCount(pages);
      const text = await extractTextFromPDF(file);
      setPolicyText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  const loadDemoData = () => {
    setPolicyText(DEMO_DATA_POLICY_DECODER.policyText);
    setPolicyFile(null);
    setPageCount(0);
    setError('');
  };

  const decode = async () => {
    if (!policyText) {
      setError('Please upload a policy or load demo data.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setStep(2);
    try {
      const prompt = fillPrompt(POLICY_DECODER_PROMPT, {
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
    setPolicyText('');
    setPolicyFile(null);
    setPageCount(0);
    setStep(1);
    setResult(null);
    setError('');
  };

  return (
    <div className={`min-h-screen ${elderlyMode ? '!bg-white' : 'bg-background'} py-8 px-4`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className={`text-3xl md:text-4xl font-bold text-navy mb-2 ${elderlyMode ? '!text-4xl md:!text-5xl' : ''}`}>
            Understand Your Policy in 60 Seconds
          </h1>
          <p className="text-gray-600 text-lg">
            Upload any Singapore insurance policy. We'll decode it into plain English — what's covered, what's not, and what to watch out for.
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
                {s === 1 ? 'Upload' : s === 2 ? 'Decoding' : 'Results'}
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
          <div className="space-y-6 fade-in max-w-2xl mx-auto">
            <div className="card">
              <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                Upload Your Policy PDF
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('policy-decoder-upload').click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  policyFile ? 'border-covered bg-covered bg-opacity-5' : 'border-gray-300 hover:border-navy hover:bg-navy hover:bg-opacity-5'
                } ${elderlyMode ? '!p-14 !text-xl' : ''}`}
              >
                <input id="policy-decoder-upload" type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                {policyFile ? (
                  <div>
                    <span className="text-5xl mb-2 block">📄</span>
                    <p className="font-semibold text-navy text-lg">{policyFile.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{pageCount} pages • Text extracted</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-5xl mb-2 block">📤</span>
                    <p className="font-medium text-gray-600 text-lg">Drag & drop your policy PDF here</p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            <button onClick={loadDemoData} className="btn-warning w-full text-center">🎯 Load Demo Data</button>

            <button
              onClick={decode}
              disabled={!policyText || isAnalyzing}
              className={`btn-primary w-full text-center text-lg ${(!policyText || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''} ${elderlyMode ? '!text-xl !py-4' : ''}`}
            >
              {isAnalyzing ? 'Decoding...' : '🔍 Decode My Policy →'}
            </button>
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 2 && (
          <div className="card text-center py-16 fade-in">
            <div className="flex flex-col items-center gap-6">
              <div className="spinner"></div>
              <h2 className={`text-2xl font-bold text-navy ${elderlyMode ? '!text-3xl' : ''}`}>Decoding Your Policy</h2>
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
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-navy underline transition-colors">← Decode Another Policy</button>
            </div>

            {/* Insurer Info Bar */}
            <div className="bg-navy text-white rounded-2xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-gray-300">Insurer</p>
                  <p className="text-2xl font-bold">{result.insurer_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">{result.policy_type} Insurance</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Claim Deadline</p>
                  <p className="text-xl font-bold">{result.claim_deadline || '30 days'}</p>
                </div>
                {result.insurer_hotline && (
                  <a href={`tel:${result.insurer_hotline}`} className="bg-covered text-white rounded-xl px-6 py-3 font-bold hover:bg-opacity-90 transition-colors">
                    📞 {result.insurer_hotline}
                  </a>
                )}
              </div>
            </div>

            {/* 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ✅ Green: What You're Covered For */}
              <div className="card border-l-4 border-covered fade-in">
                <h3 className="text-lg font-bold text-covered mb-3 flex items-center gap-2">
                  <span className="text-2xl">✅</span> What You're Covered For
                </h3>
                <ul className="space-y-2">
                  {(result.covered || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-covered mt-0.5">•</span>
                      <span className="text-gray-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ❌ Red: What You're NOT Covered For */}
              <div className="card border-l-4 border-danger fade-in">
                <h3 className="text-lg font-bold text-danger mb-3 flex items-center gap-2">
                  <span className="text-2xl">❌</span> What You're NOT Covered For
                </h3>
                <ul className="space-y-2">
                  {(result.not_covered || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-danger mt-0.5">•</span>
                      <span className="text-gray-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ⚠️ Amber: Key Limits & Amounts */}
              <div className="card border-l-4 border-warning fade-in">
                <h3 className="text-lg font-bold text-warning mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span> Key Limits & Amounts
                </h3>
                <ul className="space-y-2">
                  {(result.key_limits || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning mt-0.5">•</span>
                      <span className="text-gray-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 📋 Blue: Important Exclusions */}
              <div className="card border-l-4 border-info fade-in">
                <h3 className="text-lg font-bold text-info mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span> Important Exclusions
                </h3>
                <ul className="space-y-2">
                  {(result.exclusions || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-info mt-0.5">•</span>
                      <span className="text-gray-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-warning bg-opacity-10 border-2 border-warning border-opacity-30 rounded-2xl p-6 fade-in">
              <h3 className="text-xl font-bold text-navy mb-2">💡 Policy Decoder Pro Tip</h3>
              <p className="text-gray-800">{result.pro_tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}