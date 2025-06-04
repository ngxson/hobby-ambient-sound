import { useEffect, useMemo, useRef, useState } from 'react';
import suncalc from 'suncalc';
import { CONFIG, soundNameToFile, type SoundItem, type TimeEvent } from './config';

interface TimeStep {
  type: TimeEvent;
  time: number;
}

interface TimePos {
  prev: TimeEvent;
  next: TimeEvent;
}

function App() {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const timeEvent = useMemo(() => getTimeSteps(currentTime), [currentTime]);
  const timePos = useMemo(() => getTimePos(timeEvent, currentTime), [timeEvent, currentTime]);
  const soundItems = useMemo(() => getSoundItems(timePos), [timePos]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>Ambient sound</h1>

      <p>
        Current time: {formatTime(currentTime)}<br/>
        Prev event: {timePos.prev}<br/>
        Next event: {timePos.next}
      </p>

      <SoundPlayer sounds={soundItems} />

      <br/><br/>
      <h2>Time steps</h2>
      {timeEvent.map((step) => (
        <div key={step.type}>
          <strong>{step.type}</strong>: {formatTime(step.time)}
        </div>
      ))}
    </>
  );
}

function getTimeSteps(time: number): TimeStep[] {
  const today = new Date(time);
  today.setHours(2, 0, 0, 0); // Normalize to night
  const times = suncalc.getTimes(today, CONFIG.position.lat, CONFIG.position.lon);
  return [
    { type: 'morning0', time: times.sunrise.getTime() },
    { type: 'morning1', time: times.sunrise.getTime() + 60 * 60 * 1000 }, // 1 hour after sunrise
    { type: 'evening', time: times.sunset.getTime() - 30 * 60 * 1000 }, // 30 minutes before sunset
    { type: 'night', time: times.sunset.getTime() + 15 * 60 * 1000 }, // 30 minutes after sunset
  ];
}

function getTimePos(steps: TimeStep[], time: number): TimePos {
  const now = time;
  
  // Find the current position in the timeline
  let prevIndex = -1;
  let nextIndex = 0;
  
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].time <= now) {
      prevIndex = i;
    } else {
      nextIndex = i;
      break;
    }
  }
  
  // Handle edge cases
  if (prevIndex === -1) {
    // Before first event of the day, use last event of previous day
    return {
      prev: steps[steps.length - 1].type,
      next: steps[0].type
    };
  }
  
  if (nextIndex === prevIndex) {
    // After last event of the day, use first event of next day
    return {
      prev: steps[prevIndex].type,
      next: steps[0].type
    };
  }
  
  return {
    prev: steps[prevIndex].type,
    next: steps[nextIndex].type
  };
}

function getSoundItems(pos: TimePos): SoundItem[] {
  const event = CONFIG.soundEvents.find(e => e.prev === pos.prev && e.next === pos.next);
  if (!event) {
    return [];
  }
  return event.items;
}

function formatTime(time: number): string {
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

///////////////////////////////////////////////////

interface SoundPlayerProps {
  sounds: SoundItem[];
}

export function SoundPlayer({ sounds }: SoundPlayerProps) {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [playingState, setPlayingState] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const currentAudios = audioRefs.current;
    const newPlayingState = new Map<string, boolean>();

    // Stop all currently playing sounds
    currentAudios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Start new sounds
    sounds.forEach((sound) => {
      let audio = currentAudios.get(sound.name);
      
      if (!audio) {
        audio = new Audio(soundNameToFile[sound.name]);
        audio.loop = true;
        currentAudios.set(sound.name, audio);
      }

      audio.volume = sound.volume;
      
      audio.play().then(() => {
        newPlayingState.set(sound.name, true);
        setPlayingState(new Map(newPlayingState));
      }).catch((error) => {
        console.error(`Failed to play ${sound.name}:`, error);
        newPlayingState.set(sound.name, false);
        setPlayingState(new Map(newPlayingState));
      });
    });

    // Clean up sounds that are no longer needed
    const activeSoundNames = new Set(sounds.map(s => s.name));
    currentAudios.forEach((audio, name) => {
      if (!activeSoundNames.has(name as any)) {
        audio.pause();
        audio.currentTime = 0;
        newPlayingState.set(name, false);
      }
    });

    setPlayingState(new Map(newPlayingState));

    // Cleanup on unmount
    return () => {
      currentAudios.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [sounds]);

  return (
    <div>
      <h2>Currently Playing</h2>
      {sounds.length === 0 ? (
        <p>No sounds playing</p>
      ) : (
        <ul>
          {sounds.map((sound) => (
            <li key={sound.name}>
              <strong>{sound.name}</strong> - Volume: {Math.round(sound.volume * 100)}%
              {playingState.get(sound.name) ? ' ▶️' : ' ⏸️'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
