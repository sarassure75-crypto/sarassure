import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExerciseControls = ({
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  isCompleted,
  isMobileLayout,
}) => {
  return (
    <div className={cn('mt-auto shrink-0', isMobileLayout ? 'pt-1' : 'pt-2')}>
      <div
        className={cn(
          'flex justify-between items-center',
          isMobileLayout ? 'mt-1' : 'mt-3 sm:mt-6'
        )}
      >
        <Button
          onClick={onPrev}
          disabled={isPrevDisabled}
          variant="outline"
          size={isMobileLayout ? 'xs' : 'sm'}
          className={isMobileLayout ? 'text-2xs h-7 px-1.5' : 'text-xs sm:text-sm'}
          aria-label="Étape précédente"
        >
          <ChevronLeft
            className={cn('mr-0.5', isMobileLayout ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4')}
          />{' '}
          Préc.
        </Button>
        {isCompleted ? (
          <span
            className={cn(
              'text-green-600 font-semibold flex items-center',
              isMobileLayout ? 'text-xs' : 'text-xs sm:text-sm'
            )}
          >
            <CheckCircle
              className={cn('mr-1', isMobileLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5')}
            />{' '}
            Terminé !
          </span>
        ) : (
          <Button
            onClick={onNext}
            disabled={isNextDisabled}
            size={isMobileLayout ? 'xs' : 'sm'}
            className={isMobileLayout ? 'text-2xs h-7 px-1.5' : 'text-xs sm:text-sm'}
            aria-label="Étape suivante"
          >
            Suiv.{' '}
            <ChevronRight
              className={cn('ml-0.5', isMobileLayout ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4')}
            />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseControls;
