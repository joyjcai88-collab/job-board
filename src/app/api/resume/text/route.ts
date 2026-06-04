import { extractText } from "unpdf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    let text = "";

    if (file.name.endsWith(".pdf")) {
      const { text: pdfText } = await extractText(buffer);
      text = Array.isArray(pdfText) ? pdfText.join("\n") : pdfText;
    } else if (file.name.endsWith(".txt")) {
      text = new TextDecoder().decode(buffer);
    } else {
      return Response.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return Response.json({ text });
  } catch (e) {
    console.error("Resume text extraction error:", e);
    return Response.json({ error: "Failed to extract text" }, { status: 500 });
  }
}
