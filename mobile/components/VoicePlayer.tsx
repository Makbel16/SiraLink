import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Play, Pause, Volume2 } from 'lucide-react-native';
import { api } from '../services/api';

interface VoicePlayerProps {
  audioUrl: string;
  title?: string;
}

export function VoicePlayer({ audioUrl, title = 'የድምጽ መልዕክት' }: VoicePlayerProps) {
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
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={togglePlay}
        disabled={isLoading}
        style={styles.playButton}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : isPlaying ? (
          <Pause size={20} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
        )}
      </TouchableOpacity>

      <View style={styles.progressSection}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Volume2 size={14} color="#0F766E" />
            <Text style={styles.titleText}>{title}</Text>
          </View>
          <Text style={styles.timeText}>
            {formatTime(currentTimeSec)} / {formatTime(durationSec)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 16,
    padding: 12,
    gap: 12
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F766E',
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
    fontWeight: '700',
    color: '#0F766E'
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 3
  }
});
