import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, Database, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function UploadPanel({ onLoaded }: { onLoaded?: (name: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const accept = (name: string) => {
    setFileName(name);
    onLoaded?.(name);
    toast.success("Light curve ingested", { description: name });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) accept(f.name);
        }}
        className={cn(
          "glass-card flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all",
          dragging ? "border-primary glow-cyan" : "border-border",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.fits,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) accept(f.name);
          }}
        />
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-cosmic opacity-90">
          <UploadCloud className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold">Drop light curve file</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Drag & drop a TESS light curve, or browse. Supports CSV, FITS and TXT formats.
        </p>
        <Button variant="cosmic" className="mt-5" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>

        {fileName ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            <FileCheck2 className="h-4 w-4" />
            <span className="max-w-[200px] truncate">{fileName}</span>
            <button onClick={() => setFileName(null)} className="ml-1 opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="glass-card flex flex-col rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
            <Database className="h-4 w-4" />
          </div>
          <h3 className="font-display text-lg font-semibold">Sample Datasets</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          No file handy? Load a curated TESS target.
        </p>
        <div className="mt-4 space-y-3">
          {[
            { id: "TIC 307210830", note: "Confirmed hot Jupiter · Sector 42" },
            { id: "TIC 150428135", note: "Candidate · Sector 18" },
            { id: "TIC 38846515", note: "Eclipsing binary · Sector 5" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => accept(`${d.id}.csv`)}
              className="group flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-secondary"
            >
              <div>
                <p className="font-mono text-sm font-medium">{d.id}</p>
                <p className="text-xs text-muted-foreground">{d.note}</p>
              </div>
              <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Load →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
