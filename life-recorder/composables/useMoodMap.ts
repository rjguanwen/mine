export function useMoodMap() {
  const moodMap: Record<string, string> = {
    happy: '😊', excited: '🤩', grateful: '🙏', neutral: '😐',
    tired: '😴', anxious: '😰', sad: '😢', angry: '😤',
  }

  const moodLabel: Record<string, string> = {
    happy: '开心', excited: '兴奋', grateful: '感恩', neutral: '平静',
    tired: '疲惫', anxious: '焦虑', sad: '难过', angry: '生气',
  }

  function moodEmoji(mood: string): string {
    return moodMap[mood] || mood
  }

  function moodText(mood: string): string {
    return moodLabel[mood] || mood
  }

  return { moodMap, moodEmoji, moodText }
}
