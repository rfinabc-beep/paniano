import Link from "next/link";
import BookingForm from "../dashboard/BookingForm";

export default function BookPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
          Logi<span className="text-rust">Express</span>
        </Link>
        <Link href="/login" className="font-display text-sm uppercase tracking-wide text-ink/60 hover:text-route">
          Log in
        </Link>
      </div>

      <h1 className="mt-8 font-display text-3xl uppercase tracking-wide text-ink">Book a parcel</h1>
      <p className="mt-2 text-ink/60">
        No account needed. You'll get a tracking link right after booking. Want a saved history of all your
        bookings instead? <Link href="/signup" className="text-route underline">Create a free account</Link>.
      </p>

      <div className="mt-6">
        <BookingForm startOpen />
      </div>
    </main>
  );
}
