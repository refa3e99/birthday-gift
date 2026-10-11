export type Memory = {
  id: string;
  url: string;
  caption: string;
  date?: string;
};

export const memories: Memory[] = [
  {
    id: 'memory-1',
    url: '/pic1.jpeg', // cute hearts
    caption: 'Just us, a little love, and a McDonald\'s run ✨',
    date: 'A beautiful day',
  },
  {
    id: 'memory-2',
    url: '/pic2.jpeg', // cute cat
    caption: 'Every moment with you is like a warm, cozy hug. 🐾',
    date: 'Cozy times',
  },
  {
    id: 'memory-3',
    url: '/pic3.jpeg', // cute flowers
    caption: 'Just two goofy hearts, perfectly in sync. 🌸',
    date: 'Blooming love',
  },
];
