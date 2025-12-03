import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { prisma } from "@/lib/db";
import { CLIENT_PERSONAS } from "@/lib/personas";
import SessionActions from "./SessionActions";
import TranscriptModal from "./TranscriptModal";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title={`${client.displayName}'s Timeline`}
        subtitle={`${client.sessions.length} sessions`}
        showBackLink
        backHref="/therapist"
        backLabel="Dashboard"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {client.displayName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {client.displayName}
                </h1>
                {persona && (
                  <>
                    <p className="text-slate-600">
                      {persona.age} years old, {persona.pronouns}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {persona.presentingConcerns}
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <Link
              href={`/client/${client.id}`}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View client portal
            </Link>
          </div>

          {persona && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Context:</span> {persona.context}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                <span className="font-medium">Notes:</span> {persona.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
            <SessionActions clientId={client.id} personaId={client.personaId} sessionCount={client.sessions.length} />
          </div>

          {client.sessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sessions yet</h3>
              <p className="text-slate-600">
                Generate a new session to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {client.sessions.map((session, index) => {
                const latestPlan = session.planVersions[0];
                const riskFlags = latestPlan
                  ? JSON.parse(latestPlan.riskFlags)
                  : null;
                const hasSummary = !!session.summaries;

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900">
                            Session #{client.sessions.length - index}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {session.source}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
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
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Plan v{latestPlan.versionNumber}
                          </span>
                        )}
                        {hasSummary && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Summary
                          </span>
                        )}
                        {riskFlags?.hasCrisisLanguage && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                            </svg>
                            Risk Flag
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Risk Details */}
                    {riskFlags?.hasCrisisLanguage && riskFlags.keywords?.length > 0 && (
                      <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          Crisis language detected
                        </p>
                        <p className="text-xs text-amber-700">
                          Keywords: {riskFlags.keywords.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Treatment Plan Preview */}
                    {latestPlan && (
                      <div className="mb-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Treatment Plan Summary
                        </h4>
                        {(() => {
                          const plan = JSON.parse(latestPlan.therapistView);
                          return (
                            <div className="space-y-2 text-sm text-slate-600">
                              <p>
                                <span className="font-medium">Concerns:</span>{" "}
                                {plan.presenting_concerns?.slice(0, 150)}...
                              </p>
                              <p>
                                <span className="font-medium">Goals:</span>{" "}
                                {plan.goals?.short_term?.slice(0, 2).join("; ")}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <TranscriptModal
                        sessionId={session.id}
                        transcript={session.transcript}
                        clientName={client.displayName}
                        sessionDate={session.date.toString()}
                      />
                      <SessionActions
                        clientId={client.id}
                        personaId={client.personaId}
                        sessionId={session.id}
                        hasPlan={!!latestPlan}
                        hasSummary={hasSummary}
                        isInline
                      />
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
