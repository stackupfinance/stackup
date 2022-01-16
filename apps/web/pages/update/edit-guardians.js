import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast, Button } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  useSearchStore,
  searchUpdateEditGuardiansPageSelector,
  useAccountStore,
  accountUpdateEditGuardiansPageSelector,
  useUpdateStore,
  updateUpdateEditGuardiansPageSelector,
} from '../../src/state';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  SetupGuardians,
  SearchModal,
  List,
  UserCard,
} from '../../src/components';
import { App, Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function UpdateEditGuardians() {
  const router = useRouter();
  const toast = useToast();
  const {
    loading: accountLoading,
    enabled,
    user,
    wallet,
    accessToken,
  } = useAccountStore(accountUpdateEditGuardiansPageSelector);
  const {
    loading: searchLoading,
    searchData,
    searchByUsername,
    fetchNextPage,
    hasMore,
    clearSearchData,
  } = useSearchStore(searchUpdateEditGuardiansPageSelector);
  const {
    loading: updateLoading,
    guardianMap: savedGuardianMap,
    currentGuardians,
    getWalletGuardians,
    setGuardian,
    removeGuardian,
  } = useUpdateStore(updateUpdateEditGuardiansPageSelector);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [guardianMap, setGuardianMap] = useState({});

  useEffect(() => {
    router.prefetch(Routes.UPDATE_ADD_EMAIL);
    router.prefetch(Routes.UPDATE_CONFIRM_GUARDIANS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!savedGuardianMap) return;

    setGuardianMap(savedGuardianMap);
  }, [savedGuardianMap]);

  useEffect(() => {
    if (!enabled) return;

    getWalletGuardians(wallet, { userId: user.id, accessToken: accessToken.token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onDefaultGuardian = () => {
    if (guardianMap.defaultGuardian) {
      removeGuardian('defaultGuardian');
    } else {
      setGuardian('defaultGuardian', App.web3.paymaster);
    }
  };

  const renderUserGuardians = () => {
    const { defaultGuardian: _, ...userGuardians } = guardianMap;

    return Object.entries(userGuardians).map(([username], i) => (
      <Button
        key={`guardians-list-item-${i}`}
        isFullWidth
        isDisabled={accountLoading || updateLoading}
        variant="solid"
        colorScheme="gray"
        onClick={() => removeGuardian(username)}
        leftIcon={<CheckIcon />}
      >
        {username}
      </Button>
    ));
  };

  const onAddGuardian = () => {
    setShowSearch(true);
  };

  const onSearch = (query) => {
    if (!enabled) return;

    setSearchQuery(query);
    searchByUsername(query, { userId: user.id, accessToken: accessToken.token });
  };

  const onSearchClear = () => {
    clearSearchData();
  };

  const onSearchClose = () => {
    setShowSearch(false);
    clearSearchData();
  };

  const searchResultsNextHandler = async () => {
    fetchNextPage(searchQuery, { userId: user.id, accessToken: accessToken.token });
  };

  const renderSearchResults = (results) => {
    return results.map((result, i) => {
      return (
        <UserCard
          avatarSize="sm"
          key={`search-result-list-item-${i}`}
          isFirst={i === 0}
          isLast={i === results.length - 1}
          username={result.username}
          onClick={() => setGuardian(result.username, result.wallet.walletAddress)}
        />
      );
    });
  };

  const onNext = () => {
    const newGuardians = Object.values(guardianMap);
    const isAddingDefaultGuardian =
      !currentGuardians.includes(App.web3.paymaster) && newGuardians.includes(App.web3.paymaster);
    const diff = (
      currentGuardians.length > newGuardians.length
        ? [currentGuardians, newGuardians]
        : [newGuardians, currentGuardians]
    ).reduce((a, b) => a.filter((value) => !b.includes(value)));

    if (diff.length === 0) {
      toast({
        title: 'Guardians unchanged.',
        status: 'info',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    logEvent(EVENTS.UPDATE_GUARDIANS_CHANGED);
    if (isAddingDefaultGuardian) {
      router.push(Routes.UPDATE_ADD_EMAIL);
    } else {
      router.push(Routes.UPDATE_CONFIRM_GUARDIANS);
    }
  };

  return (
    <>
      <Head title="Stackup | Account" />

      <PageContainer>
        <NavigationHeader title="Edit guardians" backLinkUrl={Routes.HOME} />

        <AppContainer>
          <SetupGuardians
            isUpdateFlow
            isLoading={accountLoading || updateLoading}
            isDefaultGuardianSelected={guardianMap.defaultGuardian}
            additionalGuardians={renderUserGuardians()}
            onDefaultGuardian={onDefaultGuardian}
            onAddGuardian={onAddGuardian}
            onNext={onNext}
          />

          <SearchModal
            bodyRef="search-modal-body"
            isOpen={showSearch}
            isLoading={searchLoading}
            onSearch={onSearch}
            onClear={onSearchClear}
            onClose={onSearchClose}
          >
            {searchData && (
              <List
                scrollableTarget="search-modal-body"
                items={renderSearchResults(searchData.results)}
                hasMore={hasMore()}
                next={searchResultsNextHandler}
                emptyHeading="No results! Try a different username 🔎"
              />
            )}
          </SearchModal>
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default UpdateEditGuardians;
