import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { X, Youtube } from 'lucide-react';

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title }) => {
  if (!isOpen || !videoUrl) return null;

  // More robust parsing for YouTube and Vimeo URLs
  const parseYouTubeId = (url) => {
    // Matches various YouTube URL formats and extracts the 11-char id
    // Includes: watch?v=, embed/, v/, shorts/, youtu.be/
    const ytRegex =
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const m = url.match(ytRegex);
    if (m && m[1]) return m[1];
    // try query param fallback
    try {
      const u = new URL(url);
      return u.searchParams.get('v');
    } catch (e) {
      return null;
    }
  };

  const parseVimeoId = (url) => {
    // Matches vimeo.com/{id} or player.vimeo.com/video/{id}
    const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?)([0-9]+)/;
    const m = url.match(vimeoRegex);
    return m ? m[1] : null;
  };

  let embedUrl = '';
  const ytId = parseYouTubeId(videoUrl || '');
  const vimeoId = parseVimeoId(videoUrl || '');

  if (ytId) {
    embedUrl = `https://www.youtube.com/embed/${ytId}`;
  } else if (vimeoId) {
    embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
  } else if ((videoUrl || '').includes('/embed/')) {
    // Already an embed URL
    embedUrl = videoUrl;
  } else {
    // Unsupported
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vidéo non supportée</DialogTitle>
            <DialogDescription>
              Le format de l'URL de la vidéo n'est pas supporté. Veuillez utiliser un lien YouTube
              ou Vimeo.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center">
            <Youtube className="mr-2 h-6 w-6 text-red-600" /> {title || 'Vidéo Explicative'}
          </DialogTitle>
          <DialogDescription>
            Regardez cette vidéo pour mieux comprendre le sujet.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video p-4">
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title={title || 'Vidéo Explicative'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-md"
          ></iframe>
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sr-only">
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
