import { Yuji_Syuku } from "next/font/google";
import { MapsProvider } from "@/components/map/MapsProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NavTabs } from "@/components/layout/NavTabs";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { InstallPrompt } from "@/components/layout/InstallPrompt";

const yujiSyuku = Yuji_Syuku({ weight: "400", subsets: ["latin"] });

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <MapsProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <InstallPrompt />
          <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 sm:gap-6 dark:border-zinc-800">
            <span
              className={`${yujiSyuku.className} hidden text-lg text-[#182349] sm:inline-block dark:text-blue-300`}
            >
              SuiTracker
            </span>
            <NavTabs />
            <div className="ml-auto">
              <SignOutButton />
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </MapsProvider>
    </QueryProvider>
  );
}
