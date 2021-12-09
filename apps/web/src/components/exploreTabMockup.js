import { Box, HStack, VStack, Avatar, Text, Link, Image } from '@chakra-ui/react';

const NFTTransactionMockup = ({ user, type, title, link, src }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="16px" bg="gray.50" w="100%">
      <VStack spacing="16px">
        <HStack spacing="16px" w="100%">
          <Avatar size="sm" />
          <Text>
            <Text as="span" fontWeight="bold">
              {user}
            </Text>{' '}
            <Text as="span">{type}</Text>{' '}
            <Link href={link} color="blue.500" isExternal>
              {title}
            </Link>{' '}
            on Open Sea
          </Text>
        </HStack>

        <Image alt="nft-mockup" src={src} borderRadius="lg" />
      </VStack>
    </Box>
  );
};

const PaymentTransaction = ({ to, from, amount }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="16px" bg="gray.50" w="100%">
      <HStack spacing="16px">
        <Avatar size="sm" />
        <Text>
          <Text as="span" fontWeight="bold">
            {from}
          </Text>{' '}
          sent{' '}
          <Text as="span" fontWeight="bold">
            {to}
          </Text>{' '}
          <Text as="span">{amount}</Text>
        </Text>
      </HStack>
    </Box>
  );
};

const DEFITransation = ({ user, amount, protocol, link }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="16px" bg="gray.50" w="100%">
      <HStack spacing="16px">
        <Avatar size="sm" />
        <Text>
          <Text as="span" fontWeight="bold">
            {user}
          </Text>{' '}
          deposited{' '}
          <Text as="span" fontWeight="bold">
            {amount}
          </Text>{' '}
          into{' '}
          <Link href={link} color="blue.500" isExternal>
            {protocol}
          </Link>
        </Text>
      </HStack>
    </Box>
  );
};

const SwapTransaction = ({ user, inAmount, outAmount, link, protocol }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="16px" bg="gray.50" w="100%">
      <HStack spacing="16px">
        <Avatar size="sm" />
        <Text>
          <Text as="span" fontWeight="bold">
            {user}
          </Text>{' '}
          traded{' '}
          <Text as="span" fontWeight="bold">
            {inAmount}
          </Text>{' '}
          for{' '}
          <Text as="span" fontWeight="bold">
            {outAmount}
          </Text>{' '}
          on{' '}
          <Link href={link} color="blue.500" isExternal>
            {protocol}
          </Link>
        </Text>
      </HStack>
    </Box>
  );
};

const TrendingEvent = ({ event, location, link, src }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="16px" bg="gray.50" w="100%">
      <HStack spacing="16px">
        <Avatar bg="transparent" size="sm" src={src} />
        <Text>
          <Text as="span" fontWeight="bold">
            {event}
          </Text>{' '}
          is trending in{' '}
          <Link href={link} color="blue.500" isExternal>
            {location}
          </Link>
        </Text>
      </HStack>
    </Box>
  );
};

const TweetMention = ({ user, context, twitterLink, contextLink }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p="16px" bg="gray.50" w="100%">
      <HStack spacing="16px">
        <Image alt="twitter-logo" bg="transparent" w="32px" src="./mockups/twitter-logo-blue.png" />
        <Text>
          <Link href={twitterLink} fontWeight="bold" isExternal>
            {user}
          </Link>{' '}
          mentioned{' '}
          <Link href={contextLink} color="blue.500" isExternal>
            {context}
          </Link>{' '}
          on Twitter
        </Text>
      </HStack>
    </Box>
  );
};

export const ExploreTabMockup = () => {
  return (
    <VStack spacing="16px" textAlign="left">
      <NFTTransactionMockup
        user="johnrising"
        type="bought"
        title="Genesis #392"
        link="https://opensea.io/assets/0x059edd72cd353df5106d2b9cc5ab83a52287ac3a/1000392"
        src="./mockups/genesis-392.png"
      />

      <PaymentTransaction to="jane" from="You" amount="$100 USDC" />

      <DEFITransation
        user="You"
        amount="0.05 ETH ($200)"
        protocol="Yearn"
        link="https://yearn.finance/#/home"
      />

      <NFTTransactionMockup
        user="mary"
        type="sold"
        title="Apparitions #1296"
        link="https://opensea.io/assets/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/28001296"
        src="./mockups/apparitions-1296.png"
      />

      <TrendingEvent
        event="NYC meetup"
        location="GrailersDAO Discord"
        link="https://discord.com/channels/899424740131889172/903032760506126457"
        src="./mockups/discord-logo-color.png"
      />

      <TweetMention
        user="VincentVanDough"
        context="Cool Cats NFT"
        twitterLink="https://twitter.com/Vince_Van_Dough"
        contextLink="https://opensea.io/collection/cool-cats-nft"
      />

      <SwapTransaction
        user="You"
        inAmount="275,000 WOOL"
        outAmount="$200 USDC"
        protocol="Uniswap"
        link="https://app.uniswap.org/#/swap"
      />

      <TrendingEvent
        event="$OHM"
        location="Cryptopunks Discord"
        link="https://discord.com/channels/329381334701178885/567343234687303700"
        src="./mockups/discord-logo-color.png"
      />

      <NFTTransactionMockup
        user="hazim-j"
        type="bought"
        title="Cerulean Headless Catman"
        link="https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/30032635798128992539647745608368715976274297977287784221661441221450002335256"
        src="./mockups/cerulean-headless-catman.png"
      />
    </VStack>
  );
};
