import * as React from 'react';

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkIsMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT;
    };
    
    // Set initial value after mount
    setIsMobile(checkIsMobile());

    const onResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return isMobile;
}
