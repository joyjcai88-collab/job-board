"use client";

import { useState, useRef } from "react";

interface ResumeUploadProps {
  onResumeText: (text: string) => void;
  isActive: boolean;
  onClear: () => void;
}

export default function ResumeUpload({ onResumeText, isActive, onClear }: ResumeUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        setFileName(file.name);
        onResumeText(text);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      const [skillsRes, textRes] = await Promise.all([
        fetch("/api/resume", { method: "POST", body: formData }),
        fetch("/api/resume/text", { method: "POST", body: (() => { const fd = new FormData(); fd.append("resume", file); return fd; })() }),
      ]);

      if (!skillsRes.ok) {
        const data = await skillsRes.json();
        setError(data.error || "Failed to parse resume");
        setUploading(false);
        return;
      }

      const skillsData = await skillsRes.json();
      setSkills(skillsData.skills || []);
      setFileName(file.name);

      if (textRes.ok) {
        const textData = await textRes.json();
        onResumeText(textData.text);
      }
    } catch {
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (isActive) {
    return (
      <div className="bg-surface border border-border rounded-none p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              Resume matched
            </p>
            <p className="mt-1.5 font-serif text-[18px] text-text-primary truncate">
              {fileName}
            </p>
            <p className="mt-1 font-serif text-[14.5px] leading-[1.55] text-text-secondary">
              Jobs sorted by match score. {skills.length > 0 && `Found ${skills.length} matching skills.`}
            </p>
          </div>
          <button
            onClick={() => {
              onClear();
              setFileName(null);
              setSkills([]);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 rounded-full bg-pill px-[18px] py-[9px] font-mono text-[10px] uppercase tracking-[0.08em] text-text-primary hover:bg-pill-hi transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {skills.slice(0, 12).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-success-dim px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-success"
              >
                {skill}
              </span>
            ))}
            {skills.length > 12 && (
              <span className="rounded-full bg-pill px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-secondary">
                +{skills.length - 12} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border border-dashed rounded-none p-7 text-center transition-colors cursor-pointer ${
        dragOver
          ? "border-primary bg-tile"
          : "border-border hover:bg-tile"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleChange}
        className="hidden"
      />

      {uploading ? (
        <div className="flex items-center justify-center gap-2.5">
          <svg className="w-4 h-4 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
            Analyzing resume
          </span>
        </div>
      ) : (
        <>
          <p className="font-serif text-[18px] text-text-primary">
            Upload your resume to see match scores
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
            Drop a PDF or TXT file here, or click to browse
          </p>
        </>
      )}

      {error && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
