// here lives the basic app logic (assignSanta, isAvailable, etc)

export function assignRandomSanta(
  participants: string[],
  available: string[],
  you: string
): string | null {
  const availablePool = available.filter((p) => p != you);
  const assignedSanta =
    availablePool[Math.floor(Math.random() * availablePool.length)];
  return assignedSanta || null;
}
