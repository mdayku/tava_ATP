import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CLIENT_PERSONAS } from "@/lib/personas";
import SessionActions from "./SessionActions";
import TranscriptModal from "./TranscriptModal";
import UploadTranscriptModal from "./UploadTranscriptModal";
import EditPlanModal from "./EditPlanModal";
import { DeleteSessionButton, DeletePlanButton, DeleteSummaryButton } from "./DeleteButtons";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default async function ClientTimelinePage({ params }: Props) {
  const clientId = Number(params.id);

  if (isNaN(clientId)) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      therapist: true,
      sessions: {
        orderBy: { date: "desc" },
        include: {
          planVersions: {
            orderBy: { versionNumber: "desc" },
          },
          summaries: true,
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const persona = CLIENT_PERSONAS[client.personaId as keyof typeof CLIENT_PERSONAS];
  
  const gradients: Record<string, string> = {
    alex: "from-indigo-500 to-purple-600",
    jordan: "from-emerald-500 to-teal-600",
    maya: "from-pink-500 to-rose-600",
    sam: "from-amber-500 to-orange-600",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/therapist" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradients[client.personaId] || "from-gray-500 to-gray-600"} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{client.displayName[0]}</span>
                </div>
                <div>
                  <h1 className="text-white font-semibold">{client.displayName}</h1>
                  <p className="text-xs text-gray-500">{client.sessions.length} sessions</p>
                </div>
              </div>
            </div>
            <Link
              href={`/client/${client.id}`}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              View client portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[client.personaId] || "from-gray-500 to-gray-600"} flex items-center justify-center shadow-xl`}>
                <span className="text-2xl font-bold text-white">
                  {client.displayName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {client.displayName}
                </h1>
                {persona && (
                  <>
                    <p className="text-gray-400">
                      {persona.age} years old, {persona.pronouns}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {persona.presentingConcerns}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {persona && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Context:</span> {persona.context}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium text-gray-400">Notes:</span> {persona.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Sessions</h2>
            <div className="flex items-center gap-2">
              <UploadTranscriptModal clientId={client.id} clientName={client.displayName} />
              <SessionActions clientId={client.id} personaId={client.personaId} sessionCount={client.sessions.length} />
            </div>
          </div>

          {client.sessions.length === 0 ? (
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No sessions yet</h3>
              <p className="text-gray-400">
                Generate a new session or paste a transcript to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {client.sessions.map((session, index) => {
                const sessionNumber = client.sessions.length - index;
                const latestPlan = session.planVersions[0];
                const riskFlags = latestPlan
                  ? JSON.parse(latestPlan.riskFlags as string)
                  : null;
                const hasSummary = !!session.summaries;
                const therapistView = latestPlan ? JSON.parse(latestPlan.therapistView as string) : null;
                
                // Check if any previous session has a plan (for "Update Plan" label)
                const hasExistingClientPlan = client.sessions.some((s, i) => 
                  i > index && s.planVersions.length > 0
                );

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">
                            Session #{sessionNumber}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                            session.source === "manual" 
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                              : "bg-white/5 text-gray-400 border-white/10"
                          }`}>
                            {session.source === "manual" ? "Uploaded" : "AI Generated"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(session.date).toLocaleString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {latestPlan && (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Plan v{latestPlan.versionNumber}
                            </span>
                            {latestPlan.editedByTherapist && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Edited
                              </span>
                            )}
                          </div>
                        )}
                        {hasSummary && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Summary
                          </span>
                        )}
                        {riskFlags?.hasCrisisLanguage && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                            </svg>
                            Risk Flag
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last Updated Timestamp */}
                    {latestPlan && (
                      <p className="text-xs text-gray-500 mb-4">
                        Plan last updated: {formatTimeAgo(new Date(latestPlan.createdAt))}
                      </p>
                    )}

                    {/* Risk Details */}
                    {riskFlags?.hasCrisisLanguage && riskFlags.keywords?.length > 0 && (
                      <div className="mb-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-sm font-medium text-amber-400 mb-1">
                          Crisis language detected
                        </p>
                        <p className="text-xs text-amber-500/80">
                          Keywords: {riskFlags.keywords.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Treatment Plan Preview */}
                    {therapistView && (
                      <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">
                          Treatment Plan Summary
                        </h4>
                        <div className="space-y-2 text-sm text-gray-400">
                          <p>
                            <span className="font-medium text-gray-300">Concerns:</span>{" "}
                            {therapistView.presenting_concerns?.slice(0, 150)}...
                          </p>
                          <p>
                            <span className="font-medium text-gray-300">Goals:</span>{" "}
                            {therapistView.goals?.short_term?.slice(0, 2).join("; ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <TranscriptModal
                        sessionId={session.id}
                        transcript={session.transcript}
                        clientName={client.displayName}
                        sessionDate={session.date.toString()}
                      />
                      {latestPlan && therapistView && (
                        <EditPlanModal
                          planVersionId={latestPlan.id}
                          therapistView={therapistView}
                          sessionNumber={sessionNumber}
                        />
                      )}
                      <SessionActions
                        clientId={client.id}
                        personaId={client.personaId}
                        sessionId={session.id}
                        sessionNumber={sessionNumber}
                        hasPlan={!!latestPlan}
                        hasSummary={hasSummary}
                        hasExistingClientPlan={hasExistingClientPlan}
                        isInline
                      />
                      
                      {/* Spacer */}
                      <div className="flex-1" />
                      
                      {/* Delete Actions */}
                      <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                        {latestPlan && (
                          <DeletePlanButton planId={latestPlan.id} />
                        )}
                        {session.summaries && (
                          <DeleteSummaryButton summaryId={session.summaries.id} />
                        )}
                        <DeleteSessionButton 
                          sessionId={session.id} 
                          sessionNumber={sessionNumber}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
