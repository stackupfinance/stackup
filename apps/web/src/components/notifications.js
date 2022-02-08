import {
  HStack,
  IconButton,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Spacer,
} from '@chakra-ui/react';
import { BellIcon, UnlockIcon, CloseIcon } from '@chakra-ui/icons';

export const Notifications = ({
  isLoading,
  items = [],
  onItemClick = () => {},
  onDeleteItem = () => {},
}) => {
  const onItemHandler = (item) => (_ev) => {
    onItemClick(item);
  };

  const onDeleteHandler = (item) => (ev) => {
    ev.stopPropagation();
    onDeleteItem(item);
  };

  const renderItems = () => {
    return items.map((item, i) => (
      <MenuItem
        as="div"
        key={`notifications-menu-item-${i}`}
        minH="48px"
        maxW={['xs', 'sm']}
        onClick={onItemHandler(item)}
        icon={<IconButton size="xs" icon={<CloseIcon onClick={onDeleteHandler(item)} />} />}
      >
        <HStack>
          <Text fontWeight={500}>{item.preview}</Text>

          <Spacer />

          <UnlockIcon />
        </HStack>
      </MenuItem>
    ));
  };

  const renderEmpty = () => {
    return (
      <Skeleton isLoaded={!isLoading}>
        <MenuItem minH="48px">
          <Text>{`You're all caught up!`}</Text>
          <Text ml="8px">📭</Text>
        </MenuItem>
      </Skeleton>
    );
  };

  return (
    <Menu id="notifications-menu" isLazy autoSelect={false} closeOnSelect={false}>
      <MenuButton
        as={IconButton}
        isLoading={isLoading}
        icon={
          <>
            <BellIcon />
            {items.length ? (
              <Badge
                colorScheme="blue"
                borderRadius="lg"
                position="absolute"
                bottom="-2px"
                right="-2px"
              >
                {items.length}
              </Badge>
            ) : undefined}
          </>
        }
      />

      <MenuList>{!items.length ? renderEmpty() : renderItems()}</MenuList>
    </Menu>
  );
};
