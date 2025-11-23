import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
    import { X, Youtube } from 'lucide-react';

    const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title }) => {
      if (!isOpen || !videoUrl) return null;

      let embedUrl = '';
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      } else {
        // Fallback or error for unsupported URL
        return (
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vidéo non supportée</DialogTitle>
                <DialogDescription>
                  Le format de l'URL de la vidéo n'est pas supporté. Veuillez utiliser un lien YouTube ou Vimeo.
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
                <Youtube className="mr-2 h-6 w-6 text-red-600" /> {title || "Vidéo Explicative"}
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-video p-4">
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title={title || "Vidéo Explicative"}
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