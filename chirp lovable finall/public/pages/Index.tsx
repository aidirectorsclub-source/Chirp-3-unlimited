import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Redirect to the standalone Chirp app
    window.location.href = "/index.html";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Loading Chirp Reader...</p>
      </div>
    </div>
  );
};

export default Index;
