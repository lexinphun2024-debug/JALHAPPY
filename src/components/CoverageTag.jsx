/**
 * CoverageTag component - Displays coverage status with color-coded badge
 * @param {'YES'|'NO'|'PARTIAL'} status - Coverage status
 * @param {string} explanation - Plain English explanation
 * @param {string} clauseReference - Policy clause reference (optional)
 */
export default function CoverageTag({ status, explanation, clauseReference }) {
  const config = {
    YES: {
      bgClass: 'bg-covered bg-opacity-10 border-covered',
      icon: '✅',
      label: 'YOU ARE COVERED',
      textColor: 'text-covered',
    },
    NO: {
      bgClass: 'bg-danger bg-opacity-10 border-danger',
      icon: '❌',
      label: 'NOT COVERED',
      textColor: 'text-danger',
    },
    PARTIAL: {
      bgClass: 'bg-warning bg-opacity-10 border-warning',
      icon: '⚠️',
      label: 'PARTIALLY COVERED',
      textColor: 'text-warning',
    },
  };

  const style = config[status] || config.NO;

  return (
    <div className={`${style.bgClass} border-2 rounded-2xl p-6 fade-in`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{style.icon}</span>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${style.textColor} mb-2`}>
            {style.label}
          </h3>
          <p className="text-base text-gray-800 mb-2">{explanation}</p>
          {clauseReference && (
            <p className="text-sm text-gray-500 italic">
              Source: {clauseReference}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}