type Props = {
    addItem: () => void,
    handleSave: () => void,
    saving: boolean
}



export function ReceiptActions({ 
        addItem,
        handleSave,
        saving
    }: Props){
        return(
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
              }}
            >
              <button type="button" onClick={addItem}
               style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}>
                Add item
              </button>

              <button type="button" onClick={handleSave} disabled={saving} 
               style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}>
                {saving ? "Saving..." : "Save receipt"}
              </button>
            </div>
        );
    }