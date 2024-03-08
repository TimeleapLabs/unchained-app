import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from 'tamagui'

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <SafeAreaView>
        <Text>Home</Text>
      </SafeAreaView>
    </>
  )
}
