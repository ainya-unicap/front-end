import { Tabs } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#166534', 
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          position: 'absolute', 
          elevation: 20, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="home" size={26} color={focused ? '#f97316' : '#9ca3af'} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Canteiros',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="sprout" size={26} color={focused ? '#84cc16' : '#9ca3af'} />
          ),
        }}
      />

      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="document-text" size={24} color={focused ? '#166534' : '#d8b4fe'} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="person" size={24} color={focused ? '#6b21a8' : '#9ca3af'} />
          ),
        }}
      />
      
    </Tabs>
  );
}