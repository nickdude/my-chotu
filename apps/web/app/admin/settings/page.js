"use client";

import { useEffect, useState } from "react";
import { fetchSettings, updateSetting } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, X } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);
  const [value,    setValue]    = useState("");
  const [saving,   setSaving]   = useState(false);

  const load = () => fetchSettings().then((r) => setSettings(r.data ?? [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const startEdit = (s) => {
    setEditing(s.key);
    setValue(typeof s.value === "object" ? JSON.stringify(s.value) : String(s.value));
  };

  const cancelEdit = () => { setEditing(null); setValue(""); };

  const handleSave = async (key) => {
    setSaving(true);
    try {
      let parsed;
      try { parsed = JSON.parse(value); } catch { parsed = isNaN(value) ? value : Number(value); }
      await updateSetting(key, { value: parsed });
      setEditing(null); load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Platform settings" description="Global configuration values that control platform behaviour" />

      {loading ? <TableSkeleton rows={5} /> : (
        <div className="rounded-xl border border-border bg-white overflow-hidden divide-y divide-border">
          {settings.map((s) => (
            <div key={s.key} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFFDF9]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium text-[#152744]">{s.key}</p>
                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
              </div>
              {editing === s.key ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-40 h-7 text-sm"
                    autoFocus
                  />
                  <Button size="icon" className="h-7 w-7" onClick={() => handleSave(s.key)} disabled={saving}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {typeof s.value === "object" ? JSON.stringify(s.value) : String(s.value)}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(s)}>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
