import { Tabs } from 'expo-router';
import { Home, Briefcase, Bell, User } from 'lucide-react-native';
import { useTranslation } from '../../utils/i18n';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0F766E',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t('jobs'),
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('messages'),
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
