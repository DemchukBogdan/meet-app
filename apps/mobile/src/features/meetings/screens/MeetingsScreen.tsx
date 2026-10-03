import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  setPage,
  setStatus,
  useListMeetingsQuery,
  useMeetDispatch,
  useMeetSelector,
} from '@meet/api';
import { meetingFilterKey } from '@meet/i18n';
import {
  MEETINGS_PAGE_SIZE,
  filterToStatus,
  meetingFilters,
} from '@meet/schemas';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { MeetingCard } from '../components/MeetingCard';
import { meetingsPalette } from '../styles/variant-styles';

type MeetingsScreenProps = {
  onCreate: () => void;
  onOpen: (meetingId: string) => void;
};

export function MeetingsScreen({ onCreate, onOpen }: MeetingsScreenProps) {
  const { i18n, t } = useTranslation();
  const dispatch = useMeetDispatch();
  const filters = useMeetSelector((state) => state.meetingsFilters);
  const query = useListMeetingsQuery({
    page: filters.page,
    per_page: MEETINGS_PAGE_SIZE,
    ...(filters.status ? { status: filters.status } : {}),
  });
  const total = query.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / MEETINGS_PAGE_SIZE));
  const activeFilter = filters.status ?? 'all';

  useEffect(() => {
    // The active filter can shrink the list below the page that was open.
    if (query.data && filters.page > pages) {
      dispatch(setPage(pages));
    }
  }, [dispatch, filters.page, pages, query.data]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('meetings.title')}</Text>
        <Pressable
          onPress={() => {
            void i18n.changeLanguage(
              i18n.resolvedLanguage === 'en' ? 'uk' : 'en',
            );
          }}
        >
          <Text style={styles.filterActive}>
            {t(i18n.resolvedLanguage === 'en' ? 'language.uk' : 'language.en')}
          </Text>
        </Pressable>
      </View>
      <View style={styles.filters}>
        {meetingFilters.map((filter) => (
          <Pressable
            key={filter}
            style={styles.filter}
            onPress={() => {
              dispatch(setStatus(filterToStatus(filter)));
            }}
          >
            <Text
              style={
                activeFilter === filter
                  ? styles.filterActive
                  : styles.filterLabel
              }
            >
              {t(meetingFilterKey(filter))}
            </Text>
          </Pressable>
        ))}
      </View>
      <AppButton onPress={onCreate}>{t('meetings.create')}</AppButton>
      {query.isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator />
          <Text>{t('common.loading')}</Text>
        </View>
      ) : null}
      {query.isError ? (
        <View style={styles.state}>
          <Text>{t('common.error')}</Text>
          <AppButton
            intent="secondary"
            onPress={() => {
              void query.refetch();
            }}
          >
            {t('common.retry')}
          </AppButton>
        </View>
      ) : null}
      {!query.isLoading && !query.isError && !query.data?.data.length ? (
        <Text style={styles.state}>{t('common.empty')}</Text>
      ) : null}
      <FlatList
        data={query.data?.data ?? []}
        keyExtractor={(meeting) => meeting.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MeetingCard meeting={item} onPress={onOpen} />
        )}
      />
      {total > MEETINGS_PAGE_SIZE ? (
        <View style={styles.pagination}>
          <AppButton
            intent="secondary"
            size="sm"
            isDisabled={filters.page <= 1}
            onPress={() => {
              dispatch(setPage(filters.page - 1));
            }}
          >
            {t('meetings.pagination.previous')}
          </AppButton>
          <Text>
            {t('meetings.pagination.label', { page: filters.page, pages })}
          </Text>
          <AppButton
            intent="secondary"
            size="sm"
            isDisabled={filters.page >= pages}
            onPress={() => {
              dispatch(setPage(filters.page + 1));
            }}
          >
            {t('meetings.pagination.next')}
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: meetingsPalette.background,
    flex: 1,
    gap: 12,
    padding: 16,
    paddingTop: 56,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: meetingsPalette.text,
    fontSize: 28,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filter: {
    paddingVertical: 4,
  },
  filterLabel: {
    color: meetingsPalette.muted,
  },
  filterActive: {
    color: '#0f766e',
    fontWeight: '700',
  },
  state: {
    alignItems: 'flex-start',
    gap: 8,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
