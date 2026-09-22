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
import { Audio } from 'expo-av';
import { Mic, Square, RotateCcw, Edit3 } from 'lucide-react-native';
import { api } from '../services/api.js';
import { TranscriptionResult } from '../types/index.js';
import { useTranslation } from '../utils/i18n.js';

interface VoiceRecorderProps {
  onTranscriptionComplete: (result: TranscriptionResult) => void;
  onManualInputRequested?: () => void;
}

export function VoiceRecorder({
  onTranscriptionComplete,
  onManualInputRequested
}: VoiceRecorderProps) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [durationSecs, setDurationSecs] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

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
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('microphone_permission'), t('microphone_permission'));
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      setDurationSecs(0);

      timerRef.current = setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopAndUploadRecording = async () => {
    if (!recording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error('Recording audio URI unavailable');
      }

      // Upload audio to backend speech-to-text pipeline
      const result = await api.uploadAndTranscribe(uri, 'user_voice_request.m4a', 'audio/m4a');
      setRecording(null);
      setIsProcessing(false);
      onTranscriptionComplete(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Voice processing failed. Please retry or enter text.');
      setIsProcessing(false);
      setRecording(null);
    }
  };

  const cancelRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => {});
      setRecording(null);
    }
    setIsRecording(false);
    setDurationSecs(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
            <Text style={styles.timerText}>{formatTime(durationSecs)}</Text>
            <Text style={styles.hintText}>{t('listening')}</Text>
          </View>
        ) : isProcessing ? (
          <Text style={styles.processingText}>{t('transcribing')}</Text>
        ) : (
          <Text style={styles.idleHint}>{t('tap_and_speak')}</Text>
        )}
      </View>

      {/* Action Controls when Recording */}
      {isRecording && (
        <View style={styles.cancelRow}>
          <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
            <RotateCcw size={18} color="#64748B" />
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message & Manual Text Fallback */}
      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <View style={styles.fallbackActions}>
            <TouchableOpacity onPress={startRecording} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
            {onManualInputRequested && (
              <TouchableOpacity onPress={onManualInputRequested} style={styles.manualBtn}>
                <Edit3 size={15} color="#0F766E" />
                <Text style={styles.manualText}>{t('enter_manually')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Manual text alternative link */}
      {!isRecording && !isProcessing && onManualInputRequested && (
        <TouchableOpacity
          onPress={onManualInputRequested}
          style={styles.manualLinkButton}
          activeOpacity={0.7}
        >
          <Edit3 size={16} color="#64748B" />
          <Text style={styles.manualLinkText}>{t('enter_manually')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20
  },
  micWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.28)'
  },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0F766E', // Primary Teal
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8
  },
  micButtonActive: {
    backgroundColor: '#EF4444', // Alert Red during recording
    shadowColor: '#EF4444'
  },
  micButtonProcessing: {
    backgroundColor: '#0284C7' // Sky Blue during transcription
  },
  statusBox: {
    marginTop: 18,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A'
  },
  hintText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500'
  },
  idleHint: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600'
  },
  processingText: {
    fontSize: 16,
    color: '#0284C7',
    fontWeight: '700'
  },
  cancelRow: {
    marginTop: 14
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9'
  },
  cancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600'
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    maxWidth: 320
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 8
  },
  fallbackActions: {
    flexDirection: 'row',
    gap: 12
  },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DC2626',
    borderRadius: 8
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F766E'
  },
  manualText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700'
  },
  manualLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  manualLinkText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
