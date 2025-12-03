import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackLink?: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function Header({
  title = "Tava AI Treatment Plans",
  subtitle,
  showBackLink = false,
  backHref = "/",
  backLabel = "Back",
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBackLink && (
              <Link
                href={backHref}
                className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {backLabel}
              </Link>
            )}
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-lg font-semibold text-[var(--foreground)]">
                  {title}
                </h1>
              </Link>
              {subtitle && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link
              href="/therapist"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Therapist
            </Link>
            <Link
              href="/client/1"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Client
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

