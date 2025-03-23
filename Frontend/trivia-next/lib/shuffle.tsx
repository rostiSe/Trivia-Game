// Shuffle Array with Fisher-Yates Algorithm

export default function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap
      [array[i], array[j]] = [array[j], array[i]];
    }
  }