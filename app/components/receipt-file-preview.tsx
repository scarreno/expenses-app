type Props = {
  fileUrl: string;
};

export function ReceiptFilePreview({ fileUrl }: Props) {
  const isPdf = fileUrl.endsWith(".pdf");

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold">
            Receipt File
        </h2>

      {isPdf ? (
        <iframe
          src={`${fileUrl}#view=Fit`}
          className="h-[850px] w-full rounded-lg border border-zinc-800 bg-zinc-900"
        />
      ) : (
        <img
          src={fileUrl}
          alt="Receipt"
          className="max-h-[850px] w-full rounded-lg border border-zinc-800 object-contain"
        />
      )}
    </div>
  );
}