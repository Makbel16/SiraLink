import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Construction,
  Truck,
  Flower2,
  CircleDot,
  MapPin,
  Send,
  Check,
  FileText,
  Tag,
  DollarSign,
  Info,
  ShieldCheck,
  Star,
  ChevronRight,
  UserCheck
} from 'lucide-react-native';
import { api } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { VoicePlayer } from '../../components/VoicePlayer';
import { Avatar } from '../../components/Avatar';
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

  // Optional worker preview query if a specific artisan was selected
  const { data: worker } = useQuery({
    queryKey: ['worker-preview', params.workerId],
    queryFn: () => (params.workerId ? api.getWorker(params.workerId) : null),
    enabled: !!params.workerId
  });

  const categories: { key: JobCategory; icon: any; color: string }[] = [
    { key: 'PLUMBING', icon: Wrench, color: '#2563EB' },
    { key: 'ELECTRICAL', icon: Zap, color: '#F59E0B' },
    { key: 'CARPENTRY', icon: Hammer, color: '#92400E' },
    { key: 'PAINTING', icon: Paintbrush, color: '#7C3AED' },
    { key: 'CLEANING', icon: Sparkles, color: '#2563EB' },
    { key: 'MECHANIC', icon: Car, color: '#DC2626' },
    { key: 'CONSTRUCTION', icon: Construction, color: '#EA580C' },
    { key: 'MOVING', icon: Truck, color: '#0891B2' },
    { key: 'GARDENING', icon: Flower2, color: '#16A34A' },
    { key: 'OTHER', icon: CircleDot, color: '#64748B' }
  ];

  const getCategoryName = (cat: JobCategory) => {
    switch (cat) {
      case 'PLUMBING': return t('cat_plumbing');
      case 'ELECTRICAL': return t('cat_electrical');
      case 'CARPENTRY': return t('cat_carpentry');
      case 'PAINTING': return t('cat_painting');
      case 'CLEANING': return t('cat_cleaning');
      case 'MECHANIC': return t('cat_mechanic');
      case 'CONSTRUCTION': return t('cat_construction');
      case 'MOVING': return t('cat_moving');
      case 'GARDENING': return t('cat_gardening');
      default: return t('cat_other');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() && !params.audioUrl) {
      Alert.alert(t('error'), t('description_placeholder'));
      return;
    }

    setSubmitting(true);
    try {
      const createdJob = await api.createJob({
        category: selectedCategory,
        title: title.trim() || `${getCategoryName(selectedCategory)}`,
        audioDescriptionUrl: params.audioUrl,
        textDescription: description.trim(),
        offeredPriceEtb: budget ? parseFloat(budget) : undefined,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        workerId: params.workerId
      });

      Alert.alert(t('job_posted_success'), '', [
        {
          text: t('view_job'),
          onPress: () => router.replace(`/job/${createdJob.id}`)
        }
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('something_went_wrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CARD 1: Header / Status Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <View style={styles.headerTopRow}>
            <View
              style={[
                styles.badgePill,
                { backgroundColor: colors.primaryLight }
              ]}
            >
              <Sparkles size={13} color={colors.primary} />
              <Text style={[styles.badgePillText, { color: colors.primary }]}>
                {t('confirm_request_header')}
              </Text>
            </View>

            {params.workerId ? (
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }
                ]}
              >
                <UserCheck size={12} color={colors.accent} />
                <Text style={[styles.badgePillText, { color: colors.accent }]}>
                  {t('target_worker')}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            {t('confirm_request')}
          </Text>
          <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
            {t('confirm_request_sub')}
          </Text>
        </View>

        {/* CARD 2: Target Worker Preview Card (if applicable) */}
        {worker && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.primary
              },
              colors.cardShadow
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconCircle, { backgroundColor: colors.primaryLight }]}>
                <ShieldCheck size={16} color={colors.primary} />
              </View>
              <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
                {t('target_worker')}
              </Text>
            </View>

            <View style={styles.workerPreviewRow}>
              <Avatar
                name={worker.full_name}
                imageUrl={worker.avatar_url}
                size={54}
                isVerified={true}
              />
              <View style={styles.workerPreviewInfo}>
                <Text style={[styles.workerName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {worker.full_name || t('worker')}
                </Text>
                <View style={styles.workerMetaRow}>
                  <View style={styles.starRow}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.workerRating, { color: colors.textPrimary }]}>
                      {Number(worker.rating_avg || 5.0).toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[styles.workerRate, { color: colors.primary }]}>
                    {worker.hourly_rate_etb || 400} {t('etb')}/{t('per_hour')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* CARD 3: Voice Note Attachment (if attached) */}
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
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconCircle, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }]}>
                <Sparkles size={16} color={colors.accent} />
              </View>
              <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
                {t('voice_note_attached')}
              </Text>
            </View>
            <VoicePlayer audioUrl={params.audioUrl} title={t('voice_note_title')} />
          </View>
        )}

        {/* CARD 4: Service Category Selection */}
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
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Wrench size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
              {t('category')}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
          >
            {categories.map((item) => {
              const isSelected = selectedCategory === item.key;
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(item.key)}
                  style={[
                    styles.catCardPill,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isDark
                        ? colors.surfaceSubtle
                        : '#F8FAFC',
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}
                >
                  <IconComp
                    size={16}
                    color={isSelected ? '#FFFFFF' : item.color}
                  />
                  <Text
                    style={[
                      styles.catCardText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '800' : '600'
                      }
                    ]}
                  >
                    {getCategoryName(item.key)}
                  </Text>
                  {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CARD 5: Job Request Details Form */}
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
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconCircle, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#DBEAFE' }]}>
              <FileText size={16} color="#2563EB" />
            </View>
            <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
              {t('job_details')}
            </Text>
          </View>

          {/* Job Title Input */}
          <View style={styles.formGroup}>
            <View style={styles.inputLabelRow}>
              <Tag size={13} color={colors.textSecondary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('job_title_label')}
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.textPrimary
                }
              ]}
              placeholder={t('job_title_placeholder')}
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description / Transcript Input */}
          <View style={styles.formGroup}>
            <View style={styles.inputLabelRow}>
              <FileText size={13} color={colors.textSecondary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('description_label')}
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.textPrimary
                }
              ]}
              placeholder={t('description_placeholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* CARD 6: Budget & Pricing Card */}
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
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconCircle, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5' }]}>
              <DollarSign size={16} color={colors.success} />
            </View>
            <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
              {t('estimated_budget')}
            </Text>
          </View>

          {/* Currency Input Row */}
          <View
            style={[
              styles.budgetInputContainer,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                borderColor: colors.border
              }
            ]}
          >
            <View
              style={[
                styles.currencyBadge,
                { backgroundColor: colors.primaryLight }
              ]}
            >
              <Text style={[styles.currencyBadgeText, { color: colors.primary }]}>
                {t('etb')}
              </Text>
            </View>
            <TextInput
              style={[styles.budgetInputField, { color: colors.textPrimary }]}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={colors.textMuted}
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          {/* Quick Preset Amount Buttons */}
          <View style={styles.presetAmountsRow}>
            {['300', '500', '800', '1200', '2000'].map((amt) => {
              const isSelected = budget === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  activeOpacity={0.75}
                  onPress={() => setBudget(amt)}
                  style={[
                    styles.presetPill,
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
                      styles.presetText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '800' : '600'
                      }
                    ]}
                  >
                    {amt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Negotiable Hint */}
          <View style={styles.negotiableNote}>
            <Info size={13} color={colors.textMuted} />
            <Text style={[styles.negotiableText, { color: colors.textMuted }]}>
              {t('negotiable_hint')}
            </Text>
          </View>
        </View>

        {/* CARD 7: Location Confirmation Card */}
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
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconCircle, { backgroundColor: colors.primaryLight }]}>
              <MapPin size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
              {t('service_location')}
            </Text>
          </View>

          <View style={styles.locationDetailsBox}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationDistrict, { color: colors.textPrimary }]}>
                {currentLocation.district || t('addis_ababa')}
              </Text>
              <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
                GPS: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
            </View>
            <View
              style={[
                styles.gpsBadge,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5' }
              ]}
            >
              <Check size={12} color={colors.success} strokeWidth={3} />
              <Text style={[styles.gpsBadgeText, { color: colors.success }]}>
                {t('verified')}
              </Text>
            </View>
          </View>
        </View>

        {/* CARD 8: Final Submission Action */}
        <View style={styles.actionSection}>
          <Button
            title={params.workerId ? t('request_worker') : t('create_job')}
            onPress={handleSubmit}
            loading={submitting}
            size="lg"
            icon={<Send size={18} color="#FFFFFF" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    padding: 16,
    paddingBottom: 48,
    gap: 14
  },
  headerCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4
  },
  mainSubtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500'
  },
  sectionCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  workerPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4
  },
  workerPreviewInfo: {
    flex: 1,
    gap: 3
  },
  workerName: {
    fontSize: 16,
    fontWeight: '800'
  },
  workerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  workerRating: {
    fontSize: 13,
    fontWeight: '800'
  },
  workerRate: {
    fontSize: 13,
    fontWeight: '700'
  },
  catScroll: {
    gap: 8,
    paddingVertical: 2
  },
  catCardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1
  },
  catCardText: {
    fontSize: 12
  },
  formGroup: {
    marginBottom: 12
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  textInput: {
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
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  currencyBadgeText: {
    fontSize: 13,
    fontWeight: '800'
  },
  budgetInputField: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '900'
  },
  presetAmountsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  presetPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetText: {
    fontSize: 12
  },
  negotiableNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10
  },
  negotiableText: {
    fontSize: 11,
    fontWeight: '500'
  },
  locationDetailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  locationDistrict: {
    fontSize: 15,
    fontWeight: '800'
  },
  locationCoords: {
    fontSize: 12,
    marginTop: 2
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  gpsBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  actionSection: {
    marginTop: 4
  }
});
