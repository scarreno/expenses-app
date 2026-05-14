import { ReceiptItem } from "@/app/types/receipt";
import { formatMoney }
from "@/app/lib/format-money";

type Props = {
    items: ReceiptItem[];
    
    updateItemField: (index: number,
        field: keyof ReceiptItem,
        value: string) => void;

    removeItem: (index: number) => void;
}

export function ReceiptItemsTable({
                                items,
                                updateItemField,
                                removeItem,
                                }: Props){
    return (
        <table
            style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
            }}
            >
            <thead>
                <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {items.map((item, index) => (
                <tr key={index}>
                    <td>
                    <input
                        value={item.description}
                        style={{ width: 220 }}
                        onChange={(event) =>
                            updateItemField(
                                index,
                                "description",
                                event.target.value
                            )
                        }
                    />
                    </td>

                    <td>
                    <input
                        type="number"
                        style={{ width: 40 }}
                        value={item.quantity ?? ""}
                        onChange={(event) =>
                        updateItemField(index, "quantity", event.target.value)
                        }
                    />
                    </td>

                    <td>
                    <input
                        value={item.unit ?? ""}
                        onChange={(event) =>
                        updateItemField(index, "unit", event.target.value)
                        }
                    />
                    </td>

                    <td>
                    <input
                        type="number"
                        style={{ width: 90 }}
                        value={item.unitPrice ?? ""}
                        onChange={(event) =>
                        updateItemField(
                            index,
                            "unitPrice",
                            event.target.value
                        )
                        }
                    />

                    <div
                        style={{
                        fontSize: 12,
                        color: "#666",
                        marginTop: 4,
                        }}
                    >
                        {formatMoney(item.unitPrice)}
                    </div>

                    </td>

                    <td>
                        <div>{formatMoney(item.totalPrice)}</div>
                    </td>

                    <td>
                    <button type="button" onClick={() => removeItem(index)}
                        style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        }}>
                        Remove
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>

    );
}