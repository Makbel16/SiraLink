import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Wrench, MapPin, DollarSign, Send, Check } from 'lucide-react-native';
import { api } from '../../services/api.js';
import { useLocation } from '../../context/LocationContext.js';
import { useTranslation } from '../../utils/i18n.js';
import { Button } from '../../components/Button.js';
import { VoicePlayer } from '../../components/VoicePlayer.js';
import { JobCategory } from '../../types/index.js';

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Voice Audio Preview if recorded */}
        {params.audioUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('record_voice')}</Text>
            <VoicePlayer audioUrl={params.audioUrl} title="የተቀረጸው የስራ ድምጽ" />
          </View>
        )}

        {/* Category Confirmation Pills */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('category')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
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

        {/* Job Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>የስራ ርዕስ (Job Title)</Text>
          <TextInput
            style={styles.input}
            placeholder="ለምሳሌ፡ የወጥ ቤት ቧንቧ ጥገና"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Text Description / Transcript */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ዝርዝር መግለጫ (Description)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="ችግሩን ወይም የሚፈልጉትን ስራ በዝርዝር ይጻፉ..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Budget Input in ETB */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>የተገመተ ዋጋ በብር (Estimated Budget in ETB)</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.currencyPrefix}>ETB</Text>
            <TextInput
              style={styles.budgetInput}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor="#94A3B8"
              value={budget}
              onChangeText={setBudget}
            />
          </View>
        </View>

        {/* Location Info Banner */}
        <View style={styles.locationBanner}>
          <MapPin size={18} color="#0F766E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationBannerTitle}>የስራው ቦታ (Location)</Text>
            <Text style={styles.locationBannerSub}>
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
          style={{ marginTop: 24 }}
          icon={<Send size={18} color="#FFFFFF" />}
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
    marginBottom: 18
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
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
  input: {
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
    height: 110,
    textAlignVertical: 'top'
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden'
  },
  currencyPrefix: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F766E',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1'
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDFA',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1'
  },
  locationBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E'
  },
  locationBannerSub: {
    fontSize: 12,
    color: '#64748B'
  }
});
