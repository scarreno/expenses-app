import { ExtractedReceipt } from "@/app/types/receipt";
import { formatMoney }
from "@/app/lib/format-money";

type Props = {
  receipt: ExtractedReceipt;

  updateReceiptField: (
    field: keyof ExtractedReceipt,
    value: string
  ) => void;
};

export function ReceiptItemsSummary({ 
    receipt,
    updateReceiptField 
}: Props){
    return(
        <div>
            <h2>Receipt Preview</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <label>
                Store: 
                <input
                  value={receipt.store ?? ""}
                  onChange={(event) =>
                    updateReceiptField("store", event.target.value)
                  }
                />
              </label>

              <label>
                Total: 
                      <input
                        type="number"
                        style={{ width: 90 }}
                        value={receipt.total ?? ""}
                        onChange={(event) =>
                          updateReceiptField("total", event.target.value)
                        }
                      />

                      <div
                        style={{
                          fontSize: 12,
                          color: "#666",
                          marginTop: 4,
                        }}
                      >
                        {formatMoney(receipt.total)}
                      </div>
             
              </label>
            </div>
        </div>
    );
}