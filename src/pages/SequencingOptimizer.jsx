import { useState, useEffect } from 'react';
import { callAgnesLLM } from '../utils/agnesApi';
import { SEQUENCING_OPTIMIZER_PROMPT, fillPrompt, SEQUENCING_LOADING_MESSAGES, DEMO_DATA_SEQUENCING } from '../utils/prompts';
import { extractTextFromPDF, getPdfPageCount } from '../utils/pdfExtractor';
import DocumentChecklist from '../components/DocumentChecklist';
import { useElderlyMode } from '../context/ElderlyModeContext';

export default function SequencingOptimizer() {
  const { elderlyMode } = useElderlyMode();
  const [incident, setIncident] = useState('');
  const [policy1File, setPolicy1File] = useState(null);
  const [policy2File, setPolicy2File] = useState(null);
  const [policy1Text, setPolicy1Text] = useState('');
  const [policy2Text, setPolicy2Text] = useState('');
  const [policy1Pages, setPolicy1Pages] = useState(0);
  const [policy2Pages, setPolicy2Pages] = useState(0);
  const [step, setStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Loading messages rotation
  useEffect(() => {
    if (step !== 2) return;
    const msgs = SEQUENCING_LOADING_MESSAGES;
    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const idx = msgs.indexOf(prev);
        return msgs[(idx + 1) % msgs.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [step]);

  // Handle PDF upload
  const handlePdfUpload = async (e, setFile, setText, setPages) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    try {
      const pageCount = await getPdfPageCount(file);
      setPages(pageCount);
      const text = await extractTextFromPDF(file);
      setText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, setFile, setText, setPages) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setFile(file);
    try {
      const pageCount = await getPdfPageCount(file);
      setPages(pageCount);
      const text = await extractTextFromPDF(file);
      setText(text);
    } catch (err) {
      setError(`PDF upload failed: ${err.message}`);
    }
  };

  // Load demo data
  const loadDemoData = () => {
    setIncident(DEMO_DATA_SEQUENCING.incident);
    setPolicy1Text(DEMO_DATA_SEQUENCING.policy1Text);
    setPolicy2Text(DEMO_DATA_SEQUENCING.policy2Text);
    setPolicy1File(null);
    setPolicy2File(null);
    setPolicy1Pages(0);
    setPolicy2Pages(0);
    setError('');
  };

  // Analyse
  const analyse = async () => {
    if (!incident || (!policy1Text && !policy2Text)) {
      setError('Please enter an incident and upload both policies or load demo data.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setStep(2);
    try {
      const prompt = fillPrompt(SEQUENCING_OPTIMIZER_PROMPT, {
        INCIDENT: incident,
        POLICY1_TEXT: policy1Text,
        POLICY2_TEXT: policy2Text,
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
    setIncident('');
    setPolicy1Text('');
    setPolicy2Text('');
    setPolicy1File(null);
    setPolicy2File(null);
    setPolicy1Pages(0);
    setPolicy2Pages(0);
    setStep(1);
    setResult(null);
    setError('');
  };

  return (
    <div className={`min-h-screen ${elderlyMode ? '!bg-white' : 'bg-background'} py-8 px-4`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className={`text-3xl md:text-4xl font-bold text-navy mb-3 ${elderlyMode ? '!text-4xl md:!text-5xl' : ''}`}>
            🏆 Never Claim From the Wrong Policy First
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Most Singaporeans have two insurance policies and don't know which to claim from first.
            The wrong order can cost you thousands — or silently burn a lifetime limit you can never recover.
          </p>
        </div>

        {/* Example Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card card-hover border-l-4 border-warning fade-in">
            <h3 className="font-bold text-navy text-lg mb-2">⚠️ The Lifetime Limit Trap</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              You have company group insurance AND your own Integrated Shield Plan.
              Most people claim company insurance because HR makes it easy.
              <strong className="text-danger"> What nobody tells you: company insurance has a lifetime limit that never resets.</strong>
              Your personal ISP resets every year. Every unnecessary company claim burns a resource you can never recover.
            </p>
          </div>
          <div className="card card-hover border-l-4 border-info fade-in">
            <h3 className="font-bold text-navy text-lg mb-2">💳 The Credit Card Insurance Trap</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              You booked flights with your DBS Altitude card — which includes free travel insurance.
              You also bought travel insurance separately.
              <strong className="text-info"> Your paid policy has a $100 excess. Your card insurance has none.</strong>
              Claim card insurance first → excess never triggered → you recover more money.
              Most people don't even know their credit card has travel insurance.
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'
              } ${elderlyMode ? '!w-14 !h-14 !text-xl' : ''}`}>
                {s}
              </div>
              <span className={`font-medium hidden sm:inline ${step >= s ? 'text-navy' : 'text-gray-400'} ${elderlyMode ? '!text-lg' : ''}`}>
                {s === 1 ? 'Upload' : s === 2 ? 'Analysing' : 'Results'}
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
            {/* Incident Description */}
            <div className="card">
              <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                Describe Your Incident
              </label>
              <textarea
                value={incident}
                onChange={(e) => setIncident(e.target.value)}
                placeholder="e.g. I was hospitalised at SGH for appendicitis surgery, Class A ward, 3 nights"
                rows={4}
                className={`input-field resize-none ${elderlyMode ? '!text-xl !py-4 !px-6' : ''}`}
              />
            </div>

            {/* Policy Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Policy 1 */}
              <div className="card">
                <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                  Policy 1 (First policy you might claim from)
                </label>
                <p className="text-sm text-gray-500 mb-3">e.g. Company Group Insurance</p>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, setPolicy1File, setPolicy1Text, setPolicy1Pages)}
                  onClick={() => document.getElementById('policy1-upload').click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    policy1File ? 'border-covered bg-covered bg-opacity-5' : 'border-gray-300 hover:border-navy'
                  } ${elderlyMode ? '!p-8' : ''}`}
                >
                  <input id="policy1-upload" type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, setPolicy1File, setPolicy1Text, setPolicy1Pages)} className="hidden" />
                  {policy1File ? (
                    <div>
                      <p className="text-2xl mb-1">📄</p>
                      <p className="font-semibold text-navy text-sm">{policy1File.name}</p>
                      <p className="text-xs text-gray-400">{policy1Pages} pages • Text extracted</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-1">📤</p>
                      <p className="text-sm text-gray-500">Upload Policy 1 PDF</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy 2 */}
              <div className="card">
                <label className={`block font-semibold text-navy mb-2 ${elderlyMode ? '!text-xl' : ''}`}>
                  Policy 2 (Your second policy)
                </label>
                <p className="text-sm text-gray-500 mb-3">e.g. Personal Integrated Shield Plan / Credit Card Insurance</p>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, setPolicy2File, setPolicy2Text, setPolicy2Pages)}
                  onClick={() => document.getElementById('policy2-upload').click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    policy2File ? 'border-covered bg-covered bg-opacity-5' : 'border-gray-300 hover:border-navy'
                  } ${elderlyMode ? '!p-8' : ''}`}
                >
                  <input id="policy2-upload" type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, setPolicy2File, setPolicy2Text, setPolicy2Pages)} className="hidden" />
                  {policy2File ? (
                    <div>
                      <p className="text-2xl mb-1">📄</p>
                      <p className="font-semibold text-navy text-sm">{policy2File.name}</p>
                      <p className="text-xs text-gray-400">{policy2Pages} pages • Text extracted</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-1">📤</p>
                      <p className="text-sm text-gray-500">Upload Policy 2 PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Demo Button */}
            <button onClick={loadDemoData} className="btn-warning w-full text-center">🎯 Load Demo Data</button>

            {/* Analyse */}
            <button
              onClick={analyse}
              disabled={!incident || (!policy1Text && !policy2Text) || isAnalyzing}
              className={`btn-primary w-full text-center text-lg ${
                (!incident || (!policy1Text && !policy2Text) || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''
              } ${elderlyMode ? '!text-xl !py-4' : ''}`}
            >
              {isAnalyzing ? 'Analysing...' : '🔍 Find Optimal Claim Order →'}
            </button>
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 2 && (
          <div className="card text-center py-16 fade-in">
            <div className="flex flex-col items-center gap-6">
              <div className="spinner"></div>
              <h2 className={`text-2xl font-bold text-navy ${elderlyMode ? '!text-3xl' : ''}`}>Finding Your Optimal Claim Order</h2>
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
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-navy underline transition-colors">← Start New Analysis</button>
            </div>

            {/* Optimal Order Header */}
            <div className={`card border-2 ${result.optimal_first === 'POLICY1' ? 'border-covered' : 'border-info'} fade-in`}>
              <div className="text-center">
                <span className="text-5xl mb-3 block">🏆</span>
                <h2 className={`text-2xl font-bold text-navy mb-1 ${elderlyMode ? '!text-3xl' : ''}`}>
                  Your Optimal Claim Order Is:
                </h2>
                <p className={`text-3xl font-bold ${result.optimal_first === 'POLICY1' ? 'text-covered' : 'text-info'} ${elderlyMode ? '!text-4xl' : ''}`}>
                  1️⃣ {result.optimal_first === 'POLICY1' ? result.policy1_name : result.policy2_name}
                </p>
                <p className="text-gray-600 mt-2">{result.first_reason}</p>
              </div>
            </div>

            {/* Step 1 Card */}
            <div className={`card border-l-4 border-covered fade-in ${elderlyMode ? '!p-8' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-covered text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <h3 className="text-xl font-bold text-navy">Claim This First</h3>
              </div>
              <p className="text-lg font-semibold text-covered mb-1">{result.optimal_first === 'POLICY1' ? result.policy1_name : result.policy2_name}</p>
              <p className="text-gray-700 mb-3">{result.first_reason}</p>
              <div className="bg-covered bg-opacity-10 rounded-xl p-3">
                <p className="text-sm font-medium text-covered">Expected payout: {result.first_expected_payout}</p>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className={`card border-l-4 border-info fade-in ${elderlyMode ? '!p-8' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`bg-info text-white w-8 h-8 rounded-full flex items-center justify-center font-bold`}>{result.second_needed ? '2' : '—'}</span>
                <h3 className="text-xl font-bold text-navy">Second Policy</h3>
              </div>
              <p className="text-lg font-semibold mb-1">{result.second_needed ? result.optimal_first === 'POLICY1' ? result.policy2_name : result.policy1_name : 'Not needed for this claim'}</p>
              <p className="text-gray-700">{result.second_reason}</p>
            </div>

            {/* Money Impact */}
            <div className="bg-navy text-white rounded-2xl p-6 fade-in">
              <h3 className="text-xl font-bold mb-4">💰 Money Impact</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-danger text-xl">🚫</span>
                  <div>
                    <p className="text-sm text-gray-300">Wrong order costs you:</p>
                    <p className="font-bold text-danger">{result.wrong_order_consequence}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-covered text-xl">✅</span>
                  <div>
                    <p className="text-sm text-gray-300">Correct order preserves:</p>
                    <p className="font-bold text-covered">{result.money_saved_description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wrong Order Warning */}
            <div className="bg-danger bg-opacity-10 border-2 border-danger border-opacity-30 rounded-2xl p-6 fade-in">
              <h3 className="text-xl font-bold text-danger mb-2">⚠️ What If You Claimed in the Wrong Order?</h3>
              <p className="text-gray-800">{result.wrong_order_consequence}</p>
            </div>

            {/* Pro Tip */}
            <div className="bg-warning bg-opacity-10 border-2 border-warning border-opacity-30 rounded-2xl p-6 fade-in">
              <h3 className="text-xl font-bold text-navy mb-2">💡 Multi-Policy Insiders Tip</h3>
              <p className="text-gray-800">{result.pro_tip}</p>
            </div>

            {/* Document Checklist */}
            {result.combined_documents && (
              <DocumentChecklist
                documents={result.combined_documents}
                warningText="Have all documents ready before submitting — incomplete submissions are the most common cause of claim delays in Singapore."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}