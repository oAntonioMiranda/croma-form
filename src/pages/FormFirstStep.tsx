import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { Label } from "@radix-ui/react-label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import  cromaLogo from "@/components/media/croma.svg";


library.add(fas, far, fab);

export function App() {
  const navigate = useNavigate();

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      numOrder: "",
      numLayout: "",
      customerName: "",
      hasNumbering: false,
    },
  });

  const onSubmit = (data: any) => {
    console.log("Dados do mini cadastro:", data);
    // Redireciona para a próxima etapa e envia os dados
    navigate("/step2", { state: data });
  };

  return (
    <div className="dark bg-background min-h-screen flex items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex justify-center">
        <Card className="w-full max-w-md shadow-lg border-border bg-card p-6">
          <div className="flex flex-col items-center">
            <img src={cromaLogo} alt="croma Logo" className="w-32"/>
          </div>
          <CardHeader>
            <CardTitle>
              <FontAwesomeIcon className="pr-1" icon={"file-lines"} style={{ color: "#ffcc00" }} />
              Mini Cadastro
            </CardTitle>
            <CardDescription>
              Preencha as informações básicas do pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Número do pedido */}
              <Label htmlFor="numOrder">
                <FontAwesomeIcon className="pr-1 pl-1" icon={"hashtag"} style={{ color: "#ffcc00" }} />
                Número do pedido
              </Label>
            <div className="flex flex-col items-center">
              <Input  className="mt-1"
                type="number"
                id="numOrder"
                placeholder="Ex.: 1092-09"
                {...form.register("numOrder", {
                  valueAsNumber: true,
                  required: "Precisamos do número do pedido",
                })}
              />
              {form.formState.errors.numOrder && (
                <Alert variant="destructive" className="m-2">
                  <AlertCircle className="" />
                  <AlertTitle>Campo vazio</AlertTitle>
                  <AlertDescription>
                    {String(form.formState.errors.numOrder?.message)}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Número do layout */}
              <Label htmlFor="numLayout" className="">
                <FontAwesomeIcon className="pr-1 pl-1" icon={"paintbrush"} style={{ color: "#ffcc00" }} />
                Número do layout
              </Label>
            <div className="flex flex-col items-center">
              <Input
              className="mt-1"
                type="number"
                id="numLayout"
                placeholder="Ex.: 09909.987"
                {...form.register("numLayout", {
                  valueAsNumber: true,
                  required: "Precisamos do número do layout",
                })}
              />
              {form.formState.errors.numLayout && (
                <Alert variant="destructive" className="m-2">
                  <AlertCircle className="" />
                  <AlertTitle>Campo vazio</AlertTitle>
                  <AlertDescription>
                    {String(form.formState.errors.numLayout?.message)}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Nome do cliente */}
              <Label htmlFor="customerName" className="p-2">
                <FontAwesomeIcon className="pr-1 pl-1" icon={"user"} style={{ color: "#ffcc00" }}/>
                Cliente responsável
              </Label>
            <div className="flex flex-col items-center">
              <Input
              className="mt-1 "
                type="text"
                id="customerName"
                placeholder="Ex.: Antônio Miranda"
                {...form.register("customerName", {
                  required: "Precisamos do nome de um responsável",
                  minLength: {
                    value: 2,
                    message: "Escreva um nome com mais de duas letras.",
                  },
                })}
              />
              {form.formState.errors.customerName && (
                <Alert variant="destructive" className="m-2 ">
                  <AlertCircle className="" />
                  <AlertTitle>Campo obrigatório</AlertTitle>
                  <AlertDescription>
                    {String(form.formState.errors.customerName?.message)}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Checkbox numeração */}
            <div className="">
              <Controller
                name="hasNumbering"
                control={form.control}
                defaultValue={false}
                render={({ field }) => (
                  <div className="">
                    <Checkbox
                    className="mr-2 ml-2"
                      id="hasNumbering"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    <Label htmlFor="hasNumbering" className="cursor-pointer">
                      Numeração
                    </Label>
                  </div>                 
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center ">
            <Button type="submit" className="w-full bg-white hover:bg-primary">
              Próximo
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
