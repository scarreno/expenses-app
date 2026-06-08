import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  fileUrl: string;
};

export function ReceiptFilePreview({ fileUrl }: Props) {
  const isPdf = fileUrl.endsWith(".pdf");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt File</CardTitle>
      </CardHeader>

      <CardContent>
        {isPdf ? (
          <iframe
            src={`${fileUrl}#view=Fit`}
            title="Receipt PDF"
            className="h-[850px] w-full rounded-md border"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt="Receipt"
              className="max-h-[850px] w-full rounded-md border object-contain"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}