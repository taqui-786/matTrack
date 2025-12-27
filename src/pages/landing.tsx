import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-white text-slate-900 selection:bg-primary/10">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-16 sm:pt-28 sm:pb-24">
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-100 text-center">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <a
            href="https://taqui-imam.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 hover:text-primary transition-colors hover:underline"
          >
            Md Taqui Imam
          </a>
        </p>
      </footer>
    </div>
  );
}
