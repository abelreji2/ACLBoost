export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0s";
  if (seconds === 0) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || (hours > 0 && remainingSeconds > 0)) {
    parts.push(`${minutes}m`);
  }
  
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }
  
  return parts.join(" ");
}