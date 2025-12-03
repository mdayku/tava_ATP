import Link from "next/link";
import { CLIENT_PERSONAS } from "@/lib/personas";

export default function HomePage() {
  const personas = Object.values(CLIENT_PERSONAS);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px]" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                AI-Assisted
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Treatment Plans
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Generate structured, clinically-informed treatment plans from therapy
              session transcripts. Dual views for therapists and clients.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/therapist"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="relative z-10">Enter as Dr. Avery</span>
              </Link>
              
              <Link
                href="/client/1"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm text-white font-semibold text-lg border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>View as Client</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
            title="Session Generation"
            description="Generate realistic therapy transcripts using AI-powered simulation with predefined client personas."
            gradient="from-purple-500/20 to-pink-500/20"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Dual-View Plans"
            description="Clinical treatment plans for therapists and plain-language versions for clients, generated from the same data."
            gradient="from-blue-500/20 to-cyan-500/20"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Safety Detection"
            description="Automatic flagging of crisis language with keyword scanning and risk categorization for clinician review."
            gradient="from-amber-500/20 to-orange-500/20"
          />
        </div>
      </div>

      {/* Client Personas Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Client Personas
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Test the system with pre-defined client personas representing diverse presenting concerns.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-20" />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className={`group relative rounded-3xl bg-gradient-to-br ${gradient} p-[1px] transition-all duration-300 hover:scale-[1.02]`}>
      <div className="h-full rounded-3xl bg-[#0a0a0f]/90 backdrop-blur-xl p-6">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
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
  
  const gradients: Record<string, string> = {
    alex: "from-indigo-500 to-purple-600",
    jordan: "from-emerald-500 to-teal-600",
    maya: "from-pink-500 to-rose-600",
    sam: "from-amber-500 to-orange-600",
  };

  return (
    <div className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[persona.id] || "from-gray-500 to-gray-600"} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
          {persona.displayName[0]}
        </div>
        <div>
          <h4 className="font-semibold text-white text-lg">{persona.displayName}</h4>
          <p className="text-sm text-gray-500">
            {persona.age}yo, {persona.pronouns}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-2 font-medium">{persona.presentingConcerns}</p>
      <p className="text-xs text-gray-500">{persona.context}</p>
      {isRiskPersona && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
          Safety testing persona
        </div>
      )}
    </div>
  );
}
