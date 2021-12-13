import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMap } from 'react-use';
import { Button, useToast } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  useSearchStore,
  searchOnboardRecoveryPageSelector,
  useAccountStore,
  accountOnboardRecoveryPageSelector,
} from '../../src/state';
import {
  Head,
  PageContainer,
  OnboardHeader,
  AppContainer,
  SetupGuardians,
  SearchModal,
  List,
  UserCard,
} from '../../src/components';
import { Routes } from '../../src/config';
import { App } from '../../src/config';

function OnboardRecovery() {
  const router = useRouter();
  const toast = useToast();
  const { enabled, user, wallet, accessToken } = useAccountStore(
    accountOnboardRecoveryPageSelector,
  );
  const { loading, searchData, searchByUsername, fetchNextPage, hasMore, clearSearchData } =
    useSearchStore(searchOnboardRecoveryPageSelector);
  const [showSearch, setShowSearch] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [guardianMap, { set: setGuardian, remove: removeGuardian }] = useMap({
    defaultGuardian: App.web3.paymaster,
  });

  useEffect(() => {
    if (!enabled) return;
    if (wallet) {
      router.push(Routes.HOME);
      return;
    }

    setUsername(user.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onDefaultGuardian = () => {
    if (guardianMap.defaultGuardian) {
      removeGuardian('defaultGuardian');
    } else {
      setGuardian('defaultGuardian', App.web3.paymaster);
    }
  };

  const onAddGuardian = () => {
    setShowSearch(true);
  };

  const onNext = () => {
    if (Object.values(guardianMap).length === 0) {
      toast({
        title: 'No guardians selected.',
        description: 'Add at least one guardian before continuing.',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    console.log(Object.values(guardianMap));
  };

  const onSkip = () => {};

  const onSkipConfirm = () => {};

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

  const renderAdditionalGuardians = () => {
    const { defaultGuardian: _, ...additionalGuardians } = guardianMap;

    return Object.entries(additionalGuardians).map((guardian, i) => (
      <Button
        key={`guardians-list-item-${i}`}
        isFullWidth
        variant="solid"
        colorScheme="gray"
        onClick={() => removeGuardian(guardian[0])}
        leftIcon={<CheckIcon />}
      >
        {guardian[0]}
      </Button>
    ));
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

  return (
    <>
      <Head title="Stackup | Setup Recovery" />

      <PageContainer>
        <OnboardHeader title="Account setup" />

        <AppContainer>
          <SetupGuardians
            username={username}
            isDefaultGuardianSelected={guardianMap.defaultGuardian}
            additionalGuardians={renderAdditionalGuardians()}
            onDefaultGuardian={onDefaultGuardian}
            onAddGuardian={onAddGuardian}
            onNext={onNext}
            onSkip={onSkip}
            onSkipConfirm={onSkipConfirm}
          />
          <SearchModal
            bodyRef="search-modal-body"
            isOpen={showSearch}
            isLoading={loading}
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

export default OnboardRecovery;
