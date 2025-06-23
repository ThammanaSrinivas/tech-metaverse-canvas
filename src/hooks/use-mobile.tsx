import * as React from "react"

const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    // Default to false to prevent layout shifts on SSR
    return false
  })

  const [isHydrated, setIsHydrated] = React.useState(false)

  const onChange = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(prev => {
        if (prev !== newIsMobile) {
          return newIsMobile
        }
        return prev
      })
    }
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    // Set hydrated state to prevent SSR/client mismatch
    setIsHydrated(true)
    
    // Set initial mobile state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [onChange])

  // Return false during SSR to prevent layout shifts
  return isHydrated ? isMobile : false
}

export default useIsMobile
