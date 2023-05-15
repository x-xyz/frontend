import { Avatar } from '@chakra-ui/avatar'
import { Flex } from '@chakra-ui/layout'
import { Box, Center, Container, Heading, Text, useBreakpointValue } from '@chakra-ui/react'
import Link from 'components/Link'
import TwitterIcon from 'components/icons/TwitterIcon'

const breakpoint = 'lg'

interface Member {
  img: string
  name: string
  role: string
  desc: string
  footer: string
  twitter?: string
}

const members: Member[] = [
  {
    img: '/assets/members/avatar-anthony.webp',
    name: 'Anthony',
    role: 'Back-end Developer',
    desc: 'Yet another blockchain engineer.',
    footer: 'First NFT: Happyland Gummy Bears',
    twitter: 'https://twitter.com/anthony_CYA',
  },
  {
    img: '/assets/members/avatar-bradley.webp',
    name: 'Bradley Zastrow',
    role: 'Co-founder',
    desc: 'NFT and DeFi Degen who has been in the crypto industry since 2017 after a long career in the TradFi/Payments industry.',
    footer: 'First NFT: Cryptokitties',
    twitter: 'https://twitter.com/ZastrowBradley',
  },
  {
    img: '/assets/members/avatar-charlotte.webp',
    name: 'Charlotte Lee',
    role: 'Marketing Support',
    desc: 'Enjoy contributing to the world as an ape.',
    footer: 'First NFT: BAYC',
    twitter: 'https://twitter.com/CharlotteleeW',
  },
  {
    img: '/assets/members/avatar-chin.png',
    name: 'Chuang Chin Tuan',
    role: 'Strategy & Partnership',
    desc: "Started my journey down the NFT rabbit hole while trying to find my girlfriend a crypto gift that didn't seem like I was sending her money.",
    footer: 'First NFT: Axie Infinity',
    twitter: 'https://twitter.com/0xsteamboat',
  },
  // {
  //   img: '/assets/members/avatar-ella.webp',
  //   name: 'Ella Orten',
  //   role: 'Community & Marketing',
  //   desc: 'Started in crypto. Fell in love with the concept of crypto + art, NFTS. Now I sleep and breathe the crypto + NFT space.',
  //   footer: 'First NFT: BAYC',
  //   twitter: 'https://twitter.com/ellaorten',
  // },
  {
    img: '/assets/members/avatar-jake.webp',
    name: 'J',
    role: 'Operations & Tokenomics',
    desc: 'Ape in first, DYOR later.',
    footer: 'First NFT: BAYC',
    twitter: 'https://twitter.com/JCFLJCFL',
  },
  {
    img: '/assets/members/avatar-jt.webp',
    name: 'JT Yu',
    role: 'Front-end Developer',
    desc: 'Poor in trading yet good in coding.',
    footer: 'First NFT: Degenerate Ape Academy',
    twitter: 'https://twitter.com/yujuiting',
  },
  {
    img: '/assets/members/avatar-michael.webp',
    name: 'Michael Chen',
    role: 'Back-end Developer',
    desc: 'Just a backend engineer.',
    footer: 'First NFT: Silly Old Bear',
    twitter: 'https://twitter.com/Michael78707580',
  },
  {
    img: '/assets/members/avatar-sonic.webp',
    name: 'Sonic',
    role: 'Developer',
    desc: '1 ETH is 1 ETH.',
    footer: 'First NFT: BAYC',
  },
  {
    img: '/assets/members/avatar-stanley.webp',
    name: 'Stanley Ding',
    role: 'Web3 / Front-end Developer',
    desc: 'Building things that you and I will love.',
    footer: 'First NFT: BAYC',
  },
  {
    img: '/assets/members/avatar-dino.jpeg',
    name: 'Dino',
    role: 'Program Manager',
    desc: 'Profit is Profit.',
    footer: 'First NFT: AVYC',
    twitter: 'https://twitter.com/DinoDaClown',
  },
  {
    img: '/assets/members/avatar-aaron.png',
    name: 'Aaron',
    role: 'Back-end Developer',
    desc: 'Enjoy crypto as well as coding.',
    footer: 'First NFT: Aurory',
  },
  {
    img: '/assets/members/avatar-ctt.jpeg',
    name: 'Crashtest Theory',
    role: 'UI/UX Design Team',
    desc: 'Exploring New Frontiers in the Digital Landscape.',
    footer: 'First NFT: AlphaBot Society',
  },
  {
    img: '/assets/members/avatar-gemma.png',
    name: 'Gemma Lo',
    role: 'Marketing & Communication',
    desc: 'Understand your needs better than you do. Degen in training after 7 years in corporate and marketing communications.',
    footer: 'First NFT: My blind dog',
    twitter: 'https://twitter.com/gemmadegem',
  },
].sort((a, b) => a.name.localeCompare(b.name))

export default function Team() {
  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  return (
    <Center
      bg="url(/assets/v3/homepage_team_banner_2560x2560_bg.jpg),#151515"
      bgRepeat="no-repeat"
      bgSize={{ base: 'auto 560px', [breakpoint]: 'cover' }}
      bgPos={{ base: 'top center', [breakpoint]: 'center' }}
      pt={14}
    >
      <Container maxW="container.xl">
        <Heading textAlign="center" mb={10} id="team-x">
          Team X
        </Heading>
        <Flex
          overflow="auto"
          justifyContent={{ base: 'flex-start', [breakpoint]: 'center' }}
          wrap={{ base: 'nowrap', [breakpoint]: 'wrap' }}
          maxW="1280px"
          m={-3}
        >
          {members.map((member, i) => (
            <TeamMember
              key={i}
              img={member.img}
              name={member.name}
              role={member.role}
              desc={member.desc}
              footer={member.footer}
              twitter={member.twitter}
            />
          ))}
          <TeamMember
            img="/assets/members/avatar-dfd.png"
            name="DFD"
            role="Community Moderator"
            desc="Degen since birth, I got it from my momma."
            footer="First NFT: Hashmasks"
            nowrap={!useDesktopView}
            twitter="https://twitter.com/DeepFuckingDefi"
          />
          <TeamMember
            img="/assets/members/avatar-renorch.png"
            name="Renorch"
            role="Community Moderator"
            desc="Your friendly neighbourhood degen trying to make it."
            footer="First NFT: Jungle Freaks"
            nowrap={!useDesktopView}
            twitter="https://www.twitter.com/Renorchh"
          />
          <TeamMember
            img="/assets/members/avatar-leo.webp"
            name="Leo Cheng"
            role="Advisor"
            desc="Metaverse slumlord. NFT Hoarder."
            footer="First NFT: Cryptovoxels Parcel"
            nowrap={!useDesktopView}
            twitter="https://twitter.com/leokcheng"
          />
          <TeamMember
            img="/assets/members/avatar-bigbrother.webp"
            name="MachiBigBrother"
            role="Advisor"
            desc="I’m an ape. You already know."
            footer="First NFT: BAYC"
            nowrap={!useDesktopView}
            twitter="https://twitter.com/machibigbrother"
          />
        </Flex>
      </Container>
    </Center>
  )
}

function TeamMember({
  img,
  name,
  role,
  desc,
  footer,
  twitter,
  nowrap,
}: {
  img: string
  name: string
  role: string
  desc: string
  footer: string
  twitter?: string
  nowrap?: boolean
}) {
  return (
    <Box minW={{ base: '320px', [breakpoint]: 'unset' }} w="272px" align="center" m={3} pb={5}>
      <Avatar w="160px" h="160px" src={img} mb={4}>
        {twitter && (
          <Box pos="absolute" left="50%" bottom="-20px" ml="-20px">
            <Link href={twitter}>
              <Box w={10} h={10} border="2px solid" borderColor="divider" borderRadius="20px">
                <TwitterIcon w="full" h="full" color="primary" />
              </Box>
            </Link>
          </Box>
        )}
      </Avatar>
      <Text fontFamily="A2Gothic-Bold" fontSize="2xl" fontWeight="bold" whiteSpace={nowrap ? 'nowrap' : 'normal'}>
        {name}
      </Text>
      <Text fontSize="sm" variant="emphasis" color="note" whiteSpace={nowrap ? 'nowrap' : 'normal'}>
        {role}
      </Text>
      <Text fontSize="xs" variant="emphasis" color="note">
        {footer}
      </Text>
      <Text fontSize="md" textAlign="center" lineHeight={1.25} mt={5}>
        {desc}
      </Text>
    </Box>
  )
}
