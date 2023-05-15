import { Box, Flex, Stack } from '@chakra-ui/layout'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Link,
  Text,
} from '@chakra-ui/react'
import { BigNumberish } from '@ethersproject/bignumber'
import { useLazyLoresQuery } from '@x/apis/dist'
import { ChainId, TokenLore } from '@x/models/dist'
import Markdown from 'components/Markdown'
import { DateTime } from 'luxon'
import { useEffect } from 'react'
import AccountCard from '../../AccountCard'
import Image from '../../Image'

interface HyypeAccordionProps {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
}

function HyypeAccordion({ chainId, contractAddress, tokenId }: HyypeAccordionProps) {
  const [fetchLores, { data, isLoading, isSuccess }] = useLazyLoresQuery()

  useEffect(() => {
    fetchLores({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
  }, [chainId, contractAddress, fetchLores, tokenId])

  function renderLore(lore: TokenLore, idx: number) {
    const {
      previewText,
      previewImageUrl,
      author: { displayName, profilePhotoUrl, verifiedProfileImage },
      createdAt,
      _id,
    } = lore

    const relativeTime = DateTime.fromSeconds(Number(createdAt)).toRelative() || ''
    const getProfilePhoto = () => {
      if (typeof verifiedProfileImage === 'string') {
        return profilePhotoUrl
      } else {
        return verifiedProfileImage.imageUrl
      }
    }

    return (
      <Stack
        key={idx}
        backgroundColor="panel"
        border="1px solid"
        borderColor="divider"
        mt={idx && 5}
        px={2}
        py={3}
        spacing={5}
      >
        <AccountCard account={displayName} chainId={chainId} title={relativeTime} avatarUrl={getProfilePhoto()} />
        {previewImageUrl !== 'none' && (
          <Flex maxH="200px" maxW="full" overflow="hidden" justifyContent="center">
            <Image src={previewImageUrl} boxSize="150px" />
          </Flex>
        )}
        <Text as={Markdown}>{previewText}</Text>
        <Button variant="link" color="primary" fontSize="sm" justifyContent="flex-start" width="fit-content">
          <Link href={`https://hyy.pe/lore/${_id}`} isExternal>
            Read More
          </Link>
        </Button>
      </Stack>
    )
  }

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Hyy.pe Lore
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Box maxH="330px" overflowY="scroll">
            {isSuccess && (data && data.length > 0 ? data.map(renderLore) : <Text>No Lore has been added yet.</Text>)}
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default HyypeAccordion
