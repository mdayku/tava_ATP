import Link from "next/link";
import { CLIENT_PERSONAS } from "@/lib/personas";

export default function HomePage() {
  const personas = Object.values(CLIENT_PERSONAS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-subtle" />
              <span className="text-sm font-medium text-indigo-700">
                Gauntlet x Tava Health Challenge
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              AI-Assisted
              <span className="block gradient-bg bg-clip-text text-transparent">
                Treatment Plans
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Generate structured, clinically-informed treatment plans from therapy
              session transcripts. Dual views for therapists and clients.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/therapist"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Enter as Dr. Avery
              </Link>
              
              <Link
                href="/client/1"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold text-lg hover:bg-slate-50 transition-all border-2 border-slate-200 hover:border-slate-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View as Client
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
            title="Synthetic Sessions"
            description="Generate realistic therapy transcripts using AI-powered simulation with predefined client personas."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Dual-View Plans"
            description="Clinical treatment plans for therapists and plain-language versions for clients, generated from the same data."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Safety Detection"
            description="Automatic flagging of crisis language with keyword scanning and risk categorization for clinician review."
          />
        </div>
      </div>

      {/* Client Personas Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Synthetic Client Personas
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Test the system with pre-defined client personas representing diverse presenting concerns.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-500">
            Built for the Gauntlet x Tava Health AI Engineer Challenge.
            This is a demo application using synthetic data only.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function PersonaCard({
  persona,
}: {
  persona: {
    id: string;
    displayName: string;
    age: number;
    pronouns: string;
    presentingConcerns: string;
    context: string;
  };
}) {
  const isRiskPersona = persona.id === "sam";

  return (
    <div className={`bg-white rounded-xl p-5 border ${isRiskPersona ? "border-amber-200" : "border-slate-200"} hover:shadow-md transition-all`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${isRiskPersona ? "bg-amber-500" : "bg-indigo-500"}`}>
          {persona.displayName[0]}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{persona.displayName}</h4>
          <p className="text-xs text-slate-500">
            {persona.age}yo, {persona.pronouns}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-2">{persona.presentingConcerns}</p>
      <p className="text-xs text-slate-400">{persona.context}</p>
      {isRiskPersona && (
        <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
          Safety testing persona
        </div>
      )}
    </div>
  );
}
