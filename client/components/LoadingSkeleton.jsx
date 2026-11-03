// components/LoadingSkeleton.jsx
export default function LoadingSkeleton({ width = "100%", height = "1rem" }) {
  return (
    <div
      className="bg-gray-300 dark:bg-gray-700 animate-pulse"
      style={{ width, height, borderRadius: "0.25rem" }}
    />
  );
}
