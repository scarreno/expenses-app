type Props = {
    handleSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
    loading: boolean
}


export function ReceiptFormUpload({ 
        handleSubmit,
        loading 
    }: Props){
    return(
        <div>
            <h1>Expenses MVP</h1>

            <br />
            <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxWidth: 400,
            }}
            >
            <select name="receiptType" required>
                <option value="">Select receipt type</option>

                <option value="SUPERMARKET">Supermarket</option>
            </select>

            <input
                type="file"
                name="file"
                accept="image/*,application/pdf"
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Upload receipt"}
            </button>
            </form>
        </div>
    );
}