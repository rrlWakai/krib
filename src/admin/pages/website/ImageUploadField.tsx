import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadSiteImage } from "../../services/website";
import { Field, SmallButton } from "./fields";
import { cn } from "../../../lib/cn";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export function ImageUploadField({
  label = "Image",
  value,
  onChange,
  folder = "site",
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    const { data, error: uploadError } = await uploadSiteImage(file, folder);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (uploadError || !data) {
      setError(uploadError?.message ?? "Upload failed. Please try again.");
      return;
    }
    onChange(data.url);
  }

  return (
    <div>
      <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
        {label}
      </span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-white sm:w-44",
            dragOver ? "border-[#0A1F44] bg-[#f0f2f7]" : "border-[#d5d8e0]",
          )}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="px-3 text-center font-body text-[11px] text-[#757575]">
              <ImagePlus size={18} className="mx-auto mb-1" />
              Drop an image here
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 size={18} className="animate-spin text-[#0A1F44]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <SmallButton
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <ImagePlus size={12} />{" "}
              {uploading
                ? "Uploading…"
                : value
                  ? "Replace image"
                  : "Upload image"}
            </SmallButton>
            {value && (
              <SmallButton onClick={() => onChange("")} disabled={uploading}>
                <Trash2 size={12} /> Remove
              </SmallButton>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <Field
            label="Or paste an image URL"
            value={value}
            onChange={onChange}
            hint="JPG, PNG, WebP or AVIF, up to 5 MB."
          />
          {error && (
            <p className="font-body text-[12px] text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
