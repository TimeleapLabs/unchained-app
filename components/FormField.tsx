import { Label, View } from "tamagui";

interface Props {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}

export default function FormField({ htmlFor, label, children }: Props) {
  return (
    <View>
      <Label
        htmlFor={htmlFor}
        size="$1"
        textAlign="center"
        fontFamily="$subHeading"
        marginBottom="$2"
      >
        {label}
      </Label>
      {children}
    </View>
  );
}
