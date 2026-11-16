"use client";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dictionary } from "@/app/types/dictionary";

export function ExtractionProgress({
  fileName,
  dictionary,
}: {
  fileName?: string | null;
  dictionary: Dictionary;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.upload.processing.title}</CardTitle>
        <CardDescription>{dictionary.upload.processing.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        <span>{fileName}</span>
      </CardContent>
    </Card>
  );
}

export function ExtractionFailure({
  dictionary,
  errorCode,
  discarding,
  onDiscard,
}: {
  dictionary: Dictionary;
  errorCode?: string | null;
  discarding: boolean;
  onDiscard: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.upload.processing.failedTitle}</CardTitle>
        <CardDescription>{dictionary.upload.processing.failedDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorCode ? (
          <p className="text-sm text-muted-foreground">{errorCode}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {dictionary.receipt.errors.extractionFailed}
          </p>
        )}
        <Button type="button" variant="outline" disabled={discarding} onClick={onDiscard}>
          {dictionary.receipt.dialogs.discardPreview.actions.discard}
        </Button>
      </CardContent>
    </Card>
  );
}
