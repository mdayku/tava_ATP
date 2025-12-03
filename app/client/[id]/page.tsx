import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CLIENT_PERSONAS } from "@/lib/personas";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ClientDashboardPage({ params }: Props) {
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
            take: 1,
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
  const latestSession = client.sessions[0];
  const latestPlan = latestSession?.planVersions[0];
  const summary = latestSession?.summaries;

  // Parse JSON data
  const plan = latestPlan ? JSON.parse(latestPlan.clientView) : null;
  const summaryData = summary
    ? {
        therapistView: JSON.parse(summary.therapistView),
        clientView: JSON.parse(summary.clientView),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold">{client.displayName[0]}</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Your Care Plan
                </h1>
                <p className="text-xs text-slate-500">
                  With {client.therapist.name}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Hi {client.displayName}!
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Here&apos;s your personalized care plan based on your sessions with {client.therapist.name}.
            Remember, this is a guide to support your journey.
          </p>
        </div>

        {plan ? (
          <div className="space-y-6">
            {/* What You're Working On */}
            <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    What You&apos;re Working On
                  </h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-slate-700 leading-relaxed">
                  {plan.presenting_concerns || "Your therapist is still drafting this section."}
                </p>
              </div>
            </section>

            {/* Goals */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Short-term Goals */}
              <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Near-Term Goals
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-5">
                  {plan.goals?.short_term?.length > 0 ? (
                    <ul className="space-y-3">
                      {plan.goals.short_term.map((goal: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No goals set yet.</p>
                  )}
                </div>
              </section>

              {/* Long-term Goals */}
              <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Bigger Picture Goals
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-5">
                  {plan.goals?.long_term?.length > 0 ? (
                    <ul className="space-y-3">
                      {plan.goals.long_term.map((goal: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No goals set yet.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Homework */}
            <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Practice & Homework
                  </h3>
                </div>
              </div>
              <div className="px-6 py-5">
                {plan.homework?.length > 0 ? (
                  <ul className="space-y-3">
                    {plan.homework.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No homework assigned yet.</p>
                )}
              </div>
            </section>

            {/* Strengths */}
            <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Your Strengths
                  </h3>
                </div>
              </div>
              <div className="px-6 py-5">
                {plan.strengths?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {plan.strengths.map((strength: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Strengths will be identified as you progress.</p>
                )}
              </div>
            </section>

            {/* Session Summary */}
            {summaryData?.clientView && (
              <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Last Session Summary
                    </h3>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {summaryData.clientView.headline || "What We Worked On"}
                    </h4>
                    {summaryData.clientView.what_we_did?.length > 0 && (
                      <ul className="space-y-2">
                        {summaryData.clientView.what_we_did.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {summaryData.clientView.next_steps?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {summaryData.clientView.next_steps.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Your plan is being prepared
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Your therapist hasn&apos;t generated a plan for you yet. Once they do,
              you&apos;ll be able to see your personalized goals, homework, and more here.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            This is an AI-assisted summary of your work with your therapist.
            It&apos;s a guide and not a substitute for professional clinical judgment.
          </p>
        </div>
      </main>
    </div>
  );
}
