import { useEffect, useState } from 'react'

// const { data, error, isLoading } = useAsync(() => getItem(id), [id])
// Keeps the old data while reloading so lists don't flash empty,
// and ignores results from calls that finished after a newer one started.
export function useAsync(load, dependencies) {
  const [state, setState] = useState({ data: null, error: null, isLoading: true })

  useEffect(() => {
    let isCurrent = true
    setState((previous) => ({ ...previous, error: null, isLoading: true }))

    load().then(
      (data) => {
        if (isCurrent) setState({ data, error: null, isLoading: false })
      },
      (error) => {
        if (isCurrent) setState({ data: null, error, isLoading: false })
      },
    )

    return () => {
      isCurrent = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return state
}
