import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import OnePage from "./pages/OnePage";
import NotFound from "./pages/NotFound";

export default function AppShell() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<OnePage />} />
              <Route path="/teachers" element={<OnePage />} />
              <Route path="/teachers/:id" element={<OnePage />} />
              <Route path="/submit" element={<OnePage />} />
              <Route path="/add-teacher" element={<OnePage />} />
              <Route path="/schools" element={<OnePage />} />
              <Route path="/schools/:id" element={<OnePage />} />
              <Route path="/submit-school" element={<OnePage />} />
              <Route path="/admin" element={<OnePage />} />
              <Route path="/account" element={<OnePage />} />
              <Route path="/auth" element={<OnePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
}
