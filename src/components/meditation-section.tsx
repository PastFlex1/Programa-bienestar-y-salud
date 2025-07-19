
"use client";

import { useLanguage } from "@/context/language-provider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MeditationCard } from "./meditation-card";

type LocalizedString = {
  es: string;
  en: string;
};

export type MeditationSession = {
  title: LocalizedString;
  description: LocalizedString;
  lengthMinutes: number;
  type: LocalizedString;
  imageUrl: string;
  imageHint: string;
};

interface MeditationSectionProps {
  title: string;
  sessions: MeditationSession[];
}

export function MeditationSection({ title, sessions }: MeditationSectionProps) {
  const { language } = useLanguage();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-headline font-bold">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {sessions.map((session, index) => (
            <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div className="p-1 h-full">
                <MeditationCard
                  title={session.title[language]}
                  description={session.description[language]}
                  lengthMinutes={session.lengthMinutes}
                  type={session.type[language]}
                  imageUrl={session.imageUrl}
                  imageHint={session.imageHint}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
