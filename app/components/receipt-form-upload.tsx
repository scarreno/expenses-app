"use client";

import { useRef, useState } from "react";
import { IconUpload, IconFileUpload } from '@tabler/icons-react';
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

  const receiptTypes = [
    { label: "Select type", value: "" },
    { label: "Supermarket", value: "SUPERMARKET" },
    { label: "Almacén", value: "GROCERY_STORE" },
  ];

  return (
    <section className="mx-auto max-w-md space-y-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Expenses MVP
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a receipt and extract its items with AI.
        </p>
      </div>

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
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>

          <SelectContent className="z-50 bg-zinc-950 text-zinc-50 border border-zinc-800 shadow-xl">
            <SelectGroup>
              <SelectLabel>Select a type</SelectLabel>
              <SelectItem value="SUPERMARKET">Supermarket</SelectItem>
              <SelectItem value="MARKET">Market</SelectItem>
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
      </form>
    </section>
  );
}