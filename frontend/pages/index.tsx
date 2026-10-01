import { useEffect } from 'react';

export default function IndexRedirect() {
  useEffect(() => {
    const token = localStorage.getItem('onyx_token');
    const userId = localStorage.getItem('onyx_user_id');
    if (token && userId) {
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/login');
    }
  }, []);

  return null;
}
