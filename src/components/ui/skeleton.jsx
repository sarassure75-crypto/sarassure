import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton - Composant réutilisable pour les états de chargement
 * Remplace les spinners par des placeholders élégants
 */

export const Skeleton = ({ className, ...props }) => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
};

/**
 * Skeletons prédéfinis pour les cas d'usage courants
 */

export const ImageSkeleton = ({ className }) => (
  <Skeleton className={cn('w-full h-64', className)} />
);

export const CardSkeleton = () => (
  <div className="rounded-lg border bg-card p-4 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-2">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const ExerciseSkeleton = () => (
  <div className="space-y-4">
    {/* Image principale */}
    <ImageSkeleton className="h-96" />
    {/* Instructions */}
    <div className="space-y-2">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    {/* Boutons */}
    <div className="flex gap-3">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

export const QuestionnaireSkeleton = () => (
  <div className="space-y-6">
    {/* Question */}
    <div className="space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <ImageSkeleton className="h-48" />
    </div>
    {/* Choix */}
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      ))}
    </div>
    {/* Table */}
    <TableSkeleton rows={8} cols={5} />
  </div>
);

export default Skeleton;
