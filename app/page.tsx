import Link from "next/link";
import TrackWidget from "./TrackWidget";

const STEPS = [
  {
    n: "01",
    title: "Book a pickup",
    body: "Enter pickup and delivery details and book your parcel in seconds.",
  },
  {
    n: "02",
    title: "We pick it up",
    body: "Our rider collects your parcel at the scheduled time.",
  },
  {
    n: "03",
    title: "Delivered",
    body: "Track progress live with your tracking code until it arrives.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b-2 border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
            Logi<span className="text-rust">Express</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/signup" className="font-display text-lg uppercase tracking-wide text-ink hover:text-route">
              Sign up
            </Link>
            <Link href="/login" className="btn-secondary">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-mono-track text-sm uppercase text-rust">Nationwide parcel delivery</p>
            <h1 className="font-display text-5xl font-semibold uppercase leading-[1.05] text-ink md:text-6xl">
              Your parcel,
              <br />
              our speed.
            </h1>
            <p className="mt-6 max-w-md font-body text-lg text-ink/70">
              From booking to delivery — see and control the whole journey in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary">
                Book now
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-2xl uppercase tracking-wide text-ink">Track a parcel</h2>
            <div className="route-line route-dashes mt-3 mb-6" />
            <TrackWidget />
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink/10 bg-white/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl uppercase tracking-wide text-ink">How it works</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-mono-track text-sm text-rust">{step.n}</p>
                <h3 className="mt-2 font-display text-2xl uppercase text-ink">{step.title}</h3>
                <p className="mt-2 text-ink/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-ink/10 px-6 py-8 text-center font-mono-track text-sm text-ink/50">
        LogiExpress — {new Date().getFullYear()}
      </footer>
    </main>
  );
}
