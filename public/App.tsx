import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Temporary admin imports - REMOVE AFTER USE
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase config (same as in index.html)
const firebaseConfig = {
  apiKey: "AIzaSyCkqfwZTiIpQ652aUqgfLvHN6ft2kDo5nU",
  authDomain: "chirp-3-unlimited.firebaseapp.com",
  projectId: "chirp-3-unlimited",
  storageBucket: "chirp-3-unlimited.firebasestorage.app",
  messagingSenderId: "996765066152",
  appId: "1:996765066152:web:9519d0d56bdd86c45ef39d",
  measurementId: "G-15084MZHND"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const functions = getFunctions(app, 'europe-west3');

// Temporary function - REMOVE AFTER USE
async function giveMeAdmin() {
  try {
    const makeAdmin = httpsCallable(functions, "makeAdmin");
    const result = await makeAdmin({ email: "farbod376@gmail.com" });
    console.log("Admin result:", result.data);
    alert("Admin claim set! Check console for details. Sign out and back in for changes to take effect.");
  } catch (error: any) {
    console.error("Error setting admin:", error);
    alert("Error: " + (error.message || error));
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* TEMPORARY ADMIN BUTTON - REMOVE AFTER USE */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        background: '#FF453A',
        padding: '8px 16px',
        borderRadius: '8px'
      }}>
        <button
          onClick={giveMeAdmin}
          style={{
            color: 'white',
            fontWeight: 'bold',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Make me admin
        </button>
      </div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
