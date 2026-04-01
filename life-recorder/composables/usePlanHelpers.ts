export function usePlanHelpers() {
  const priorities = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' },
  ]

  const statusColumns = [
    { status: 'not_started', label: '未开始', color: 'bg-gray-400' },
    { status: 'in_progress', label: '进行中', color: 'bg-blue-500' },
    { status: 'completed', label: '已完成', color: 'bg-green-500' },
    { status: 'abandoned', label: '已放弃', color: 'bg-red-400' },
  ]

  const statusOptions = [
    { value: 'not_started', label: '未开始' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'abandoned', label: '已放弃' },
  ]

  function priorityBadge(p: string): string {
    const map: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600', urgent: 'bg-red-100 text-red-600',
    }
    return map[p] || 'bg-gray-100 text-gray-600'
  }

  function priorityLabel(p: string): string {
    return priorities.find(x => x.value === p)?.label || p
  }

  function statusLabel(s: string): string {
    return statusColumns.find(x => x.status === s)?.label || s
  }

  function statusColor(s: string): string {
    return statusColumns.find(x => x.status === s)?.color || 'bg-gray-400'
  }

  return { priorities, statusColumns, statusOptions, priorityBadge, priorityLabel, statusLabel, statusColor }
}
