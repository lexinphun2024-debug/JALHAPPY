import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useElderlyMode } from '../context/ElderlyModeContext';

export default function Navbar() {
  const { elderlyMode, toggleElderlyMode, selectedLanguage, setSelectedLanguage, languages } = useElderlyMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/claim-coach', label: 'Claim Coach' },
    { to: '/sequencing', label: 'Sequencing' },
    { to: '/rejection-help', label: 'Rejection Help' },
    { to: '/policy-decoder', label: 'Policy Decoder' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${elderlyMode ? '!bg-white !border-b-4 !border-navy' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className={`text-2xl font-bold text-navy ${elderlyMode ? '!text-3xl !font-bold' : ''}`}>
                ClaimReady
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
                  } ${elderlyMode ? '!text-lg !px-5 !py-3 !rounded-xl' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side: Elderly Toggle + Language Selector */}
            <div className="flex items-center gap-3">
              {/* Language Selector (Elderly Mode Only) */}
              {elderlyMode && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedLanguage === lang.code
                          ? 'bg-navy text-white'
                          : 'text-gray-600 hover:text-navy'
                      } ${elderlyMode ? '!text-base !px-3 !py-2' : ''}`}
                      title={lang.name}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Elderly Mode Toggle */}
              <button
                onClick={toggleElderlyMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                  elderlyMode
                    ? 'bg-warning text-white hover:bg-opacity-90'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${elderlyMode ? '!text-xl !px-5 !py-3 !rounded-2xl' : ''}`}
                title={elderlyMode ? 'Disable Elderly Mode' : 'Enable Elderly Mode'}
              >
                <span>👴</span>
                <span className="hidden sm:inline">{elderlyMode ? 'ON' : 'OFF'}</span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block mx-4 mt-2 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-navy text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${elderlyMode ? '!text-xl !px-6 !py-4 !rounded-2xl' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}