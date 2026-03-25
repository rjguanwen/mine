export function useApi() {
  async function apiFetch<T>(url: string, options: Record<string, unknown> = {}): Promise<T> {
    return $fetch<T>(url, {
      ...options,
      onResponseError({ response }) {
        if (response.status === 401) {
          navigateTo('/login')
        }
      },
    })
  }

  return { apiFetch }
}
