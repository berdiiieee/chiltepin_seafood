import { useEffect } from 'react';

export function usePreloadImages(urls) {
  useEffect(() => {
    urls.forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [urls]);
}
