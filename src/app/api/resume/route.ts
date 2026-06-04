import { extractText } from "unpdf";
import { parseResumeText } from "@/lib/matching";

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
      return Response.json({ error: "Unsupported file type. Upload a PDF or TXT file." }, { status: 400 });
    }

    if (!text.trim()) {
      return Response.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    const profile = parseResumeText(text);

    return Response.json({
      skills: profile.skills,
      keywordCount: profile.keywords.size,
      textLength: text.length,
    });
  } catch (e) {
    console.error("Resume parse error:", e);
    return Response.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
