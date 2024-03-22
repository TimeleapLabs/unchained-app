import { Text, XStack } from "tamagui";

interface Props {
  label: string;
  text: string;
  labelWidth?: number;
  textWidth?: number;
}

export default function InlineField({
  label,
  text,
  labelWidth = 1 / 5,
  textWidth = 4 / 5,
}: Props) {
  return (
    <XStack gap="$4" width="100%" alignItems="center">
      <Text style={{ flex: labelWidth }} fontSize="$2" fontFamily="$subHeading">
        {label}
      </Text>
      <Text
        style={{ flex: textWidth }}
        fontSize="$2"
        textOverflow="ellipsis"
        numberOfLines={1}
        fontFamily="$bodySecondary"
      >
        {text}
      </Text>
    </XStack>
  );
}
