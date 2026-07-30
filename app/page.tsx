import Link from "next/link";
import TrackWidget from "./TrackWidget";

const STEPS = [
  {
    n: "০১",
    title: "বুকিং করুন",
    body: "পিকআপ ও ডেলিভারি ঠিকানা দিয়ে কয়েক সেকেন্ডে পার্সেল বুক করুন।",
  },
  {
    n: "০২",
    title: "পিকআপ হবে",
    body: "আমাদের রাইডার নির্ধারিত সময়ে আপনার পার্সেল সংগ্রহ করবে।",
  },
  {
    n: "০৩",
    title: "ডেলিভারি সম্পন্ন",
    body: "রিয়েল-টাইম ট্র্যাকিং কোড দিয়ে সরাসরি অবস্থা দেখুন।",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b-2 border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
            পথ<span className="text-rust">.</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/signup" className="font-display text-lg uppercase tracking-wide text-ink hover:text-route">
              সাইন আপ
            </Link>
            <Link href="/login" className="btn-secondary">
              লগইন
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-mono-track text-sm uppercase text-rust">সারা দেশে পার্সেল ডেলিভারি</p>
            <h1 className="font-display text-5xl font-semibold uppercase leading-[1.05] text-ink md:text-6xl">
              আপনার পার্সেল,
              <br />
              আমাদের গতি।
            </h1>
            <p className="mt-6 max-w-md font-body text-lg text-ink/70">
              বুকিং থেকে ডেলিভারি — পুরো যাত্রা এক জায়গা থেকে দেখুন ও নিয়ন্ত্রণ করুন।
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary">
                এখনই বুকিং করুন
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-2xl uppercase tracking-wide text-ink">পার্সেল ট্র্যাক করুন</h2>
            <div className="route-line route-dashes mt-3 mb-6" />
            <TrackWidget />
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink/10 bg-white/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl uppercase tracking-wide text-ink">কীভাবে কাজ করে</h2>
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
        পথ কুরিয়ার — {new Date().getFullYear()}
      </footer>
    </main>
  );
}
