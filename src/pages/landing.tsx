import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/10">
      {/* Navbar */}
<Navbar/>
      {/* Hero Section */}
      <main className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant={"outline"} className="mb-8">
              AI Powered Material Forecast
            </Badge>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
              Precision Logistics for Modern Construction
            </h1>

            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Transform your material request workflow with real-time tracking,
              automated inventory management, and predictive demand forecasting.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-8">
                <Link to="/sign-up">
                  Get Started
                  <HugeiconsIcon icon={ArrowRight} size={18} className="ml-2" />
                </Link>
              </Button>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-2 gap-4 border-t pt-12 text-center sm:grid-cols-4 sm:gap-8">
              {[
                { label: "Active Sites", value: "250+" },
                { label: "Material Flux", value: "Optimized" },
                { label: "Cost Savings", value: "30%" },
                { label: "Latency", value: "<100ms" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
