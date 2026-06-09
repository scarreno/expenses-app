import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  fileUrl?: string | null;
};

export function ReceiptFilePreview({ fileUrl }: Props) {
  if (!fileUrl) {
    return (
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Receipt File</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex h-[320px] items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
            Receipt file is not available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Receipt File</CardTitle>
      </CardHeader>

      <CardContent>
        {isPdf ? (
          <iframe
            src={`${fileUrl}#view=Fit`}
            title="Receipt PDF"
            className="h-[650px] w-full rounded-md border"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt="Receipt"
              className="max-h-[650px] w-full rounded-md border object-contain"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}