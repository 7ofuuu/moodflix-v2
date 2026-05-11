'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Clapperboard, TrendingUp, Globe } from 'lucide-react';
import type { Action } from "@/types/components";

const ACTIONS: Action[] = [
  {
    id: "stay",
    title: "Stay in this mood",
    description: "Find movies that match your current mood perfectly",
    Icon: Smile,
    iconColor: "text-amber-400",
  },
  {
    id: "distract",
    title: "I need a distraction",
    description: "Get movies to take your mind off things",
    Icon: Clapperboard,
    iconColor: "text-violet-400",
  },
  {
    id: "improve",
    title: "I want to feel better",
    description: "Movies to lift your spirits and improve your mood",
    Icon: TrendingUp,
    iconColor: "text-emerald-400",
  },
  {
    id: "explore",
    title: "Explore something different",
    description: "Discover movies outside your usual preferences",
    Icon: Globe,
    iconColor: "text-sky-400",
  },
];

interface ActionSelectorProps {
  selectedAction: string | null;
  onActionSelect: Dispatch<SetStateAction<string | null>>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ActionSelector({ selectedAction, onActionSelect, onNext, onBack, isLoading = false }: ActionSelectorProps) {
  return (
    <div className="flex w-full flex-col items-center gap-12">
      <div className="w-full text-center">
        <h2 className="mb-2 text-4xl font-bold">Choose your movie intention</h2>
        <p className="text-muted-foreground">Tell us what this watch session should do for you</p>
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        {ACTIONS.map(action => (
          <Card
            key={action.id}
            onClick={() => onActionSelect(action.id)}
            className={`card-lift relative cursor-pointer rounded-2xl border bg-linear-to-b from-slate-900/95 via-blue-950/72 to-slate-900/90 backdrop-blur-sm transition-all duration-300 ${
              selectedAction === action.id ? "border-white/52 shadow-[0_18px_36px_rgba(0,0,0,0.42)]" : "border-white/14 hover:border-white/28"
            }`}>
            <CardHeader className="px-5 py-5 md:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/8 dark:bg-white/8 border border-white/10">
                  <action.Icon
                    className={`h-5 w-5 ${action.iconColor}`}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="line-clamp-1 wrap-break-word text-xl text-white">{action.title}</CardTitle>
                  <CardDescription className="mt-1.5 max-w-[34ch] whitespace-normal wrap-break-word pr-2 leading-relaxed text-white/68">{action.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="h-12 w-55 shrink-0 rounded-xl border-white/18 bg-white/5 px-8 text-base font-semibold text-white/85 hover:bg-white/12 hover:text-white"
          disabled={isLoading}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedAction || isLoading}
          size="lg"
          className="h-12 w-55 shrink-0 rounded-xl bg-white px-8 text-base font-semibold text-black hover:bg-white/92">
          Get Recommendations
        </Button>
      </div>
    </div>
  );
}
