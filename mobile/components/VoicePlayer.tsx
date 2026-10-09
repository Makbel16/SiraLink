import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Play, Pause, Volume2 } from 'lucide-react-native';
import { api } from '../services/api';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

interface VoicePlayerProps {
  audioUrl: string;
  title?: string;
}

export function VoicePlayer({ audioUrl, title }: VoicePlayerProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const displayTitle = title || t('voice_note_title');
  const resolvedUrl = api.resolveMediaUrl(audioUrl);
  const player = useAudioPlayer(resolvedUrl ? { uri: resolvedUrl } : null, {
    downloadFirst: true,
    updateInterval: 250
  });
  const status = useAudioPlayerStatus(player);

  const isPlaying = !!status?.playing;
  const isLoading = !!resolvedUrl && !status?.isLoaded && !status?.duration && !status?.error;
  const currentTimeSec = status?.currentTime || 0;
  const durationSec = status?.duration || 0;

  const togglePlay = async () => {
    try {
      if (Platform.OS !== 'web') {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
          interruptionMode: 'doNotMix'
        });
      }

      if (isPlaying) {
        player.pause();
      } else {
        if (status?.didJustFinish || (durationSec > 0 && currentTimeSec >= durationSec)) {
          await player.seekTo(0);
        }
        player.play();
      }
    } catch (err) {
      console.warn('Voice playback failed:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const totalSecs = Math.floor(seconds);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = durationSec > 0 ? Math.min(100, (currentTimeSec / durationSec) * 100) : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceSubtle : '#EFF6FF',
          borderColor: isDark ? colors.border : '#DBEAFE'
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={togglePlay}
        disabled={isLoading}
        style={[styles.playButton, { backgroundColor: colors.primary }]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : isPlaying ? (
          <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
        )}
      </TouchableOpacity>

      <View style={styles.progressSection}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Volume2 size={14} color={colors.primary} />
            <Text style={[styles.titleText, { color: colors.primary }]}>{displayTitle}</Text>
          </View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(currentTimeSec)} / {formatTime(durationSec)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }]}>
          <View style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 12
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressSection: {
    flex: 1,
    gap: 6
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700'
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 3
  }
});
