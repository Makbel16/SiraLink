import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { JobCategory, TranscriptionResult } from '../../types/index';

export default function WorkerProfileEditScreen() {
  const router = useRouter();
  const { workerProfile, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [category, setCategory] = useState<JobCategory>(workerProfile?.skill_category || 'PLUMBING');
  const [rate, setRate] = useState<string>(workerProfile?.hourly_rate_etb?.toString() || '450');
  const [experience, setExperience] = useState<string>(workerProfile?.experience_years?.toString() || '5');
  const [description, setDescription] = useState<string>(workerProfile?.skill_description || '');
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
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

  const handleVoiceComplete = (result: TranscriptionResult) => {
    setVoiceUrl(result.audioUrl);
    if (!description) {
      setDescription(result.transcript);
    }
    Alert.alert(t('voice_intro_label'), t('voice_recorded_success'));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await api.upsertWorkerProfile({
        skillCategory: category,
        hourlyRateEtb: rate ? parseFloat(rate) : 400,
        experienceYears: experience ? parseInt(experience, 10) : 1,
        skillDescription: description
      });

      await refreshUser();
      Alert.alert(t('profile_saved_success'), '', [
        { text: t('continue'), onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('something_went_wrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Category selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('primary_skill')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
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
                    {getCategoryName(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hourly Rate */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('hourly_rate_etb')}</Text>
          <View
            style={[
              styles.inputPrefixRow,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF',
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.prefixText, { color: colors.primary }]}>{t('etb')}</Text>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              keyboardType="numeric"
              placeholder="450"
              placeholderTextColor={colors.textMuted}
              value={rate}
              onChangeText={setRate}
            />
          </View>
        </View>

        {/* Experience years */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('experience_years_label')}</Text>
          <TextInput
            style={[
              styles.textInputFull,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF',
                borderColor: colors.border,
                color: colors.textPrimary
              }
            ]}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor={colors.textMuted}
            value={experience}
            onChangeText={setExperience}
          />
        </View>

        {/* Skill Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('bio_label')}</Text>
          <TextInput
            style={[
              styles.textInputFull,
              styles.textArea,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF',
                borderColor: colors.border,
                color: colors.textPrimary
              }
            ]}
            multiline
            numberOfLines={4}
            placeholder={t('bio_placeholder')}
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Voice Bio Recorder */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('voice_intro_label')}</Text>
          <Text style={[styles.helperText, { color: colors.textMuted }]}>
            {t('voice_intro_hint')}
          </Text>
          <VoiceRecorder onTranscriptionComplete={handleVoiceComplete} />
        </View>

        {/* Save button */}
        <Button
          title={t('save_profile')}
          onPress={handleSave}
          loading={submitting}
          size="lg"
          style={{ marginTop: 14 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12
  },
  catScroll: {
    gap: 8,
    paddingVertical: 4
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  catPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569'
  },
  catTextActive: {
    color: '#FFFFFF'
  },
  inputPrefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden'
  },
  prefixText: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1'
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  textInputFull: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#CBD5E1'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  }
});
