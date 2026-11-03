// components/EmptyState.jsx
export default function EmptyState({ title = "No data", description = "There is nothing to display at the moment." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg
        className="w-16 h-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" />
      </svg>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 text-center max-w-md">{description}</p>
    </div>
  );
}
