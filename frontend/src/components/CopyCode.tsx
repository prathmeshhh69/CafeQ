import { Copy } from "lucide-react";
import { useStore } from "../lib/store";
import { Button } from "./ui";

export default function CopyCode({ code, label }: { code: string; label: string }) {
  const { toast } = useStore();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast(`${label} copied.`);
    } catch {
      toast("Copy is unavailable. You can select and copy the code manually.", "info");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="select-all break-all font-mono text-2xl font-bold tracking-wider text-ink">{code}</span>
      <Button type="button" size="sm" variant="secondary" onClick={() => { void copy(); }} aria-label={`Copy ${label.toLowerCase()}`}>
        <Copy className="h-4 w-4" /> Copy
      </Button>
    </div>
  );
}
