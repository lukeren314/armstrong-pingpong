import { Card, Text } from "@mantine/core";

function Section({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) {
  return (
    <Card withBorder radius="md">
      <Card.Section bg="blue" p={12}>
        <Text c="white">{header}</Text>
      </Card.Section>
      <Card.Section>{children}</Card.Section>
    </Card>
  );
}

export default Section;
