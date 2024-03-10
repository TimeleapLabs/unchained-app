import { Input, Spinner, View } from "tamagui";

interface PinInputProps {
  value: string;
  error?: boolean;
  onChangeText: (pin: string) => void;
  id?: string;
  autoFocus?: boolean;
  loading?: boolean;
}

export default function PinInput({
  value,
  error,
  onChangeText,
  id = "pin",
  autoFocus,
  loading = false,
}: PinInputProps) {
  return (
    <View>
      <Input
        id={id}
        passwordRules="required: lower; required: upper; required: digit; max-consecutive: 2; minlength: 8;"
        secureTextEntry
        size="$6"
        textAlign="center"
        keyboardType="number-pad"
        fontSize={40}
        letterSpacing={16}
        maxLength={6}
        value={value}
        onChangeText={onChangeText}
        borderWidth={2}
        autoFocus={autoFocus}
        borderColor={error ? "$red8" : "$gray5"}
        focusStyle={{ borderColor: error ? "$red8" : "$blue8" }}
        readOnly={loading}
      />
      {loading && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="large" />
        </View>
      )}
    </View>
  );
}
