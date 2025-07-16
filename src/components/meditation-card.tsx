import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Play, Headphones, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg w-full",
      isRecommended && "border-primary border-2 shadow-primary/20"
    )}>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1 relative h-48 md:h-full min-h-[150px]">
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
                Recomendado para ti
              </Badge>
            )}
          </div>
          <div className="md:col-span-2 p-6 flex flex-col justify-between">
            <div>
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
              <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{description}</p>
            </div>
            <Button className="w-full sm:w-auto self-start">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
