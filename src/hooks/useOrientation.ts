import { useState, useEffect } from 'react';

export function useIsLandscape(): boolean {
  const [landscape, setLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
  });

  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');
    const update = () => {
      setLandscape(mql.matches && window.innerHeight < 500);
    };
    mql.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mql.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return landscape;
}
