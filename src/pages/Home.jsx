import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-navy mb-6 leading-tight">
            From Incident to Payout —<br />
            <span className="text-covered">In Minutes.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Singapore's first AI claim execution engine. Upload your policy, describe what happened,
            get your exact action plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/claim-coach" className="btn-primary text-lg px-10 py-4">
              🎯 Start Claim Coach →
            </Link>
            <Link to="/sequencing" className="btn-secondary text-lg px-10 py-4">
              🔄 Optimise Claim Order →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-navy text-white py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="fade-in">
            <p className="text-4xl md:text-5xl font-extrabold text-covered mb-1">2 in 5</p>
            <p className="text-sm md:text-base text-gray-300">Singaporeans don't know their policy coverage</p>
          </div>
          <div className="fade-in">
            <p className="text-4xl md:text-5xl font-extrabold text-warning mb-1">S$373B</p>
            <p className="text-sm md:text-base text-gray-300">protection gap in Singapore</p>
          </div>
          <div className="fade-in">
            <p className="text-4xl md:text-5xl font-extrabold text-danger mb-1">#1</p>
            <p className="text-sm md:text-base text-gray-300">rejection reason: wrong documents</p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-10">
            Everything You Need to Win Your Claim
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <Link to="/claim-coach" className="card card-hover fade-in group">
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">🎯</span>
              <h3 className="text-xl font-bold text-navy mb-2">Claim Coach</h3>
              <p className="text-gray-600 text-sm">
                Incident to action plan in 60 seconds. Get your personalised step-by-step claim guide.
              </p>
            </Link>
            {/* Card 2 */}
            <Link to="/sequencing" className="card card-hover fade-in group">
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">🔄</span>
              <h3 className="text-xl font-bold text-navy mb-2">Sequencing Optimizer</h3>
              <p className="text-gray-600 text-sm">
                Never burn a lifetime limit by claiming the wrong policy first. Optimise your claim order.
              </p>
            </Link>
            {/* Card 3 */}
            <Link to="/rejection-help" className="card card-hover fade-in group">
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">🔍</span>
              <h3 className="text-xl font-bold text-navy mb-2">Rejection Help</h3>
              <p className="text-gray-600 text-sm">
                Turn a rejected claim into a winning appeal. Know your rights with FIDReC escalation.
              </p>
            </Link>
            {/* Card 4 */}
            <Link to="/policy-decoder" className="card card-hover fade-in group">
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">📖</span>
              <h3 className="text-xl font-bold text-navy mb-2">Policy Decoder</h3>
              <p className="text-gray-600 text-sm">
                Understand your policy in 60 seconds. Plain English breakdown of coverage, limits & exclusions.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
            How ClaimReady Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center fade-in">
              <div className="w-16 h-16 bg-navy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Upload Your Policy</h3>
              <p className="text-gray-600">
                Drag & drop your insurance policy PDF. Or load demo data to try instantly.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center fade-in">
              <div className="w-16 h-16 bg-navy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Describe Your Incident</h3>
              <p className="text-gray-600">
                Tell us what happened in plain English. No insurance jargon needed.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center fade-in">
              <div className="w-16 h-16 bg-covered text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Get Your Action Plan</h3>
              <p className="text-gray-600">
                Receive your personalised claim execution plan with deadlines, documents & tips.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link to="/claim-coach" className="btn-primary text-lg px-12 py-4 inline-block">
              Try Claim Coach Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Why ClaimReady */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy mb-8">Built for Singaporeans, By Singaporeans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card fade-in">
              <span className="text-4xl mb-3 block">🇸🇬</span>
              <h3 className="font-bold text-navy mb-2">Singapore-Specific</h3>
              <p className="text-sm text-gray-600">
                Knowledge of NTUC Income, AIA, Prudential, Great Eastern & more. FIDReC escalation built in.
              </p>
            </div>
            <div className="card fade-in">
              <span className="text-4xl mb-3 block">🤖</span>
              <h3 className="font-bold text-navy mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Powered by Agnes AI to read your policy, cross-reference your incident, and generate your exact plan.
              </p>
            </div>
            <div className="card fade-in">
              <span className="text-4xl mb-3 block">♿</span>
              <h3 className="font-bold text-navy mb-2">Accessible to All</h3>
              <p className="text-sm text-gray-600">
                Elderly Mode with large text, multilingual support, and simplified instructions for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}