import { ExtractedReceipt } from "@/app/types/receipt";
import { formatMoney }
from "@/app/lib/format-money";

type Props = {
    store: string | null;
    total: number | null;
};

export function ReceiptItemsSummary({ 
    store,
    total
}: Props){
    return(
        <div>
           <h2>Receipt Preview</h2>

            <div style={{ marginTop: 8, marginBottom: 16 }}>
            <div style={{ color: "#999", fontSize: 14 }}>
                Store
            </div>
            <div style={{ fontSize: 20 }}>
                {store ?? "-"}
            </div>
            </div>

            <div
                style={{
                    marginTop: 16,
                    marginBottom: 24,
                    padding: 16,
                    border: "1px solid #333",
                    borderRadius: 8,
                    maxWidth: 260,
                }}
                >
                <div style={{ fontSize: 14, color: "#999" }}>
                    Total
                </div>

                <div style={{ fontSize: 28, fontWeight: "bold" }}>
                    {formatMoney(total)}
                </div>
                </div>
        </div>
    );
}