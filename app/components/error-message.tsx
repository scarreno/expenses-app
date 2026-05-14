type Props = {
  message: string;
};

export function ErrorMessage({
  message,
}: Props) {
  return (
    <p
      style={{
        color: "red",
        marginTop: 24,
      }}
    >
      {message}
    </p>
  );
}