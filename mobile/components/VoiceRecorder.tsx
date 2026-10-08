import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync
} from 'expo-audio';
import { Mic, Square, RotateCcw, Edit3 } from 'lucide-react-native';
import { api } from '../services/api';
import { TranscriptionResult } from '../types/index';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

interface VoiceRecorderProps {
  onTranscriptionComplete: (result: TranscriptionResult) => void;
  onManualInputRequested?: () => void;
  compact?: boolean;
}

export function VoiceRecorder({
  onTranscriptionComplete,
  onManualInputRequested,
  compact = false
}: VoiceRecorderProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [durationSecs, setDurationSecs] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        if (recorder && typeof recorder.stop === 'function') {
          recorder.stop().catch(() => {});
        }
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 650,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      if (Platform.OS !== 'web') {
        const { status } = await requestRecordingPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('microphone_permission'), t('microphone_permission'));
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
          interruptionMode: 'doNotMix'
        });
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

      setIsRecording(true);
      setDurationSecs(0);

      timerRef.current = setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopAndUploadRecording = async () => {
    if (!isRecording && !recorder.isRecording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recorder.stop();
      if (Platform.OS !== 'web') {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
          interruptionMode: 'doNotMix'
        });
      }
      const uri = recorder.uri;

      if (!uri) {
        throw new Error('Recording audio URI unavailable');
      }

      // Upload audio to backend speech-to-text pipeline
      const result = await api.uploadAndTranscribe(uri, 'user_voice_request.m4a', 'audio/m4a');
      setIsProcessing(false);
      onTranscriptionComplete(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Voice processing failed. Please retry or enter text.');
      setIsProcessing(false);
    }
  };

  const cancelRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      await recorder.stop();
      if (Platform.OS !== 'web') {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
          interruptionMode: 'doNotMix'
        });
      }
    } catch {}
    setIsRecording(false);
    setDurationSecs(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <View style={styles.compactRoot}>
        <View
          style={[
            styles.compactContainer,
            {
              backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
              borderColor: isRecording ? colors.danger : colors.border
            }
          ]}
        >
          {/* Left: Compact Mic Button */}
          <View style={styles.compactMicWrap}>
            {isRecording && (
              <Animated.View
                style={[
                  styles.compactPulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: 'rgba(239, 68, 68, 0.25)'
                  }
                ]}
              />
            )}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={
                isRecording
                  ? stopAndUploadRecording
                  : isProcessing
                  ? undefined
                  : startRecording
              }
              disabled={isProcessing}
              style={[
                styles.compactMicBtn,
                { backgroundColor: colors.primary },
                isRecording && styles.compactMicBtnActive,
                isProcessing && styles.compactMicBtnProcessing
              ]}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : isRecording ? (
                <Square size={18} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Mic size={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Center: Live Status / Title */}
          <View style={styles.compactInfo}>
            {isRecording ? (
              <View>
                <View style={styles.compactRecordingRow}>
                  <View style={styles.recordingDot} />
                  <Text style={[styles.compactTimer, { color: colors.danger }]}>
                    {formatTime(durationSecs)}
                  </Text>
                  <Text style={[styles.compactLiveLabel, { color: colors.danger }]}>
                    {t('listening')}
                  </Text>
                </View>
                <Text style={[styles.compactHintText, { color: colors.textSecondary }]}>
                  {t('tap_to_finish')}
                </Text>
              </View>
            ) : isProcessing ? (
              <View>
                <Text style={[styles.compactTitleText, { color: colors.primary }]}>
                  {t('processing')}
                </Text>
                <Text style={[styles.compactHintText, { color: colors.textSecondary }]}>
                  {t('transcribing')}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={[styles.compactTitleText, { color: colors.textPrimary }]}>
                  {t('tap_and_speak')}
                </Text>
                <Text style={[styles.compactHintText, { color: colors.textSecondary }]}>
                  {t('voice_assistant_hint')}
                </Text>
              </View>
            )}
          </View>

          {/* Right: Cancel button if recording, or Manual input button if idle */}
          <View style={styles.compactRightAction}>
            {isRecording ? (
              <TouchableOpacity
                onPress={cancelRecording}
                style={[
                  styles.compactIconBtn,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }
                ]}
              >
                <RotateCcw size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : onManualInputRequested ? (
              <TouchableOpacity
                onPress={onManualInputRequested}
                style={[
                  styles.compactManualPill,
                  {
                    backgroundColor: isDark ? 'rgba(20, 184, 166, 0.15)' : '#CCFBF1',
                    borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#99F6E4'
                  }
                ]}
                activeOpacity={0.75}
              >
                <Edit3 size={13} color={colors.primary} />
                <Text style={[styles.compactManualText, { color: colors.primary }]}>
                  {t('enter_manually')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Error message if any */}
        {errorMsg && (
          <View style={[styles.compactErrorBox, { backgroundColor: isDark ? colors.dangerLight : '#FEF2F2' }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
            <TouchableOpacity onPress={startRecording} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Pulse Circle Behind Main Mic Button */}
      <View style={styles.micWrapper}>
        {isRecording && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            isRecording
              ? stopAndUploadRecording
              : isProcessing
              ? undefined
              : startRecording
          }
          disabled={isProcessing}
          style={[
            styles.micButton,
            isRecording && styles.micButtonActive,
            isProcessing && styles.micButtonProcessing
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : isRecording ? (
            <Square size={36} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Mic size={42} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Dynamic Status / Timer */}
      <View style={styles.statusBox}>
        {isRecording ? (
          <View style={styles.activeRecordingRow}>
            <View style={styles.recordingDot} />
            <Text style={[styles.timerText, { color: colors.textPrimary }]}>{formatTime(durationSecs)}</Text>
            <Text style={[styles.hintText, { color: colors.primary }]}>{t('listening')}</Text>
          </View>
        ) : isProcessing ? (
          <Text style={[styles.processingText, { color: colors.primary }]}>{t('transcribing')}</Text>
        ) : (
          <Text style={[styles.idleHint, { color: colors.textSecondary }]}>{t('tap_and_speak')}</Text>
        )}
      </View>

      {/* Action Controls when Recording */}
      {isRecording && (
        <View style={styles.cancelRow}>
          <TouchableOpacity
            onPress={cancelRecording}
            style={[
              styles.cancelButton,
              { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
            ]}
          >
            <RotateCcw size={16} color={colors.textSecondary} />
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message & Manual Text Fallback */}
      {errorMsg && (
        <View style={[styles.errorBox, { backgroundColor: isDark ? colors.dangerLight : '#FEF2F2' }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
          <View style={styles.fallbackActions}>
            <TouchableOpacity onPress={startRecording} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
            {onManualInputRequested && (
              <TouchableOpacity onPress={onManualInputRequested} style={styles.manualBtn}>
                <Edit3 size={15} color={colors.primary} />
                <Text style={[styles.manualText, { color: colors.primary }]}>{t('enter_manually')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Manual text alternative link */}
      {!isRecording && !isProcessing && onManualInputRequested && (
        <TouchableOpacity
          onPress={onManualInputRequested}
          style={[
            styles.manualLinkButton,
            {
              backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9',
              borderColor: colors.borderSubtle
            }
          ]}
          activeOpacity={0.7}
        >
          <Edit3 size={15} color={colors.textSecondary} />
          <Text style={[styles.manualLinkText, { color: colors.textSecondary }]}>
            {t('enter_manually')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20
  },
  micWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 118, 110, 0.25)'
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444'
  },
  micButtonProcessing: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706'
  },
  statusBox: {
    marginTop: 16,
    alignItems: 'center'
  },
  activeRecordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444'
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  hintText: {
    fontSize: 14,
    color: '#0F766E',
    fontWeight: '600'
  },
  processingText: {
    fontSize: 15,
    color: '#D97706',
    fontWeight: '600'
  },
  idleHint: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500'
  },
  cancelRow: {
    marginTop: 14
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9'
  },
  cancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600'
  },
  errorBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    maxWidth: 320
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center'
  },
  fallbackActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8
  },
  retryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#CCFBF1',
    borderRadius: 8
  },
  manualText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600'
  },
  manualLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  manualLinkText: {
    fontSize: 14,
    color: '#0F766E',
    fontWeight: '600'
  },
  compactRoot: {
    width: '100%',
    marginVertical: 4
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12
  },
  compactMicWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  compactPulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24
  },
  compactMicBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  compactMicBtnActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444'
  },
  compactMicBtnProcessing: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706'
  },
  compactInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  compactRecordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2
  },
  compactTimer: {
    fontSize: 14,
    fontWeight: '800'
  },
  compactLiveLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  compactTitleText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  compactHintText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1
  },
  compactSubHint: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1
  },
  compactRightAction: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  compactIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactManualPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1
  },
  compactManualText: {
    fontSize: 11,
    fontWeight: '700'
  },
  compactErrorBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  }
});
