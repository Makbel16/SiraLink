import { View, Text, Image, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  isVerified?: boolean;
}

export function Avatar({ name, imageUrl, size = 52, isVerified = false }: AvatarProps) {
  const getInitials = (n?: string | null): string => {
    if (!n) return 'ስ';
    const parts = n.trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return n.charAt(0).toUpperCase();
  };

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2
            }
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {isVerified && (
        <View style={styles.verifiedBadge}>
          <ShieldCheck size={14} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0284C7',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  }
});
