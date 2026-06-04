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
      <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Resume matched: {fileName}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Jobs sorted by match score. {skills.length > 0 && `Found ${skills.length} matching skills.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClear();
              setFileName(null);
              setSkills([]);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-sm text-primary hover:text-primary-hover font-medium cursor-pointer"
          >
            Clear
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.slice(0, 12).map((skill) => (
              <span key={skill} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {skill}
              </span>
            ))}
            {skills.length > 12 && (
              <span className="px-2 py-0.5 rounded-md bg-tag-bg text-tag-text text-xs font-medium">
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
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver
          ? "border-primary bg-primary-light"
          : "border-border hover:border-primary/40 hover:bg-surface-hover"
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
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-text-secondary">Analyzing resume...</span>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-text-primary">
            Upload your resume to see match scores
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Drop a PDF or TXT file here, or click to browse
          </p>
        </>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
