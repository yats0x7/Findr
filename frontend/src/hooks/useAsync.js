import { useEffect, useState } from 'react'

/*
  Runs an async service call and keeps track of its result.

    const { data, error, isLoading } = useAsync(() => getItem(id), [id])

  It runs again whenever something in the list (the second argument)
  changes. While it reloads, the previous data stays on screen, so lists
  don't flash empty every time a filter changes.

  If the page changes before an old call finishes, that old result is
  ignored, so a slow answer can never overwrite a newer one.
*/
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
    // The caller decides when to reload, through `dependencies`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return state
}
