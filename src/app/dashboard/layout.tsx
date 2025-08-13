
import { redirect } from 'next/navigation';
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { MotivationalQuote } from "@/components/motivational-quote";
import { getSession } from '@/lib/firebase/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // We no longer redirect if the user is not logged in.
  // The pages themselves will handle online/offline state.
  // if (!session?.isLoggedIn) {
  //   redirect('/auth/login');
  // }

  return (
      <div className="bg-background min-h-screen text-foreground font-body">
        <AppHeader />
        <main className="pb-24">{children}</main>
        <BottomNav />
        <MotivationalQuote />
      </div>
  );
}

    