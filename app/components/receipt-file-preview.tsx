import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  fileUrl?: string | null;
  dictionary: Dictionary;
};

export function ReceiptFilePreview({ fileUrl, dictionary }: Props) {
  if (!fileUrl) {
    return (
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{dictionary.receipt.file.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex h-[320px] items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
            {dictionary.receipt.file.notAvailable}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{dictionary.receipt.file.title}</CardTitle>
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