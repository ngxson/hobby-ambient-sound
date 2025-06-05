import sndBirds from './sounds/birds.mp3?url';
import sndNight from './sounds/night.mp3?url';
import sndRiver from './sounds/river.mp3?url';

export const soundNameToFile: Record<SoundName, string> = {
  birds: sndBirds,
  night: sndNight,
  river: sndRiver,
};

export type TimeEvent = 'morning0' | 'morning1' | 'evening' | 'night' | 'now';
export type SoundName = 'birds' | 'night' | 'river';
export interface SoundItem {
  name: SoundName; // without .mp3
  volume: number; // between 0 and 1
}
export interface SoundEvent {
  prev: TimeEvent;
  next: TimeEvent;
  items: SoundItem[];
}

export const CONFIG = {
  position: {
    // paris
    lat: 48.86,
    lon: 2.34,
  },
  sounds: ['birds', 'night', 'river'] as SoundName[],
  soundEvents: [
    {
      prev: 'morning0',
      next: 'morning1',
      items: [
        { name: 'river', volume: 1.0 },
      ],
    },
    {
      prev: 'morning1',
      next: 'evening',
      items: [
        { name: 'birds', volume: 0.2 },
        { name: 'river', volume: 1.0 },
      ],
    },
    {
      prev: 'evening',
      next: 'night',
      items: [
        { name: 'river', volume: 1.0 },
      ],
    },
    {
      prev: 'night',
      next: 'morning0',
      items: [
        { name: 'night', volume: 0.6 },
        { name: 'river', volume: 1.0 },
      ],
    },
  ] satisfies SoundEvent[],
};
