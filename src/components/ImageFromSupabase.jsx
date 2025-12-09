import React, { forwardRef } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const fetchImageUrl = async (imageId) => {
  if (!imageId) return null;

  const { data: imageData, error: imageError } = await supabase
    .from('app_images')
    .select('file_path')
    .eq('id', imageId)
    .single();

  if (imageError || !imageData) {
    console.error('Error fetching image path:', imageError);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(imageData.file_path);

  return urlData.publicUrl;
};

const ImageFromSupabase = forwardRef(({ imageId, alt, className, onLoad, style }, ref) => {
  const { data: src, isLoading, isError } = useQuery(
    ['imageUrl', imageId],
    () => fetchImageUrl(imageId),
    {
      enabled: !!imageId,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
  
  if (isLoading) {
    return (
      <div className={className + " flex items-center justify-center bg-muted/30"}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !src) {
    return (
      <div className={className + " flex items-center justify-center bg-muted/30"}>
        <span className="text-xs text-destructive">Image non disponible</span>
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      loading="lazy"
      decoding="async"
      crossOrigin="anonymous"
    />
  );
});

ImageFromSupabase.displayName = 'ImageFromSupabase';

export default ImageFromSupabase;