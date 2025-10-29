import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileInput, X, ArrowLeft, BrushCleaning, Download, PackageCheck } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cromaLogo from "@/components/media/croma.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Papa from "papaparse";
import { DialogTrigger } from "@radix-ui/react-dialog";

// funções base
const createBaseRowSimple = () => ({ name: "", size: "" });
const createBaseRowNumbered = () => ({ name: "", number: "", size: "", position: "" });

export function FormStep2() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state: {
      hasNumbering?: boolean;
      customerName?: string;
      orderId?: string;
      layoutId?: string;
      savedRows?: any[];
    };
  };

  const hasNumbering = state?.hasNumbering ?? false;
  const customerName = state?.customerName ?? "Sem nome";
  const orderId = state?.orderId ?? "0001";
  const layoutId = state?.layoutId ?? "L001";

  const [rows, setRows] = useState<any[]>(state?.savedRows ?? []);
  const [filledCount, setFilledCount] = useState(0);

  const [sendEmail, setSendEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [csvData, setCsvData] = useState<string | null>(null);

  useEffect(() => {
    if (rows.length === 0) {
      const baseCreator = hasNumbering ? createBaseRowNumbered : createBaseRowSimple;
      setRows(Array.from({ length: 10 }, baseCreator));
    }
  }, [hasNumbering]);

  useEffect(() => {
    const filled = rows.filter((r) => Object.values(r).some((v) => v !== "")).length;
    setFilledCount(filled);
  }, [rows]);

  const handleChange = (index: number, field: string, value: string) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    const baseCreator = hasNumbering ? createBaseRowNumbered : createBaseRowSimple;
    setRows(Array.from({ length: 10 }, baseCreator));
    setFilledCount(0);
  };

  const handleGoBack = () => {
    navigate("/", { state: { ...state, savedRows: rows } });
  };

  // geração de CSV e abertura do diálogo
  const handleConclude = () => {
    const csv = Papa.unparse(rows);
    setCsvData(csv);
    setShowSummary(true);
  };

  const handleCloseDialog = () => setShowSummary(false);

  return (
    <div className="dark bg-background min-h-screen text-white flex flex-col items-center py-10 px-3 relative">
      {/* botão voltar */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={handleGoBack}
          variant="outline"
          className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar
        </Button>
      </div>

      {/* cabeçalho info */}
      <div className="text-xs text-gray-400 mb-2 mt-14 text-center">
        <FontAwesomeIcon className="pr-1 pl-1" icon={"user"} style={{ color: "#ffcc00" }} />
        Cliente: <span className="text-gray-300">{customerName}</span>
        <FontAwesomeIcon className="px-1" icon={"grip-lines-vertical"} />
        <FontAwesomeIcon className="pr-1" icon={"hashtag"} style={{ color: "#ffcc00" }} />
        Pedido: <span className="text-gray-300">{orderId}</span>
        <FontAwesomeIcon className="px-1" icon={"grip-lines-vertical"} />
        <FontAwesomeIcon className="pr-1" icon={"paintbrush"} style={{ color: "#ffcc00" }} />
        Layout: <span className="text-gray-300">{layoutId}</span>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="w-full max-w-3xl text-white shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 p-4">
          <div className="w-full flex justify-end">
            <Button
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white flex gap-2 items-center"
            >
              <BrushCleaning size={16} />
              Limpar Tudo
            </Button>
          </div>

          <img src={cromaLogo} alt="Croma Logo" className="w-32" />

          <div className="text-center w-full">
            <CardTitle className="text-lg font-semibold">Cadastro de nomes</CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              {filledCount} de {rows.length} linhas preenchidas
            </p>
          </div>
        </CardHeader>

        {/* FORMULÁRIO */}
        <CardContent className="space-y-6 p-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-800 p-4 rounded-2xl items-center"
            >
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="absolute -right-3 -top-2 bg-neutral-700/80 text-gray-300 hover:bg-red-600 hover:text-white rounded-full p-1 shadow-sm transition-all duration-200"
                aria-label={`Remover linha ${index + 1}`}
              >
                <X size={18} />
              </button>

              <Input
                id={`name-${index}`}
                value={row.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                placeholder="Nome"
                className="bg-neutral-700 text-white"
              />

              {hasNumbering && (
                <Input
                  id={`number-${index}`}
                  type="number"
                  value={row.number}
                  onChange={(e) => handleChange(index, "number", e.target.value)}
                  placeholder="Número"
                  className="bg-neutral-700 text-white"
                />
              )}

              <Select
                value={row.size}
                onValueChange={(value) => handleChange(index, "size", value)}
              >
                <SelectTrigger className="w-full bg-neutral-700 text-white border-none focus:ring-2 focus:ring-yellow-500">
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                  <SelectGroup>
                    {[
                      "5G",
                      "4G",
                      "3G",
                      "GG",
                      "G",
                      "M",
                      "P",
                      "PP",
                      "16",
                      "14",
                      "12",
                      "10",
                      "8",
                      "6",
                      "4",
                      "2",
                    ].map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {hasNumbering && (
                <Select
                  value={row.position}
                  onValueChange={(value) => handleChange(index, "position", value)}
                >
                  <SelectTrigger className="w-full bg-neutral-700 text-white border-none focus:ring-2 focus:ring-yellow-500">
                    <SelectValue placeholder="Posição" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                    <SelectGroup>
                      <SelectItem value="Goleiro">Goleiro</SelectItem>
                      <SelectItem value="Linha">Linha</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </CardContent>

        {/* PARTE 3 */}
        <CardContent className="border-t border-neutral-800 mt-6 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(!!checked)}
            />
            <label htmlFor="sendEmail" className="cursor-pointer select-none text-sm">
              Enviar o formulário para e-mail
            </label>
          </div>

          {sendEmail && (
            <Input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-700 text-white"
            />
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleConclude}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              Concluir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="dark max-w-lg">
          <PackageCheck className="bg-amber-500" />
          <DialogTitle className="text-lg font-semibold text-yellow-400">
            Resumo do Pedido
          </DialogTitle>

          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <strong>Cliente:</strong> {customerName}
            </p>
            <p>
              <strong>Número do Pedido:</strong> {orderId}
            </p>
            <p>
              <strong>Número do Layout:</strong> {layoutId}
            </p>
            {sendEmail && (
              <p>
                <strong>E-mail:</strong> {email}
              </p>
            )}
          </div>

          <Accordion type="single" collapsible className="mt-4 border-t border-neutral-800 pt-4">
            <AccordionItem value="names">
              <AccordionTrigger className="text-yellow-400">
                Ver lista de nomes ({rows.length})
              </AccordionTrigger>
              <AccordionContent className="max-h-60 overflow-y-auto text-sm text-gray-300 space-y-1">
                {rows
                  .filter((r) => Object.values(r).some((v) => v))
                  .map((r, i) => (
                    <div key={i} className="border-b border-neutral-700 pb-1">
                      {r.name && (
                        <p>
                          <strong>Nome:</strong> {r.name}
                        </p>
                      )}
                      {"number" in r && r.number && (
                        <p>
                          <strong>Número:</strong> {r.number}
                        </p>
                      )}
                      {r.size && (
                        <p>
                          <strong>Tamanho:</strong> {r.size}
                        </p>
                      )}
                      {"position" in r && r.position && (
                        <p>
                          <strong>Posição:</strong> {r.position}
                        </p>
                      )}
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter>
            <div className="relative w-full flex items-center h-16">
              <div className="absolute rounded-full">
                <Button
                  onClick={() => {
                    const blob = new Blob([csvData || ""], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `pedido_${orderId}.csv`;
                    link.click();
                  }}
                  variant="outline"
                >
                  <Download color="white" />
                </Button>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2">
                <Button onClick={handleCloseDialog}>
                  Enviar
                  <FileInput />
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
