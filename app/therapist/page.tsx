import Link from "next/link";
import Header from "@/components/Header";
import { prisma } from "@/lib/db";
import { THERAPIST, CLIENT_PERSONAS, getAllPersonaIds } from "@/lib/personas";
import GenerateClientButton from "./GenerateClientButton";

export const dynamic = "force-dynamic";

export default async function TherapistDashboardPage() {
  // Try to get therapist
  let therapist = await prisma.user.findUnique({
    where: { email: THERAPIST.email },
  });

  // Get clients if therapist exists
  let clients: Array<{
    id: number;
    displayName: string;
    personaId: string;
    createdAt: Date;
    sessions: Array<{
      id: number;
      date: Date;
      planVersions: Array<{
        id: number;
        versionNumber: number;
        riskFlags: string;
      }>;
    }>;
  }> = [];

  if (therapist) {
    clients = await prisma.client.findMany({
      where: { therapistId: therapist.id },
      include: {
        sessions: {
          orderBy: { date: "desc" },
          take: 1,
          include: {
            planVersions: {
              orderBy: { versionNumber: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { displayName: "asc" },
    });
  }

  // Get available personas that haven't been created yet
  const existingPersonaIds = new Set(clients.map((c) => c.personaId));
  const availablePersonas = getAllPersonaIds()
    .filter((id) => !existingPersonaIds.has(id))
    .map((id) => CLIENT_PERSONAS[id]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Home
              </Link>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div>
                  <h1 className="text-white font-semibold">Therapist Dashboard</h1>
                  <p className="text-xs text-gray-500">{clients.length} clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, Dr. Rhodes
          </h1>
          <p className="text-gray-400">
            Manage your clients, generate sessions, and create AI-assisted treatment plans.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Clients"
            value={clients.length}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            gradient="from-purple-500 to-indigo-600"
          />
          <StatCard
            label="Total Sessions"
            value={clients.reduce((acc, c) => acc + c.sessions.length, 0)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Available Personas"
            value={availablePersonas.length}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
            gradient="from-pink-500 to-rose-600"
          />
        </div>

        {/* Generate New Client Section */}
        {availablePersonas.length > 0 && (
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">
              Add New Client
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Generate a new client from available personas. This will create a session with a transcript.
            </p>
            <div className="flex flex-wrap gap-3">
              {availablePersonas.map((persona) => (
                <GenerateClientButton key={persona.id} persona={persona} />
              ))}
            </div>
          </div>
        )}

        {/* Clients List */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Your Clients</h2>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No clients yet</h3>
              <p className="text-gray-400">
                Generate your first client to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {clients.map((client) => {
                const lastSession = client.sessions[0];
                const latestPlan = lastSession?.planVersions[0];
                const riskFlags = latestPlan
                  ? JSON.parse(latestPlan.riskFlags)
                  : null;

                const gradients: Record<string, string> = {
                  alex: "from-indigo-500 to-purple-600",
                  jordan: "from-emerald-500 to-teal-600",
                  maya: "from-pink-500 to-rose-600",
                  sam: "from-amber-500 to-orange-600",
                };

                return (
                  <Link
                    key={client.id}
                    href={`/therapist/clients/${client.id}`}
                    className="block px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[client.personaId] || "from-gray-500 to-gray-600"} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-bold text-lg">
                            {client.displayName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {client.displayName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {client.personaId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {lastSession && (
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              Last session
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(lastSession.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {latestPlan && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Plan v{latestPlan.versionNumber}
                            </span>
                          )}

                          {riskFlags?.hasCrisisLanguage && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Risk Flag
                            </span>
                          )}
                        </div>

                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
