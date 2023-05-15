import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { isInIFrame } from '@x/constants'
import { gnosisSafe, injected } from '@x/constants'
import { useWeb3React } from '@x/utils'

export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)

  // gnosisSafe.isSafeApp() races a timeout against postMessage, so it delays pageload if we are not in a safe app;
  // if we are not embedded in an iframe, it is not worth checking
  const [triedSafe, setTriedSafe] = useState(!isInIFrame)

  // first, try connecting to a gnosis safe
  useEffect(() => {
    if (!triedSafe) {
      if (gnosisSafe) {
        const connector = gnosisSafe

        connector.isSafeApp().then(loadedInSafe => {
          if (loadedInSafe) {
            activate(connector, undefined, true).catch(() => {
              setTriedSafe(true)
            })
          } else {
            setTriedSafe(true)
          }
        })
      } else {
        setTriedSafe(true)
      }
    }
  }, [activate, setTriedSafe, triedSafe])

  // then, if that fails, try connecting to an injected connector
  useEffect(() => {
    if (!active && !tried && triedSafe) {
      if (injected) {
        const connector = injected

        connector.isAuthorized().then(isAuthorized => {
          if (isAuthorized) {
            activate(connector, undefined, true).catch(() => {
              setTried(true)
            })
          } else {
            if (isMobile && window.ethereum) {
              activate(connector, undefined, true).catch(() => {
                setTried(true)
              })
            } else {
              setTried(true)
            }
          }
        })
      } else {
        setTried(true)
      }
    }
  }, [activate, active, triedSafe, tried])

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}
