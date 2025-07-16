"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Play, Headphones, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    recommended: "Recomendado para ti",
    startSession: "Iniciar Sesión"
  },
  en: {
    recommended: "Recommended for you",
    startSession: "Start Session"
  }
}

interface MeditationCardProps {
  title: string;
  description: string;
  lengthMinutes: number;
  type: string;
  imageUrl: string;
  imageHint: string;
  isRecommended?: boolean;
}

export function MeditationCard({ title, description, lengthMinutes, type, imageUrl, imageHint, isRecommended = false }: MeditationCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg w-full h-full flex flex-col",
      isRecommended && "border-primary border-2 shadow-primary/20"
    )}>
      <div className="relative w-full h-40">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          data-ai-hint={imageHint}
        />
        {isRecommended && (
          <Badge variant="default" className="absolute top-2 left-2 bg-primary text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            {t.recommended}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Headphones className="h-4 w-4" />
              <span>{type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lengthMinutes} min</span>
            </div>
          </div>
          <h3 className="text-lg font-bold font-headline mb-2 leading-tight">{title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
        </div>
        <Button className="w-full mt-auto">
          <Play className="h-4 w-4 mr-2" />
          {t.startSession}
        </Button>
      </CardContent>
    </Card>
  );
}
