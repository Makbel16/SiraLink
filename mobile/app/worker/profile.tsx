import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { useTranslation } from '../../utils/i18n.js';
import { Button } from '../../components/Button.js';
import { VoiceRecorder } from '../../components/VoiceRecorder.js';
import { JobCategory, TranscriptionResult } from '../../types/index.js';

export default function WorkerProfileEditScreen() {
  const router = useRouter();
  const { workerProfile, refreshUser } = useAuth();
  const { t } = useTranslation();

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

  const handleVoiceComplete = (result: TranscriptionResult) => {
    setVoiceUrl(result.audioUrl);
    if (!description) {
      setDescription(result.transcript);
    }
    Alert.alert('ድምጽ ተቀድቷል', 'የድምጽ መግለጫዎ በተሳካ ሁኔታ ተጭኗል!');
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
      Alert.alert('ተሳክቷል!', 'የባለሙያ መገለጫዎ በተሳካ ሁኔታ ተስተካክሏል!', [
        { text: 'እሺ', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('ስህተት', err.message || t('something_went_wrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Category selection */}
        <View style={styles.section}>
          <Text style={styles.label}>ዋና የሙያ ዘርፍ (Primary Skill)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                >
                  <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hourly Rate */}
        <View style={styles.section}>
          <Text style={styles.label}>የሰዓት ተመን በብር (Hourly Rate in ETB)</Text>
          <View style={styles.inputPrefixRow}>
            <Text style={styles.prefixText}>ETB</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="450"
              value={rate}
              onChangeText={setRate}
            />
          </View>
        </View>

        {/* Experience years */}
        <View style={styles.section}>
          <Text style={styles.label}>የስራ ልምድ በዓመታት (Years of Experience)</Text>
          <TextInput
            style={styles.textInputFull}
            keyboardType="numeric"
            placeholder="5"
            value={experience}
            onChangeText={setExperience}
          />
        </View>

        {/* Skill Description */}
        <View style={styles.section}>
          <Text style={styles.label}>ስለ እርስዎ እና ስራዎ ማብራሪያ (Bio)</Text>
          <TextInput
            style={[styles.textInputFull, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="ስለሚሰሩት ስራ፣ ስለ ችሎታዎ እና ስለ መሳሪያዎችዎ ይግለጹ..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Voice Bio Recorder */}
        <View style={styles.section}>
          <Text style={styles.label}>የድምጽ መግለጫ ይቅረጹ (Voice Introduction)</Text>
          <Text style={styles.helperText}>
            ደንበኞች ድምጽዎን በማዳመጥ እምነት እንዲጥሉብዎት ስለ ራስዎ በአጭሩ ይናገሩ
          </Text>
          <VoiceRecorder onTranscriptionComplete={handleVoiceComplete} />
        </View>

        {/* Save button */}
        <Button
          title="አስቀምጥ (Save Profile)"
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
    backgroundColor: '#0F766E',
    borderColor: '#0F766E'
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
    color: '#0F766E',
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
