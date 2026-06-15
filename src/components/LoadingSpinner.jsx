export default function LoadingSpinner({ messages = ['Loading...'] }) {
  const currentIndex = 0;
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="spinner"></div>
      <p className="text-lg font-medium text-navy pulse-slow">
        {messages[currentIndex]}
      </p>
    </div>
  );
}