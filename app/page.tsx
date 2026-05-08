"use client";

import { useState } from "react";


export default function Home() {
  const [result, setResult] = useState("");


  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>){
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/receipts/upload", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    setResult(JSON.stringify(data, null,2));
  }

  return (
    <main style={{ padding: 32}}>
      <h1>Expenses MVP</h1>

      <form onSubmit={handleSubmit}>
        <input type="file"
        name="file"
        accept="image/*,application/pdf"
        required
        />

        <br/>

        <button type="submit">
          Upload Receipt
        </button>      
      </form>

      { result && (
        <pre style={{ marginTop: 24}}>
          {result}
        </pre>
      )}

    </main>
  );
}
