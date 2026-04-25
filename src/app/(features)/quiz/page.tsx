'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MoodSelector } from '@/components/features/quiz/MoodSelector';
import { ActionSelector } from '@/components/features/quiz/ActionSelector';
import { MovieRecommendations } from '@/components/features/quiz/MovieRecommendations';
import { useQuizRecommendations } from '@/hooks/useQuizRecommendations';
import { isMoodKey } from '@/lib/mood';

type QuizStep = 'mood' | 'action' | 'results';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const moodParam = searchParams.get('mood');
  const initialMood = moodParam && isMoodKey(moodParam.toLowerCase()) ? moodParam.toLowerCase() : null;
  const [step, setStep] = useState<QuizStep>(initialMood ? 'action' : 'mood');
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { recommendations, isLoading, error, source, getRecommendations } = useQuizRecommendations();

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

  return (
    <>
      <section className='quiz-fullscreen-surface relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-screen w-screen px-4 py-12 md:px-7 md:py-16'>
        <div className='mx-auto w-full max-w-[1600px]'>
          <div className={`mx-auto w-full ${step === 'results' ? '' : 'max-w-5xl'}`}>
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
                error={error}
                source={source}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function QuizPageFallback() {
  return (
    <section className='quiz-fullscreen-surface relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-screen w-screen px-4 py-12 md:px-7 md:py-16'>
      <div className='mx-auto flex w-full max-w-5xl items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
      </div>
    </section>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizPageFallback />}>
      <QuizPageContent />
    </Suspense>
  );
}
