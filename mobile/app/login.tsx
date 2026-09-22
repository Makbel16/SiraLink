import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Shield, User, Briefcase } from 'lucide-react-native';
import { Button } from '../components/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useTranslation } from '../utils/i18n.js';
import { UserRole } from '../types/index.js';

export default function LoginScreen() {
  const router = useRouter();
  const { requestOTP } = useAuth();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState<string>('0911223344');
  const [role, setRole] = useState<'CLIENT' | 'WORKER'>('CLIENT');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      Alert.alert('ስህተት', 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ');
      return;
    }

    setLoading(true);
    try {
      const res = await requestOTP(phoneNumber);
      // Navigate to OTP verification screen
      router.push({
        pathname: '/verify-otp',
        params: {
          phoneNumber,
          role,
          devOtp: res.devOtp || '123456'
        }
      });
    } catch (err: any) {
      Alert.alert('ስህተት', err.message || t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('login')}</Text>
        <Text style={styles.subtitle}>
          ስልክ ቁጥርዎን ያስገቡ፤ የማረጋገጫ ኮድ (OTP) እንልክልዎታለን
        </Text>
      </View>

      {/* Role Selection Segmented Toggle */}
      <View style={styles.rolePicker}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setRole('CLIENT')}
          style={[styles.roleOption, role === 'CLIENT' && styles.roleOptionActive]}
        >
          <User size={18} color={role === 'CLIENT' ? '#0F766E' : '#64748B'} />
          <Text style={[styles.roleText, role === 'CLIENT' && styles.roleTextActive]}>
            {t('client')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setRole('WORKER')}
          style={[styles.roleOption, role === 'WORKER' && styles.roleOptionActive]}
        >
          <Briefcase size={18} color={role === 'WORKER' ? '#0F766E' : '#64748B'} />
          <Text style={[styles.roleText, role === 'WORKER' && styles.roleTextActive]}>
            {t('worker')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Phone Number Input Form */}
      <View style={styles.form}>
        <Text style={styles.inputLabel}>{t('phone_number')}</Text>
        <View style={styles.phoneInputRow}>
          <View style={styles.countryBadge}>
            <Text style={styles.countryFlag}>🇪🇹</Text>
            <Text style={styles.countryCode}>+251</Text>
          </View>
          <TextInput
            style={styles.textInput}
            keyboardType="phone-pad"
            placeholder="0911223344"
            placeholderTextColor="#94A3B8"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={13}
          />
        </View>

        <View style={styles.securityHint}>
          <Shield size={14} color="#64748B" />
          <Text style={styles.securityHintText}>
            ስልክዎ ለደህንነት እና አገልግሎት ብቻ የሚውል ነው
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('login')}
          onPress={handleSendOTP}
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
    marginTop: 16
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22
  },
  rolePicker: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10
  },
  roleOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B'
  },
  roleTextActive: {
    color: '#0F766E',
    fontWeight: '800'
  },
  form: {
    marginTop: 8
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden'
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1'
  },
  countryFlag: {
    fontSize: 18
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  securityHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12
  },
  securityHintText: {
    fontSize: 12,
    color: '#64748B'
  },
  footer: {
    marginBottom: 16
  }
});
