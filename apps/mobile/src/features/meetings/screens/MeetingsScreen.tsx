import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useMeetingsListViewModel } from '@meet/meetings';

import { AppButton } from '../components/AppButton';
import { MeetingCard } from '../components/MeetingCard';
import { meetingsPalette } from '../styles/variant-styles';

type MeetingsScreenProps = {
  onCreate: () => void;
  onOpen: (meetingId: string) => void;
};

export function MeetingsScreen({ onCreate, onOpen }: MeetingsScreenProps) {
  const viewModel = useMeetingsListViewModel();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{viewModel.title}</Text>
        <Pressable onPress={viewModel.handleToggleLanguage}>
          <Text style={styles.filterActive}>
            {viewModel.oppositeLanguageLabel}
          </Text>
        </Pressable>
      </View>
      <View style={styles.filters}>
        {viewModel.filters.map((filter) => (
          <Pressable
            key={filter.id}
            style={styles.filter}
            onPress={() => {
              viewModel.handleSelectFilter(filter.id);
            }}
          >
            <Text
              style={filter.isActive ? styles.filterActive : styles.filterLabel}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <AppButton onPress={onCreate}>{viewModel.createLabel}</AppButton>
      {viewModel.isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator />
          <Text>{viewModel.loadingLabel}</Text>
        </View>
      ) : null}
      {viewModel.isError ? (
        <View style={styles.state}>
          <Text>{viewModel.errorLabel}</Text>
          <AppButton intent="secondary" onPress={viewModel.handleRetry}>
            {viewModel.retryLabel}
          </AppButton>
        </View>
      ) : null}
      {viewModel.isEmpty ? (
        <Text style={styles.state}>{viewModel.emptyLabel}</Text>
      ) : null}
      <FlatList
        data={viewModel.meetings}
        keyExtractor={(meeting) => meeting.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MeetingCard meeting={item} onPress={onOpen} />
        )}
      />
      {viewModel.showPagination ? (
        <View style={styles.pagination}>
          <AppButton
            intent="secondary"
            size="sm"
            isDisabled={viewModel.isPreviousDisabled}
            onPress={viewModel.handlePreviousPage}
          >
            {viewModel.previousPageLabel}
          </AppButton>
          <Text>{viewModel.paginationLabel}</Text>
          <AppButton
            intent="secondary"
            size="sm"
            isDisabled={viewModel.isNextDisabled}
            onPress={viewModel.handleNextPage}
          >
            {viewModel.nextPageLabel}
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
