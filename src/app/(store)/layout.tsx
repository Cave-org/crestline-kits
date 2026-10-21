import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MarketProvider } from "@/components/market";
import { getCountry } from "@/lib/market-server";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const country = await getCountry();
  return (
    <MarketProvider country={country}>
      <Header />
      <main>{children}</main>
      <Footer />
    </MarketProvider>
  );
}
