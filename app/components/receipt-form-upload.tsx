"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  handleSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
  loading: boolean;
};

export function ReceiptFormUpload({
  handleSubmit,
  loading,
}: Props) {
  const [receiptType, setReceiptType] = useState("");

  return (
    <section className="max-w-md space-y-6">
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
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select receipt type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="SUPERMARKET">
              Supermercado
            </SelectItem>
            <SelectItem value="MARKET">
              Almacen
            </SelectItem>            
          </SelectContent>
        </Select>

        <input
          className="block w-full text-sm text-muted-foreground"
          type="file"
          name="file"
          accept="image/*,application/pdf"
          required
        />

        <Button
          className="w-full"
          type="submit"
          disabled={loading || !receiptType}
        >
          {loading ? "Processing..." : "Upload receipt"}
        </Button>
      </form>
    </section>
  );
}