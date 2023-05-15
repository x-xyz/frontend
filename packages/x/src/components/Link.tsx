import { forwardRef, ForwardedRef } from 'react'
import NextLink from 'next/link'
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/react'
import type { UrlObject } from 'url'

export interface LinkProps extends Omit<ChakraLinkProps, 'href'> {
  /**
   * next locale, only work for internal routing
   */
  locale?: string

  href?: string | UrlObject

  disabled?: boolean

  forceInternal?: boolean
}

function Link(
  { children, href: inputHref, locale, disabled, forceInternal, ...rest }: LinkProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  function renderChakraLink(href?: string, isExternal?: boolean) {
    return (
      <ChakraLink
        minW="fit-content"
        href={href}
        color={disabled ? 'inactive' : undefined}
        cursor={disabled ? 'not-allowed' : undefined}
        isExternal={!isExternal && isExternal}
        target={isExternal ? '_blank' : undefined}
        onClick={e => {
          if (href?.startsWith('#')) {
            const elem = document.getElementById(href.slice(1))
            if (elem) {
              e.preventDefault()
              elem.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }}
        {...rest}
        ref={ref}
      >
        {children}
      </ChakraLink>
    )
  }

  function renderNextLink(href: string | UrlObject) {
    return (
      <NextLink href={href} passHref locale={locale}>
        {renderChakraLink()}
      </NextLink>
    )
  }

  if (disabled) return renderChakraLink()

  if (!inputHref) return renderChakraLink(inputHref)

  if (typeof inputHref !== 'string' || forceInternal) return renderNextLink(inputHref)

  if (/^https?:\/\/|^mailto:/.test(inputHref)) return renderChakraLink(inputHref, true)

  // to prevent unexpected behavior if `isExternal` set explicitly.
  if (rest.isExternal) return renderChakraLink(ensureProtocolExisted(inputHref), true)

  if (inputHref.startsWith('#')) return renderChakraLink(inputHref)

  return renderNextLink(inputHref)
}

export default forwardRef(Link)

function ensureProtocolExisted(url: string) {
  if (/^https?:\/\//.test(url)) return url
  return `https://${url}`
}
