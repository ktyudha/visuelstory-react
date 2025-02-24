import { Helmet } from "react-helmet-async";

interface Props {
  title?: string;
}
export default function Metadata({ title }: Props) {
  return (
    <Helmet>
      {title ? (
        <title>{title} - Dhagrafis Visual Storyteller</title>
      ) : (
        <title>Dhagrafis Visual Storyteller</title>
      )}
    </Helmet>
  );
}
