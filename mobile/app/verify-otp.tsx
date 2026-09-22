import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, User } from 'lucide-react-native';
import { Button } from '../components/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useTranslation } from '../utils/i18n.js';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string; role: 'CLIENT' | 'WORKER'; devOtp?: string }>();
  const { verifyOTP } = useAuth();
  const { t } = useTranslation();

  const [otpCode, setOtpCode] = useState<string>(params.devOtp || '123456');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = async () => {
    if (!otpCode || otpCode.length < 4) {
      Alert.alert('ስህተት', 'እባክዎ የማረጋገጫ ኮዱን ያስገቡ');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(
        params.phoneNumber,
        otpCode,
        params.role || 'CLIENT',
        fullName.trim() || undefined
      );

      if (params.role === 'WORKER') {
        router.replace('/worker');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('የማረጋገጫ ስህተት', err.message || t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.shieldBadge}>
          <ShieldCheck size={32} color="#0F766E" />
        </View>
        <Text style={styles.title}>{t('otp')}</Text>
        <Text style={styles.subtitle}>
          {params.phoneNumber} ላይ የተላከውን ባለ 6 አሃዝ ኮድ ያስገቡ
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.inputLabel}>{t('otp')}</Text>
        <TextInput
          style={styles.otpInput}
          keyboardType="number-pad"
          maxLength={6}
          value={otpCode}
          onChangeText={setOtpCode}
          placeholder="123456"
          placeholderTextColor="#94A3B8"
        />

        {params.devOtp && (
          <View style={styles.devHint}>
            <Text style={styles.devHintText}>
              ⚙️ የልማት ሁነታ (Dev Mode): የሙከራ ኮድዎ {params.devOtp} ነው
            </Text>
          </View>
        )}

        {/* Full Name input */}
        <Text style={[styles.inputLabel, { marginTop: 20 }]}>{t('full_name')} (አማራጭ)</Text>
        <View style={styles.nameInputRow}>
          <User size={18} color="#64748B" />
          <TextInput
            style={styles.nameInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="ለምሳሌ፡ ዮሐንስ አበበ"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('verify')}
          onPress={handleVerify}
          loading={loading}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: 20
  },
  shieldBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16
  },
  form: {
    marginTop: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#0F172A'
  },
  devHint: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 10
  },
  devHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
    textAlign: 'center'
  },
  nameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    gap: 10
  },
  nameInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600'
  },
  footer: {
    marginBottom: 16
  }
});
