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
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title="Therapist Dashboard"
        subtitle={`Dr. Avery Rhodes - ${clients.length} clients`}
        showBackLink
        backHref="/"
        backLabel="Home"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome back, Dr. Rhodes
          </h1>
          <p className="text-slate-600">
            Manage your clients, generate synthetic sessions, and create AI-assisted treatment plans.
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
          />
          <StatCard
            label="Total Sessions"
            value={clients.reduce((acc, c) => acc + c.sessions.length, 0)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Available Personas"
            value={availablePersonas.length}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />
        </div>

        {/* Generate New Client Section */}
        {availablePersonas.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Add Synthetic Client
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Generate a new client from available personas. This will create a new session with a synthetic transcript.
            </p>
            <div className="flex flex-wrap gap-3">
              {availablePersonas.map((persona) => (
                <GenerateClientButton key={persona.id} persona={persona} />
              ))}
            </div>
          </div>
        )}

        {/* Clients List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Your Clients</h2>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No clients yet</h3>
              <p className="text-slate-600 mb-4">
                Generate your first synthetic client to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {clients.map((client) => {
                const lastSession = client.sessions[0];
                const latestPlan = lastSession?.planVersions[0];
                const riskFlags = latestPlan
                  ? JSON.parse(latestPlan.riskFlags)
                  : null;

                return (
                  <Link
                    key={client.id}
                    href={`/therapist/clients/${client.id}`}
                    className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {client.displayName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {client.displayName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Persona: {client.personaId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {lastSession && (
                          <div className="text-right">
                            <p className="text-sm text-slate-600">
                              Last session
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(lastSession.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {latestPlan && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Plan v{latestPlan.versionNumber}
                            </span>
                          )}

                          {riskFlags?.hasCrisisLanguage && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Risk Flag
                            </span>
                          )}
                        </div>

                        <svg
                          className="w-5 h-5 text-slate-400"
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
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

