"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ForecastSection from "@/components/ForecastSection";
import RetentionSection from "@/components/RetentionSection";
import HistorySection from "@/components/HistorySection";
import FeedbackSection from "@/components/FeedbackSection";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { generateForecast, type ForecastState } from "@/lib/forecasts";

export default function Home() {
  const [forecastState, setForecastState] = useState<ForecastState>({
    status: "idle",
  });

  const handleGenerate = useCallback(async (sign: string, name: string) => {
    setForecastState({ status: "loading", sign, name });

    // Scroll to forecast section on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("forecast")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }

    try {
      const data = await generateForecast(sign);
      setForecastState({ status: "ready", sign, name, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao consultar os astros.";
      setForecastState({ status: "error", message });
    }
  }, []);

  return (
    <>
      <Header />

      <main className="pt-28 pb-28 md:pb-24 px-4 md:px-6 min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column — Hero & Onboarding */}
          <div className="lg:col-span-5">
            <HeroSection
              onGenerate={handleGenerate}
              isGenerating={forecastState.status === "loading"}
            />
          </div>

          {/* Right Column — Forecast, Retention, History */}
          <div className="lg:col-span-7 space-y-8">
            <ForecastSection forecastState={forecastState} />
            <RetentionSection />
            <HistorySection />
            <FeedbackSection />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
