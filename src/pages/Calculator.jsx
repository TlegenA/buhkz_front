import { useState } from "react";
import { Calculator, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function fmt(n) {
  return n?.toLocaleString("ru-KZ") + " ₸";
}

function ResultRow({ label, value, variant = "default" }) {
  const colorClass =
    variant === "deduction" ? "text-red-600" :
    variant === "net" ? "text-green-700 font-bold text-base" :
    variant === "total" ? "font-bold text-base" :
    variant === "employer" ? "text-orange-600" : "";

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{label}</TableCell>
      <TableCell className={`text-right font-mono ${colorClass}`}>{fmt(value)}</TableCell>
    </TableRow>
  );
}

export default function CalculatorPage() {
  const [gross, setGross] = useState("200000");
  const [hasChild, setHasChild] = useState(false);
  const [childrenCount, setChildrenCount] = useState("1");
  const [entityType, setEntityType] = useState("ТОО");
  const [hasAlimony, setHasAlimony] = useState(false);
  const [alimonyChildren, setAlimonyChildren] = useState("1");
  const [executorFee, setExecutorFee] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const val = Number(gross);
    if (!gross || val <= 0 || !Number.isFinite(val)) {
      setError("Введите корректный оклад больше нуля");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.calcSalary({
        gross_salary: Number(gross),
        has_child_deduction: hasChild,
        children_count: hasChild ? Number(childrenCount) : 0,
        entity_type: entityType,
        alimony_children: hasAlimony ? Number(alimonyChildren) : 0,
        executor_fee: executorFee ? Number(executorFee) : 0,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Калькулятор зарплаты</h1>
        <p className="text-muted-foreground mt-1">Расчёт ОПВ, ИПН, ОСМС, СО и СН по ставкам {new Date().getFullYear()} года</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Форма */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Параметры расчёта
            </CardTitle>
            <CardDescription>Введите оклад до вычета налогов</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="gross">Оклад (тенге)</Label>
                <Input
                  id="gross"
                  type="number"
                  min="0"
                  step="1"
                  value={gross}
                  onChange={(e) => setGross(e.target.value)}
                  placeholder="200 000"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Тип организации</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ТОО">ТОО</SelectItem>
                    <SelectItem value="ИП">ИП</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasChild"
                    checked={hasChild}
                    onCheckedChange={setHasChild}
                  />
                  <Label htmlFor="hasChild" className="cursor-pointer">
                    Вычет на детей-инвалидов (882 МРП/год)
                  </Label>
                </div>

                {hasChild && (
                  <div className="ml-6 space-y-1.5">
                    <Label htmlFor="children">Количество детей</Label>
                    <Input
                      id="children"
                      type="number"
                      min="1"
                      max="10"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasAlimony"
                    checked={hasAlimony}
                    onCheckedChange={setHasAlimony}
                  />
                  <Label htmlFor="hasAlimony" className="cursor-pointer">
                    Удержание алиментов
                  </Label>
                </div>

                {hasAlimony && (
                  <div className="ml-6 space-y-1.5">
                    <Label htmlFor="alimonyChildren">Количество детей</Label>
                    <Select value={alimonyChildren} onValueChange={setAlimonyChildren}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ребёнок — 25%</SelectItem>
                        <SelectItem value="2">2 детей — 33%</SelectItem>
                        <SelectItem value="3">3 и более — 50%</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Удерживается с суммы «на руки» (ст. 139 Кодекса о браке и семье РК)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="executorFee">Вознаграждение суд. исполнителя (тенге)</Label>
                <Input
                  id="executorFee"
                  type="number"
                  min="0"
                  step="1"
                  value={executorFee}
                  onChange={(e) => setExecutorFee(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Фиксированная сумма, если есть частный судебный исполнитель</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Считаем..." : "Рассчитать"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Результат */}
        {result && (
          <div className="space-y-4">
            {/* Удержания с сотрудника */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Удержания с сотрудника
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Статья</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <ResultRow label="Оклад (gross)" value={result.gross} />
                    <ResultRow label="− ОПВ (10%)" value={result.opv} variant="deduction" />
                    <ResultRow label="− ВОСМС работника (2%)" value={result.osms_employee} variant="deduction" />
                    <ResultRow label="  База ИПН" value={result.ipn_base} />
                    <ResultRow label={`− ИПН (${result.ipn_base > 1000000 ? "10%/15%" : "10%"})`} value={result.ipn} variant="deduction" />
                    <ResultRow label="На руки (net)" value={result.net_salary} variant="net" />
                    {(result.alimony > 0 || result.executor_fee > 0) && (
                      <>
                        {result.alimony > 0 && (
                          <ResultRow
                            label={`− Алименты (${Math.round(result.alimony_rate * 100)}%)`}
                            value={result.alimony}
                            variant="deduction"
                          />
                        )}
                        {result.executor_fee > 0 && (
                          <ResultRow
                            label="− Вознаграждение суд. исполнителя"
                            value={result.executor_fee}
                            variant="deduction"
                          />
                        )}
                        <ResultRow label="К выдаче сотруднику" value={result.salary_after_alimony} variant="net" />
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Расходы работодателя */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  Дополнительные расходы работодателя
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Статья</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <ResultRow label="Оклад" value={result.gross} />
                    <ResultRow label="+ ОПВР (3.5%)" value={result.employer.opvr} variant="employer" />
                    <ResultRow label="+ СО (5%)" value={result.employer.so} variant="employer" />
                    <ResultRow label="+ ООСМС работодателя (3%)" value={result.employer.osms_employer} variant="employer" />
                    <ResultRow label="+ СН (6%)" value={result.employer.sn} variant="employer" />
                    <ResultRow label="Итого расход на сотрудника" value={result.employer.total_cost} variant="total" />
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && (
          <div className="flex items-center justify-center rounded-xl border border-dashed text-muted-foreground min-h-48">
            <div className="text-center space-y-2">
              <Calculator className="h-10 w-10 mx-auto opacity-25" />
              <p className="text-sm">Введите оклад и нажмите «Рассчитать»</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
