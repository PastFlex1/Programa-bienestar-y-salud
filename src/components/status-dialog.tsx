
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    close: "Cerrar",
  },
  en: {
    close: "Close",
  }
};

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'success' | 'error';
  title: string;
  description: string;
  onClose: () => void;
}

export function StatusDialog({ open, onOpenChange, variant, title, description, onClose }: StatusDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const Icon = variant === 'success' ? CheckCircle2 : XCircle;
  const iconColor = variant === 'success' ? "text-primary" : "text-destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center items-center h-16 w-16 rounded-full bg-card mx-auto mb-4">
            <Icon className={`h-12 w-12 ${iconColor}`} />
          </div>
          <DialogTitle className="text-center font-headline text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full" onClick={onClose}>{t.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
