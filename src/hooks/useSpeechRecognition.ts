import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type VoiceCommand = 'next' | 'previous' | 'pause';

const COMMAND_MAP: Record<string, VoiceCommand> = {
  suivant: 'next',
  prochain: 'next',
  next: 'next',
  go: 'next',
  précédent: 'previous',
  previous: 'previous',
  retour: 'previous',
  pause: 'pause',
  stop: 'pause',
  reprendre: 'pause',
  resume: 'pause',
};

function getSpeechRecognitionClass(): (new () => SpeechRecognitionInstance) | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(onCommand: (cmd: VoiceCommand) => void) {
  const supported = getSpeechRecognitionClass() !== null;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;
  const shouldRestartRef = useRef(false);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) return;

    stop();
    setError(null);

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = false;

    const startedAt = Date.now();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result?.[0]) continue;
        const transcript = result[0].transcript.trim().toLowerCase();
        const words = transcript.split(/\s+/);
        for (const word of words) {
          const cmd = COMMAND_MAP[word];
          if (cmd) {
            setLastCommand(word);
            onCommandRef.current(cmd);
            setTimeout(() => setLastCommand(null), 1500);
            break;
          }
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;

      if (event.error === 'network' || event.error === 'service-not-available') {
        setError('Service vocal indisponible sur ce navigateur (utilisez Chrome)');
      } else if (event.error === 'not-allowed') {
        setError('Accès au micro refusé');
      } else {
        setError(`Erreur micro : ${event.error}`);
      }
      stop();
    };

    recognition.onend = () => {
      // If it died within 2s of starting without an explicit error, the service is broken
      if (shouldRestartRef.current && Date.now() - startedAt < 2000 && !error) {
        setError('Service vocal indisponible sur ce navigateur (utilisez Chrome)');
        shouldRestartRef.current = false;
        setListening(false);
        return;
      }

      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          setListening(false);
          shouldRestartRef.current = false;
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    try {
      recognition.start();
      setListening(true);
    } catch {
      shouldRestartRef.current = false;
      setError('Impossible de démarrer la reconnaissance vocale');
    }
  }, [stop, error]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
      setError(null);
    } else {
      start();
    }
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, error, lastCommand, toggle, start, stop };
}
