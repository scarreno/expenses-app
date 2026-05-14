
type Props = {
  fileUrl: string;
}


export function ReceiptFilePreview({  fileUrl }: Props){
    return (
        <div>
            <h2>Receipt File</h2>

            {fileUrl.endsWith(".pdf") ? (
              <iframe
                src={`${fileUrl}#view=Fit`}
                width="100%"
                height="900"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                }}
              />
            ) : (
              <img
                src={fileUrl}
                alt="Receipt"
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                }}
              />
            )}
        </div>
    );
}