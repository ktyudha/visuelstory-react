# HANDOFF — dhagrafis frontend

Catatan untuk melanjutkan pekerjaan. Dibuat 2026-11-14, branch `dev`.

> Catatan: ringkasan ini disusun dari git history (commit terbaru), bukan dari sesi
> kerja sebelumnya. Bagian "Yang sedang dikerjakan / TODO" perlu dilengkapi.

## Status terakhir (dari git)

Working tree bersih. Commit terbaru:

- `9a14187` feat: adjustment pwa — `CustomerLayout`, `customer/profile`
- `3a906b2` feat: upd bottomsheet — `BottomSheet`, `CustomerLayout`, `customer/booking`, `customer/profile`, `styles/index.css`
- `c29f920` feat: breaking change — perubahan besar:
  - PWA: `public/manifest.webmanifest`, `public/sw.js`, ikon di `public/icons/`, `index.html`, `firebase.json`
  - Layout baru `src/layouts/CustomerLayout`; `DefaultLayout/Navbar` dihapus
  - Komponen baru: `BottomSheet`, `DateTimeInput`
  - Helper baru: `availability.ts`, `deadline.ts`, `safe-redirect.ts`
  - Admin customer/event: Create/Update dipadukan jadi modal (`FormModal.tsx`, `EventModal.tsx`), ada `customer/Show.tsx`
  - Dashboard admin diubah, `axios-instance` disesuaikan

## Env

Lihat `.env.example`: variabel `VITE_FIREBASE_*` dan `VITE_BASE_API_URL`
(di file contoh `VITE_BASE_API_URL` belum diberi `=`, perlu dirapikan).

## Repo terkait (working directory tambahan)

- `/Users/ktyudha/Projects/dhagrafis/backend`
- `/Users/ktyudha/Projects/dmc/peternak-api`

## Yang sedang dikerjakan / TODO

- [ ] (isi: tugas yang sedang berjalan)
- [ ] Verifikasi PWA (install prompt, service worker, ikon maskable) di perangkat nyata
- [ ] Cek tampilan BottomSheet di CustomerLayout (booking & profile)
- [ ] Rapikan `.env.example` (`VITE_BASE_API_URL=`)

## Cara melanjutkan

1. `git checkout dev && git pull`
2. `npm install` lalu salin `.env.example` ke `.env` dan isi nilainya
3. Jalankan dev server (`npm run dev`) dan cek halaman customer (booking, profile)
