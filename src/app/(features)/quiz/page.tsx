'use client';

import { useState, useLayoutEffect } from 'react';
import { MoodSelector } from '@/components/features/quiz/MoodSelector';
import { ActionSelector } from '@/components/features/quiz/ActionSelector';
import { MovieRecommendations } from '@/components/features/quiz/MovieRecommendations';
import { useQuizRecommendations } from '@/hooks/useQuizRecommendations';

type QuizStep = 'mood' | 'action' | 'results';

export default function QuizPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<QuizStep>('mood');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { recommendations, isLoading, error, getRecommendations } = useQuizRecommendations();

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const handleMoodNext = () => {
    setStep('action');
  };

  const handleActionBack = () => {
    setStep('mood');
  };

  const handleActionNext = async () => {
    if (selectedMood && selectedAction) {
      await getRecommendations(selectedMood, selectedAction);
      setStep('results');
    }
  };

  const handleReset = () => {
    setStep('mood');
    setSelectedMood(null);
    setSelectedAction(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <section className='container py-12 md:py-20 px-7'>
        <div className='max-w-4xl mx-auto'>
          {step === 'mood' && (
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={setSelectedMood}
              onNext={handleMoodNext}
            />
          )}

          {step === 'action' && (
            <ActionSelector
              selectedAction={selectedAction}
              onActionSelect={setSelectedAction}
              onNext={handleActionNext}
              onBack={handleActionBack}
              isLoading={isLoading}
            />
          )}

          {step === 'results' && (
            <MovieRecommendations
              recommendations={recommendations}
              isLoading={isLoading}
              error={error}
              onReset={handleReset}
            />
          )}
        </div>
      </section>
    </>
  );
}
