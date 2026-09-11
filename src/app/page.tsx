import { Chapters } from "@/components/home/chapters";
import { Epilogue } from "@/components/home/epilogue";
import { Hero } from "@/components/home/hero";
import { Listen } from "@/components/home/listen";
import { LiveStrip } from "@/components/home/live-strip";
import { Myth } from "@/components/home/myth";
import { StoreTeaser } from "@/components/home/store-teaser";
import { TourTeaser } from "@/components/home/tour-teaser";
import { Stats } from "@/components/home/stats";

export default function Home() {
  return (
    <>
      <Hero />
      <Chapters />
      <Myth />
      <StoreTeaser />
      <LiveStrip />
      <Listen />
      <TourTeaser />
    </>
  );
}
