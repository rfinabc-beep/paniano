# পথ কুরিয়ার — Courier Booking Website

Next.js 14 + Supabase দিয়ে বানানো কুরিয়ার বুকিং ওয়েবসাইট।

## রোল
- **Customer** — সাইন আপ করে পার্সেল বুক করে, নিজের বুকিং লিস্ট ও ট্র্যাকিং দেখে
- **Rider** — তাকে assign করা পার্সেলের status আপডেট করে (পিকআপ → পথে → ডেলিভারি)
- **Admin** — সব বুকিং দেখে, রাইডার assign করে, status বদলায়

## ধাপ ১ — Supabase এ Database বানানো
1. Supabase Dashboard → SQL Editor → New query
2. `supabase/schema.sql` ফাইলের পুরো কন্টেন্ট paste করে **Run** চাপো
3. এতে টেবিল (`profiles`, `parcels`, `status_history`), trigger, আর RLS security পলিসি সব তৈরি হয়ে যাবে

## ধাপ ২ — Rider / Admin অ্যাকাউন্ট বানানো
নতুন signup করা সবাই ডিফল্ট **customer** হয়। কাউকে rider বা admin বানাতে:
1. সেই ব্যক্তি প্রথমে normal signup করবে (`/signup`)
2. Supabase Dashboard → Table Editor → `profiles` টেবিলে গিয়ে তার row এ `role` কলাম বদলে `rider` অথবা `admin` করে দাও

## ধাপ ৩ — Environment Variables
`.env.local` ফাইলে তোমার Supabase URL আর anon key আগে থেকেই বসানো আছে। Vercel এ deploy করলে এই মানগুলো **Project Settings → Environment Variables** এও একই নামে বসিয়ে দিও (নিরাপদ থাকার জন্য):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ধাপ ৪ — GitHub এ আপলোড
1. এই zip টা extract করো (node_modules/.next বাদ দেওয়া আছে, ওগুলো লাগবে না)
2. GitHub repo এর মেইন পেজে **Add file → Upload files**
3. পুরো ফোল্ডারের সব ফাইল/সাবফোল্ডার drag করে ছেড়ে দাও, তারপর **Commit changes**

## ধাপ ৫ — Vercel এ Deploy
1. vercel.com → New Project → এই GitHub repo সিলেক্ট করো
2. Environment Variables এ উপরের ২টা ভ্যারিয়েবল বসাও (ধাপ ৩)
3. Deploy চাপো

## লোকাল ডেভেলপমেন্ট (যদি কম্পিউটারে চালাতে চাও)
```bash
npm install
npm run dev
```
