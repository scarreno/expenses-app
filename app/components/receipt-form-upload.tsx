"use client";

import { useRef, useState } from "react";
import { IconUpload, IconFileUpload, IconInfoCircle } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { PageHeader } from "@/app/components/layout/page-header";

type Props = {
  handleSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
  loading: boolean;
};

export function ReceiptFormUpload({
  handleSubmit,
  loading,
}: Props) {
  const [receiptType, setReceiptType] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="mx-auto max-w-md space-y-6 py-12">
      <PageHeader
        title="Upload Receipt"
        description="Upload a receipt and let AI extract the purchase details."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="hidden"
          name="receiptType"
          value={receiptType}
        />

        <Select
          value={receiptType}
          onValueChange={setReceiptType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>

          <SelectContent className="z-50 bg-zinc-950 text-zinc-50 border border-zinc-800 shadow-xl">
            <SelectGroup>
              <SelectLabel>Select business type</SelectLabel>
              <SelectItem value="SUPERMARKET">Supermarket</SelectItem>
              <SelectItem value="MARKET">Market</SelectItem>
              <SelectItem value="GAS">Bencina</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          name="file"
          accept="image/*,application/pdf"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? "");
          }}
        />


        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconFileUpload className="mr-2 size-4" />
          {fileName || "Select receipt file"}
        </Button>

        <p/>
        <p/>
        <p/>

        <Button
          variant="outline"
          className="w-full"
          type="submit"
          disabled={loading || !receiptType || !fileName}
        >
          {loading ? (
            <>
              <Spinner className="mr-2 size-4" />
              Processing...
            </>
          ) : (
            <>
              <IconUpload className="mr-2 size-4" />
              Upload receipt
            </>
          )}
        </Button>

        <p/>
        <p/>


        <Alert className="mt-4">
          <IconInfoCircle className="h-4 w-4" />

          <AlertTitle>Receipt Type Matters</AlertTitle>

          <AlertDescription>
            Selecting the correct business type improves extraction accuracy and category classification.
          </AlertDescription>
        </Alert>
      </form>

    </section>
  );
}