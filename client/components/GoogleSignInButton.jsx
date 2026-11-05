"use client";

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthContext } from '../src/context/AuthContext';

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';

export default function GoogleSignInButton() {
  const buttonRef = useRef(null);
  const router = useRouter();
  const { googleLogin } = useContext(AuthContext);
  const [scriptReady, setScriptReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;
    let active = true;
    const renderButton = () => {
      if (!active || !buttonRef.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            toast.error('Google did not return an ID token');
            return;
          }
          try {
            await googleLogin(credential);
            router.push('/');
          } catch {
            return;
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(buttonRef.current.clientWidth, 400),
      });
      setScriptReady(true);
    };

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);
    if (window.google?.accounts?.id) {
      renderButton();
    } else if (existingScript) {
      existingScript.addEventListener('load', renderButton);
    } else {
      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      script.onerror = () => toast.error('Google sign-in could not be loaded');
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      existingScript?.removeEventListener('load', renderButton);
    };
  }, [clientId, googleLogin, router]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-gray-500">
        Google sign-in is unavailable until Google OAuth is configured.
      </p>
    );
  }

  return (
    <div className="w-full min-h-10 flex justify-center">
      {!scriptReady && <span className="loading loading-spinner loading-sm text-primary" aria-label="Loading Google sign-in" />}
      <div ref={buttonRef} className={scriptReady ? '' : 'sr-only'} />
    </div>
  );
}
