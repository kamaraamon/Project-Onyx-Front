import { useEffect } from 'react';

export default function ConciergeRedirect() {
  useEffect(() => {
    window.location.replace('/dashboard?tab=concierge');
  }, []);
  return null;
}
