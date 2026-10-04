import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Wrench, MapPin, DollarSign, Send, Check, Sparkles, Navigation } from 'lucide-react-native';
import { api } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { VoicePlayer } from '../../components/VoicePlayer';
import { JobCategory } from '../../types/index';

export default function CreateJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    audioUrl?: string;
    transcript?: string;
    category?: JobCategory;
    workerId?: string;
  }>();

  const { currentLocation } = useLocation();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>(params.transcript || '');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>(params.category || 'PLUMBING');
  const [budget, setBudget] = useState<string>('500');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const categories: JobCategory[] = [
    'PLUMBING',
    'ELECTRICAL',
    'CARPENTRY',
    'PAINTING',
    'CLEANING',
    'MECHANIC',
    'CONSTRUCTION',
    'MOVING',
    'GARDENING',
    'OTHER'
  ];

  const handleSubmit = async () => {
    if (!description.trim() && !params.audioUrl) {
      Alert.alert('ስህተት', 'እባክዎ የስራውን ዝርዝር ያስገቡ');
      return;
    }

    setSubmitting(true);
    try {
      const createdJob = await api.createJob({
        category: selectedCategory,
        title: title.trim() || `${selectedCategory} Service Request`,
        audioDescriptionUrl: params.audioUrl,
        textDescription: description.trim(),
        offeredPriceEtb: budget ? parseFloat(budget) : undefined,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        workerId: params.workerId
      });

      Alert.alert('ተሳክቷል!', 'የስራ ጥያቄዎ በተሳካ ሁኔታ ተልኳል!', [
        {
          text: 'ይመልከቱ (View Job)',
          onPress: () => router.replace(`/job/${createdJob.id}`)
        }
      ]);
    } catch (err: any) {
      Alert.alert('ስህተት', err.message || t('something_went_wrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View style={styles.headerTitleBox}>
          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            የስራ ጥያቄዎን ያረጋግጡ
          </Text>
          <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
            ዝርዝሩን ይሙሉ እና በአቅራቢያዎ ያሉ ባለሙያዎችን በፍጥነት ያግኙ
          </Text>
        </View>

        {/* Voice Audio Preview if recorded */}
        {params.audioUrl && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={16} color={colors.accent} />
              <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
                የተቀረጸው የድምጽ መልዕክት (Voice Note)
              </Text>
            </View>
            <VoicePlayer audioUrl={params.audioUrl} title="የስራ መጠይቅ ድምጽ" />
          </View>
        )}

        {/* Category Confirmation Pills */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
            {t('category')} (የስራው ዘርፍ)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isDark
                        ? colors.surfaceSubtle
                        : '#F1F5F9',
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.catText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '800' : '600'
                      }
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Job Details Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
            የስራው ዝርዝር መረጃ (Job Details)
          </Text>

          {/* Job Title Input */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>የስራ ርዕስ (Job Title)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                borderColor: colors.border,
                color: colors.textPrimary
              }
            ]}
            placeholder="ለምሳሌ፡ የወጥ ቤት ቧንቧ ጥገና"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Text Description / Transcript */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
            ዝርዝር መግለጫ (Description)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                borderColor: colors.border,
                color: colors.textPrimary
              }
            ]}
            placeholder="ችግሩን ወይም የሚፈልጉትን ስራ በዝርዝር ይጻፉ..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Budget Input Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
            የተገመተ ዋጋ (Estimated Budget)
          </Text>

          <View
            style={[
              styles.budgetRow,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                borderColor: colors.border
              }
            ]}
          >
            <View
              style={[
                styles.currencyPill,
                { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#CCFBF1' }
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.primary }]}>ETB (ብር)</Text>
            </View>
            <TextInput
              style={[styles.budgetInput, { color: colors.textPrimary }]}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={colors.textMuted}
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          {/* Quick Amount Suggestion Chips */}
          <View style={styles.quickBudgetRow}>
            {['300', '500', '800', '1200'].map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => setBudget(amt)}
                style={[
                  styles.quickAmtPill,
                  {
                    backgroundColor: budget === amt ? colors.primary : isDark ? colors.surfaceSubtle : '#F1F5F9',
                    borderColor: budget === amt ? colors.primary : colors.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.quickAmtText,
                    {
                      color: budget === amt ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: budget === amt ? '800' : '600'
                    }
                  ]}
                >
                  {amt} ETB
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Info Banner Card */}
        <View
          style={[
            styles.locationBanner,
            {
              backgroundColor: isDark ? '#142834' : '#F0FDFA',
              borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#CCFBF1'
            }
          ]}
        >
          <MapPin size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.locationBannerTitle, { color: colors.textPrimary }]}>
              የስራው ቦታ (Location)
            </Text>
            <Text style={[styles.locationBannerSub, { color: colors.textSecondary }]}>
              {currentLocation.district || 'Addis Ababa'} ({currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)})
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title={params.workerId ? 'ለባለሙያው ጥሪ ላክ' : 'የስራ ጥያቄውን ላክ'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          style={{ marginTop: 20 }}
          icon={<Send size={18} color="#FFFFFF" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    padding: 18,
    paddingBottom: 40
  },
  headerTitleBox: {
    marginBottom: 16
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  mainSubtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500'
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10
  },
  catScroll: {
    gap: 8,
    paddingVertical: 2
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1
  },
  catText: {
    fontSize: 12
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top'
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: '800'
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '800'
  },
  quickBudgetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  quickAmtPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickAmtText: {
    fontSize: 12
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 2
  },
  locationBannerTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  locationBannerSub: {
    fontSize: 12,
    marginTop: 2
  }
});
