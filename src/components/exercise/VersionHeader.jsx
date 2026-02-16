import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video as VideoIcon, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

const VersionHeader = ({
  versionName,
  versionNumber,
  progress,
  hasVideo,
  onVideoClick,
  onListClick,
  isMobileLayout,
}) => {
  return (
    <>
      <div
        className={cn(
          'flex justify-between items-center shrink-0',
          isMobileLayout ? 'mb-1' : 'mb-1 sm:mb-2'
        )}
      >
        <h2
          className={cn(
            'font-semibold text-secondary truncate pr-2',
            isMobileLayout ? 'text-xs' : 'text-lg sm:text-xl'
          )}
        >
          {versionName}{' '}
          <span
            className={cn(
              'text-muted-foreground',
              isMobileLayout ? 'text-2xs' : 'text-xs sm:text-sm'
            )}
          >
            ({versionNumber})
          </span>
        </h2>
        <div className="flex items-center space-x-2">
          {hasVideo && (
            <Button variant="ghost" size="icon_xs" onClick={onVideoClick} className="text-primary">
              <VideoIcon className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon_xs" onClick={onListClick} className="text-primary">
            <ListChecks className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Progress
        value={progress}
        className={cn(
          'w-full shrink-0',
          isMobileLayout ? 'mb-1.5 h-0.5' : 'mb-2 sm:mb-4 h-1.5 sm:h-2'
        )}
      />
    </>
  );
};

export default VersionHeader;
