import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { ChainId } from '@x/models'
import { useOnChainListing } from '@x/hooks'
import useToast from 'hooks/useToast'
import { useEffect, useMemo } from 'react'
import { handleError } from '@x/web3'
import { SkeletonText } from '@chakra-ui/skeleton'
import { StackProps, Text } from '@chakra-ui/layout'
import { findToken } from '@x/constants'
import { formatUnits } from '@ethersproject/units'
import Address from 'components/Address'
import { Alert, AlertIcon, AlertDescription } from '@chakra-ui/alert'
import { useQuery } from 'react-query'
import { fetchTokenV2 } from '@x/apis/fn'
import { compareAddress } from '@x/utils/dist'

export interface OnChainListingProps extends StackProps {
  chainId: ChainId
  contract: string
  tokenId: string
  owner: string
  prefixLabel?: React.ReactNode
}

export default function OnChainListing({
  chainId,
  contract,
  tokenId,
  owner,
  prefixLabel,
  ...props
}: OnChainListingProps) {
  // const [listing, isLoading, error] = useOnChainListing(chainId, contract, tokenId, owner)
  const { data, isLoading, error } = useQuery(['token', chainId, contract, tokenId], fetchTokenV2)

  const listing = useMemo(() => data?.listings.find(l => compareAddress(l.signer, owner)), [data, owner])

  const toast = useToast({ title: 'Listing' })

  const { locale } = useRouter()

  useEffect(() => {
    if (error) handleError(error, { toast })
  }, [toast, error])

  function render() {
    if (!listing)
      return (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>
            {prefixLabel}
            No active listing on
            <Address as="span" type="account" ml={1} selfSynonym="the current account" color="currentcolor">
              {owner}
            </Address>
            .
          </AlertDescription>
        </Alert>
      )

    const token = findToken(listing.currency, chainId)

    const price = parseFloat(formatUnits(listing.price, token?.decimals)).toLocaleString(locale)

    const startTime = DateTime.fromISO(listing.startTime)

    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          <Text>
            {prefixLabel}
            There is an active listing for this NFT on
            <Address as="span" type="account" ml={1} selfSynonym="the current account" color="currentcolor">
              {owner}
            </Address>
          </Text>
          <Text>
            Active buy-it now listing: {price} {token?.symbol || 'Unknown Token'}
          </Text>
          <Text>Created At: {startTime.toLocaleString({ dateStyle: 'medium', timeStyle: 'medium' }, { locale })}</Text>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <SkeletonText {...props} isLoaded={!isLoading} pt={2}>
      {render()}
    </SkeletonText>
  )
}
