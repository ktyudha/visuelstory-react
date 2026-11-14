import Logo from "@/assets/logo/logo-mark.png";

export default function AuthHeader({ title, subtitle, admin }: { title: string; subtitle: string; admin?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-neutral-900 dark:bg-white">
        <img src={Logo} alt="Visuelstory" className="size-9" />
      </div>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        {admin && <span className="mt-2 inline-block rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">Admin</span>}
      </div>
    </div>
  );
}
