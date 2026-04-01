export function useMilestoneHelpers() {
  const categories = [
    { value: 'education', label: '教育' },
    { value: 'career', label: '事业' },
    { value: 'relationship', label: '情感' },
    { value: 'travel', label: '旅行' },
    { value: 'achievement', label: '成就' },
    { value: 'health', label: '健康' },
    { value: 'family', label: '家庭' },
    { value: 'other', label: '其他' },
  ]

  function categoryColor(cat: string): string {
    const map: Record<string, string> = {
      education: 'bg-blue-500', career: 'bg-green-500', relationship: 'bg-pink-500',
      travel: 'bg-cyan-500', achievement: 'bg-amber-500', health: 'bg-red-500',
      family: 'bg-purple-500', other: 'bg-gray-500',
    }
    return map[cat] || 'bg-gray-500'
  }

  function categoryBadge(cat: string): string {
    const map: Record<string, string> = {
      education: 'bg-blue-100 text-blue-700', career: 'bg-green-100 text-green-700',
      relationship: 'bg-pink-100 text-pink-700', travel: 'bg-cyan-100 text-cyan-700',
      achievement: 'bg-amber-100 text-amber-700', health: 'bg-red-100 text-red-700',
      family: 'bg-purple-100 text-purple-700', other: 'bg-gray-100 text-gray-700',
    }
    return map[cat] || 'bg-gray-100 text-gray-700'
  }

  function categoryLabel(cat: string): string {
    return categories.find(c => c.value === cat)?.label || cat
  }

  return { categories, categoryColor, categoryBadge, categoryLabel }
}
