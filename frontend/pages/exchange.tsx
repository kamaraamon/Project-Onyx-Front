import { useEffect } from 'react';

export default function ExchangeRedirect() {
  useEffect(() => {
    window.location.replace('/dashboard?tab=exchange');
  }, []);
  return null;
}
