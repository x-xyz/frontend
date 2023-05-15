import { Image } from '@chakra-ui/image'
import { Box, Flex, StackProps, Text } from '@chakra-ui/layout'
import { HStack } from '@chakra-ui/react'
import { ChainId } from '@x/models/dist'
import { isAddress } from 'ethers/lib/utils'
import Address from './Address'

interface AccountCardProps {
  account: string
  chainId: ChainId
  title: string
  avatarUrl?: string
  hideAvatar?: boolean
}

function AccountCard({ account, chainId, title, avatarUrl, hideAvatar, ...props }: AccountCardProps & StackProps) {
  return (
    <HStack {...props} alignItems="center">
      {!hideAvatar && <Image src="/assets/default_profile_avatar.svg" w={8} h={8} borderRadius="50%" />}
      <Flex flexDir="column" h="full">
        <Box>
          {isAddress(account) ? (
            <Address fontSize="sm" type="account" chainId={chainId}>
              {account}
            </Address>
          ) : (
            <Text fontWeight="bold">{account || '-'}</Text>
          )}
        </Box>
      </Flex>
    </HStack>
  )
}

export default AccountCard
