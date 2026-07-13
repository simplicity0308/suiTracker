import { NavTabs } from "@/components/layout/NavTabs";
import { SignOutButton } from "@/components/layout/SignOutButton";

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <NavTabs />
        <SignOutButton />
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
