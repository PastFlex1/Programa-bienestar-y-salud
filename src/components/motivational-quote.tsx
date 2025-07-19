"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';
import { Sparkles } from 'lucide-react';

const translations = {
    es: {
        title: "Un Momento para Ti",
        quotes: [
            "La paz viene de dentro. No la busques fuera.",
            "La meditación es el arte de no hacer nada, y disfrutarlo.",
            "Tu mente es un jardín. Tus pensamientos son las semillas. Puedes cultivar flores o puedes cultivar malas hierbas.",
            "Cada respiración que tomamos es un nuevo comienzo.",
            "El silencio no está vacío, está lleno de respuestas.",
            "No dejes que el comportamiento de otros destruya tu paz interior.",
            "Cuida tu cuerpo. Es el único lugar que tienes para vivir."
        ]
    },
    en: {
        title: "A Moment For You",
        quotes: [
            "Peace comes from within. Do not seek it without.",
            "Meditation is the art of doing nothing, and enjoying it.",
            "Your mind is a garden. Your thoughts are the seeds. You can grow flowers or you can grow weeds.",
            "Every breath we take is a new beginning.",
            "Silence isn't empty, it's full of answers.",
            "Do not let the behavior of others destroy your inner peace.",
            "Take care of your body. It's the only place you have to live."
        ]
    }
}

export function MotivationalQuote() {
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      const t = translations[language];
      const randomIndex = Math.floor(Math.random() * t.quotes.length);
      const randomQuote = t.quotes[randomIndex];

      toast({
        title: (
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-headline">{t.title}</span>
            </div>
        ),
        description: `"${randomQuote}"`,
        duration: 10000, // 10 seconds
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [language, toast]);

  return null; // This component does not render anything itself
}
