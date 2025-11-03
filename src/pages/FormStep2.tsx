import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  FileInput,
  X,
  ArrowLeft,
  BrushCleaning,
  PackageCheck,
  AlertTriangle,
  Loader2,
  FileDown,
  CheckCircle2,
} from "lucide-react";
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
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Papa from "papaparse";
import jsPDF from "jspdf";

// funções base
const createBaseRowSimple = () => ({ name: "", size: "" });
const createBaseRowNumbered = () => ({
  name: "",
  number: "",
  size: "",
  position: "",
});

export function FormStep2() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state: {
      hasNumbering?: boolean;
      customerName?: string;
      customerEmail?: string;
      numOrder?: string;
      numLayout?: string;
      savedRows?: any[];
    };
  };

  const hasNumbering = state?.hasNumbering ?? false;
  const customerName = state?.customerName ?? "Sem nome";
  const customerEmail = state?.customerEmail ?? "Sem e-mail";
  const orderId = state?.numOrder ?? "0001";
  const layoutId = state?.numLayout ?? "L001";

  const [rows, setRows] = useState<any[]>(state?.savedRows ?? []);
  const [filledCount, setFilledCount] = useState(0);
  const [sendEmail, setSendEmail] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [_, setCsvData] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [completed, setCompleted] = useState(false);

  // gera linhas base
  useEffect(() => {
    if (rows.length === 0) {
      const baseCreator = hasNumbering ? createBaseRowNumbered : createBaseRowSimple;
      setRows(Array.from({ length: 10 }, baseCreator));
    }
  }, [hasNumbering]);

  // conta apenas linhas preenchidas
  useEffect(() => {
    const filled = rows.filter((r) =>
      Object.values(r).some((v) => v !== "" && v !== null && v !== undefined)
    ).length;
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

  // Geração de CSV
  const handleConclude = () => {
    const filled = rows.filter((r) =>
      Object.values(r).some((v) => v !== "" && v !== null && v !== undefined)
    );

    if (filled.length < 5) {
      alert("É necessário preencher pelo menos 5 nomes antes de finalizar o formulário.");
      return;
    }

    const headerLines = [
      ["Planilha de Personalização"],
      [""],
      [`Cliente: ${customerName}`],
      [`E-mail: ${customerEmail}`],
      [`Nº do Pedido: ${orderId}`],
      [`Nº do Layout: ${layoutId}`],
      [""],
    ];

    const dataLines = [
      hasNumbering ? ["Nome", "Número", "Tamanho", "Posição"] : ["Nome", "Tamanho"],
      ...filled.map((r) =>
        hasNumbering ? [r.name, r.number, r.size, r.position] : [r.name, r.size]
      ),
    ];

    const finalData = [...headerLines, ...dataLines];
    const csv = Papa.unparse(finalData, { delimiter: ";" });

    setCsvData(csv);
    setShowSummary(true);
    setAccepted(false);
  };

  const handleFinalize = () => {
    if (!accepted) {
      alert("Você precisa aceitar a declaração antes de prosseguir.");
      return;
    }
    setIsFinalizing(true);
    setTimeout(() => {
      setIsFinalizing(false);
      setCompleted(true);
    }, 3500);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Resumo do Pedido - Croma", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Cliente: ${customerName}`, 20, 35);
    doc.text(`E-mail: ${customerEmail}`, 20, 42);
    doc.text(`Pedido: ${orderId}`, 20, 49);
    doc.text(`Layout: ${layoutId}`, 20, 56);
    doc.text(" ", 20, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Lista de nomes:", 20, 68);

    let y = 75;
    rows.forEach((r, i) => {
      const line = Object.values(r)
        .filter((v) => v)
        .join("  |  ");
      doc.text(`${i + 1}. ${line}`, 20, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`pedido_${orderId}.pdf`);
  };

  const handleFinish = () => {
    setShowSummary(false);
    navigate("/");
  };

  const filledRows = rows.filter((r) =>
    Object.values(r).some((v) => v !== "" && v !== null && v !== undefined)
  );

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

        {/* ENVIO */}
        <CardContent className="border-t border-neutral-800 mt-6 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(!!checked)}
            />
            <label htmlFor="sendEmail" className="cursor-pointer select-none text-sm">
              Receber uma cópia do formulário por e-mail
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleConclude}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="dark max-w-lg">
          {!isFinalizing && !completed ? (
            <>
              <DialogTitle className="text-lg font-semibold text-yellow-400">
                <PackageCheck className="w-full" color="#ffffff" size={120} />
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
                <p>
                  <strong>E-mail:</strong> {customerEmail}
                </p>
              </div>

              <Accordion
                type="single"
                collapsible
                className="mt-4 border-t border-neutral-800 pt-4"
              >
                <AccordionItem value="names">
                  <AccordionTrigger className="text-yellow-400">
                    Ver lista de nomes ({filledRows.length})
                  </AccordionTrigger>
                  <AccordionContent className="max-h-60 overflow-y-auto text-sm text-gray-300 space-y-1">
                    {filledRows.map((r, i) => (
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

              {/* ALERTA DE ACEITE */}
              <Alert
                variant="destructive"
                className="mt-6 w-full flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#561719] border-[#ed1b24] text-white rounded-lg p-4"
              >
                <AlertTriangle className="text-[#ed1b24] w-6 h-6" />
                <div className="flex-1">
                  <AlertTitle className="text-white font-semibold">
                    Declaração de conferência e autorização
                  </AlertTitle>
                  <AlertDescription className="text-sm text-zinc-300 mt-1 leading-relaxed">
                    Confirmo que revisei cuidadosamente todos os nomes, tamanhos e informações
                    contidas neste formulário. Autorizo o início da produção com base nesses dados e
                    reconheço que eventuais erros ou omissões após este envio são de minha inteira
                    responsabilidade.
                  </AlertDescription>

                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox
                      id="accept"
                      checked={accepted}
                      onCheckedChange={(checked) => setAccepted(!!checked)}
                    />
                    <label htmlFor="accept" className="text-sm cursor-pointer text-zinc-200">
                      Declaro estar ciente e de acordo.
                    </label>
                  </div>
                </div>
              </Alert>

              <DialogFooter>
                <div className="relative w-full flex items-center h-16 justify-center">
                  <Button
                    onClick={handleFinalize}
                    disabled={!accepted}
                    className={`${
                      accepted
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-neutral-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Enviar
                    <FileInput className="ml-1" />
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : isFinalizing ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-300 animate-pulse">
              <Loader2 className="animate-spin h-8 w-8 text-yellow-400 mb-3" />
              <p>Gerando arquivos CSV e PDF...</p>
              <p>Enviando para a equipe da Croma...</p>
            </div>
          ) : completed ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <CheckCircle2 className="text-green-400 w-10 h-10 mb-3" />
              <p className="text-zinc-300 mb-4">
                Tudo foi processado com sucesso! Agora você pode baixar o PDF ou encerrar o
                processo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center gap-2"
                >
                  <FileDown size={18} />
                  Baixar PDF
                </Button>

                <Button
                  onClick={handleFinish}
                  variant="outline"
                  className="text-white border-neutral-700 hover:bg-neutral-800"
                >
                  Terminei tudo por aqui
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
