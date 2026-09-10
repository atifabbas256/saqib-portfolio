import Header from "@/components/Header";
import { SoundProvider } from "@/components/SoundProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider>
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <Header />
        {children}
      </div>
    </SoundProvider>
  );
}
