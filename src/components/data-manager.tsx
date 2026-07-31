"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Upload,
  FileJson,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface ExportData {
  version: string;
  exportDate: string;
  data: {
    favorites?: string[]; // story IDs
    savedStories?: string[];
    readingLists?: any[];
    readingStats?: any;
    achievements?: any[];
    bookmarks?: any[];
    searchHistory?: any[];
    settings?: {
      theme?: string;
      fontSize?: string;
      lineHeight?: string;
    };
    collections?: string[]; // favorite collection IDs
  };
}

// Keys to export/import
const STORAGE_KEYS = {
  favorites: "facelove-favorites",
  saved: "facelove-saved-stories",
  lists: "facelove-reading-lists",
  stats: "facelove-reading-stats",
  achievements: "facelove-achievements",
  bookmarks: "facelove-bookmarks",
  searchHistory: "facelove-search-history",
  collections: "facelove-favorite-collections",
  theme: "facelove-theme", // from next-themes
  fontSize: "story-font-size",
  lineHeight: "story-line-height",
};

// Get all exportable data
function getAllData(): ExportData {
  const data: ExportData["data"] = {};

  try {
    // Try to load each key
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      try {
        const value = localStorage.getItem(storageKey);
        if (value) {
          (data as any)[key] = JSON.parse(value);
        }
      } catch {
        // Skip invalid entries
      }
    }
  } catch (error) {
    console.error("Error loading data for export:", error);
  }

  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    data,
  };
}

// Import data
function importData(data: ExportData): {
  success: boolean;
  imported: string[];
  errors: string[];
  skipped: string[];
} {
  const imported: string[] = [];
  const errors: string[] = [];
  const skipped: string[] = [];

  if (!data.version) {
    errors.push("Formato de arquivo inválido - versão não encontrada");
    return { success: false, imported, errors, skipped };
  }

  if (!data.data) {
    errors.push("Arquivo vazio ou corrompido");
    return { success: false, imported, errors, skipped };
  }

  // Import each data type
  for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
    const value = (data.data as any)[key];
    
    if (value === undefined || value === null) {
      continue; // Skip missing keys
    }

    // Validate and save
    if (typeof value === "string" && !value.trim()) {
      skipped.push(key);
      continue;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      imported.push(key);
    } catch (error) {
      errors.push(`${key}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    imported,
    errors,
    skipped,
  };
}

// Generate filename with date
function generateFilename(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR").replace(/\//g, "-");
  return `facelove-backup-${dateStr}.json`;
}

// Download JSON file
function downloadJSON(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Main Data Manager Component
export function DataManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExportDate, setLastExportDate] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    try {
      const data = getAllData();
      
      // Count items
      let totalItems = 0;
      for (const key of Object.keys(data.data)) {
        const val = data.data[key as any];
        if (Array.isArray(val)) totalItems += val.length;
        else if (val && typeof val === "object") totalItems += Object.keys(val).length;
        else if (val) totalItems += 1;
      }
      
      downloadJSON(data, generateFilename());
      setLastExportDate(new Date().toLocaleString("pt-BR"));
      
      toast.success("Backup exportado!", {
        description: `${totalItems} itens salvos no arquivo`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao criar backup");
    }
  }, []);

  const handleImport = async (
    file: File
  ): Promise<{ success: boolean; imported: string[]; errors: string[] }> => {
    try {
      const text = await readFileAsText(file);
      const data: ExportData = JSON.parse(text);
      const result = importData(data);
      
      if (result.success) {
        toast.success("Dados importados!", {
          description: `${result.imported.length} categorias restauradas`,
          duration: 5000,
        });
        
        // Dispatch event for other components to refresh
        window.dispatchEvent(new CustomEvent("dataImported"));
      } else {
        toast.error("Erros na importação", {
          description: `${result.errors.length} falhas encontradas`,
          duration: 6000,
        });
      }
      
      return result;
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Arquivo inválido. Verifique o formato JSON.");
      throw error;
    }
  };

  const handleClearAll = () => {
    if (
      !confirm(
        "⚠️ Atenção! Isso apagará TODOS os seus dados salvos localmente:\n\n• Favoritos\n• Históricos\n• Listas de Leitura\n• Marcadores\n• Estatísticas\n• Conquistas\n\nEsta ação NÃO pode ser desfeita. Deseja continuar?"
      )
    ) {
      return;
    }

    try {
      // Clear all FaceLove keys
      for (const storageKey of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(storageKey);
      }

      toast.success("Todos os dados foram limpos!", {
        duration: 4000,
      });

      // Dispatch event
      window.dispatchEvent(new CustomEvent("dataCleared"));
    } catch (error) {
      console.error("Clear error:", error);
      toast.error("Erro ao limpar dados");
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <Database className="w-4 h-4" />
        Gerenciar Dados
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              Gerenciamento de Dados
            </DialogTitle>
            <DialogDescription>
              Exporte, importe ou limpe seus dados locais do FaceLove
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Stats Summary */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">∞</p>
                    <p className="text-xs text-muted-foreground">Categorias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">
                      {(() => {
                        let count = 0;
                        for (const key of Object.values(STORAGE_KEYS)) {
                          const val = localStorage.getItem(key);
                          if (val) {
                            try {
                              const parsed = JSON.parse(val);
                              count += Array.isArray(parsed)
                                ? parsed.length
                                : Object.keys(parsed).length;
                            } catch {}
                          }
                        }
                        return count;
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">Itens Salvos</p>
                  </div>
                </div>

                {lastExportDate && (
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Último backup: {lastExportDate}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Export */}
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={handleExport}
              >
                <Download className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Exportar</span>
                <span className="text-[10px] text-muted-foreground">.json</span>
              </Button>

              {/* Import */}
              <label className="h-auto py-4 flex-col gap-2 cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      await handleImport(file);
                    }
                    e.target.value = ""; // Reset input
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-full py-4 flex-col gap-2 pointer-events-none"
                  asChild
                >
                  <span>Upload</span>
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Importar</span>
                  <span className="text-[10px] text-muted-foreground">.json</span>
                </Button>
                <label
                  htmlFor="import-file-input"
                  className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                />
              </label>

              {/* Clear */}
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 text-destructive hover:text-destructive hover:border-destructive/50"
                onClick={handleClearAll}
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Limpar</span>
                <span className="text-[10px] text-muted-foreground">⚠️</span>
              </Button>
            </div>

            {/* Info Section */}
            <div className="space-y-3 text-xs text-muted-foreground bg-muted/20 rounded-lg p-4">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                O que é incluído:
              </p>
              
              <ul className="space-y-1.5 ml-4 list-disc">
                <li>Favoritos e histórias salvas</li>
                <li>Listas de leitura personalizadas</li>
                <li>Marcadores de página</li>
                <li>Histórico de buscas</li>
                <li>Estatísticas de leitura</li>
                <li>Conquistas e pontos</li>
                <li>Configurações (tema, fonte)</li>
              </ul>

              <Separator />

              <div className="flex items-start gap-2 pt-1">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">Dica:</p>
                  <p>
                    Exporte regularmente para fazer backup dos seus dados.
                    O arquivo JSON pode ser importado em qualquer dispositivo 
                    com FaceLove.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick action buttons component
export function QuickDataActions({ className }: { className?: string }) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      const data = getAllData();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setLastAction("copied");
      toast.success("Dados copiados para área de transferência!");
    } catch {
      setLastAction(null);
      toast.error("Erro ao copiar dados");
    }
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DataManager />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        title="Copiar todos os dados"
      >
        <Copy className={cn(
          "w-4 h-4",
          lastAction === "copied" ? "text-green-500" : ""
        )} />
      </Button>
    </div>
  );
}

// Hook for listening to data changes
export function useDataManager() {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Check if there's any data
    const checkData = () => {
      let count = 0;
      for (const key of Object.values(STORAGE_KEYS)) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            count += Array.isArray(parsed)
              ? parsed.length
              : Object.keys(parsed).length;
          } catch {}
        }
      }
      setHasData(count > 0);
    };

    checkData();

    const handleChange = () => checkData();
    window.addEventListener("storage", handleChange);
    window.addEventListener("dataImported", handleChange);
    window.addEventListener("dataCleared", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("dataImported", handleChange);
      window.removeEventListener("dataCleared", handleChange);
    };
  }, []);

  return { hasData };
}
