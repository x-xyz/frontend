import { Image } from '@chakra-ui/image'
import { Box, Flex, StackProps, Text } from '@chakra-ui/layout'
import { HStack } from '@chakra-ui/react'
import { ChainId } from '@x/models/dist'
import { isAddress } from 'ethers/lib/utils'
import AccountAvatar from './account/AccountAvatar'
import Address from './Address'

interface AccountCardProps {
  account: string
  chainId: ChainId
  title: string
  avatarUrl?: string
}

function AccountCard({ account, chainId, title, avatarUrl, ...props }: AccountCardProps & StackProps) {
  return (
    <HStack {...props} alignItems="stretch">
      {avatarUrl ? (
        <Image src={avatarUrl} w={10} h={10} borderRadius="50%" />
      ) : (
        <AccountAvatar account={account} w={10} h={10} />
      )}
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
        <Text fontSize="xs" color="note">
          {title}
        </Text>
      </Flex>
    </HStack>
  )
}

export default AccountCard
