import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReceiptFileNotAvailable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt File</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex h-[320px] items-center justify-center rounded-md border bg-muted/30 text-center">
          <div>
            <p className="font-medium">
              Receipt file is not available
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              The original uploaded file could not be found.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}