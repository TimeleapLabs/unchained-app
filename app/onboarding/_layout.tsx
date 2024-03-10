import { Stack } from "expo-router/stack";

export default function LoginLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="pin"
        options={{
          title: "Create account",
        }}
      />
      <Stack.Screen
        name="confirm-pin"
        options={{
          title: "Confirm your PIN",
        }}
      />
    </Stack>
  );
}
