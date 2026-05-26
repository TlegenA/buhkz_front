import { useState } from "react";
import { Briefcase, AlertCircle, TrendingUp, ShieldAlert } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const MRP_2026 = 4_325;
const NDS_THRESHOLD = 30_000 * MRP_2026; // 129 750 000 тг (ст. 82 НК РК)

function fmt(n) {
  return n?.toLocaleString("ru-KZ") + " ₸";
}

function pctColor(pct) {
  if (pct >= 100) return "bg-red-500";
  if (pct >= 85) return "bg-orange-400";
  if (pct >= 60) return "bg-yellow-400";
  return "bg-green-500";
}

// ─── ИП калькулятор ────────────────────────────────────────────────────────────

function IpTaxForm() {
  const [income, setIncome] = useState("5000000");
  const [mode, setMode] = useState("simplified");
  const [months, setMonths] = useState("6");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const val = Number(income);
    if (!val || val <= 0) {
      setError("Введите корректную сумму дохода");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(await api.calcIp({ income: val, mode, months: Number(months) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const limitPct = result ? Math.min(100, (result.income / result.income_limit) * 100) : 0;
  const isOverLimit = result && result.income > result.income_limit;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Параметры расчёта
          </CardTitle>
          <CardDescription>
            Расчёт налогов ИП по НК РК 2026 г.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label>Режим налогообложения</Label>
              <Select value={mode} onValueChange={(v) => { setMode(v); setResult(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simplified">Упрощённая декларация (3%) — форма 910</SelectItem>
                  <SelectItem value="patent">Патент (1%) — форма 911</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Период (месяцев)</Label>
              <Select value={months} onValueChange={(v) => { setMonths(v); setResult(null); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mode === "simplified"
                    ? <>
                        <SelectItem value="6">6 мес. (полугодие)</SelectItem>
                      </>
                    : [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <SelectItem key={m} value={String(m)}>{m} мес.</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {mode === "simplified"
                  ? "Упрощёнка сдаётся дважды в год — за каждое полугодие"
                  : "Патент можно купить от 1 до 12 месяцев"}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ip-income">Доход за период (тенге)</Label>
              <Input
                id="ip-income"
                type="number" min="0" step="1"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="5 000 000"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />{error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Считаем..." : "Рассчитать"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-4">
          {isOverLimit && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Доход превышает лимит {fmt(result.income_limit)} для{" "}
                {result.mode === "simplified" ? "упрощёнки" : "патента"}.
                Необходимо перейти на другой режим налогообложения.
              </span>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Налоги к уплате за {result.period_months} мес.
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
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      {result.mode === "simplified" ? "Единый налог (3%)" : "Стоимость патента (1%)"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-orange-600">{fmt(result.ip_tax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">ОПВ за себя (10%)</TableCell>
                    <TableCell className="text-right font-mono text-orange-600">{fmt(result.opv)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">ВОСМС за себя (5% от 1.4 МЗП)</TableCell>
                    <TableCell className="text-right font-mono text-orange-600">{fmt(result.osms)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Итого к уплате</TableCell>
                    <TableCell className="text-right font-mono font-bold text-base">{fmt(result.total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground text-sm">Доход за период</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(result.income)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground text-sm">Налоговая нагрузка</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {result.income > 0 ? ((result.total / result.income) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Лимит дохода за период</span>
                <span className="font-mono">{fmt(result.income_limit)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pctColor(limitPct)}`}
                  style={{ width: `${limitPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{limitPct.toFixed(1)}% использовано</span>
                <span>
                  {isOverLimit
                    ? <span className="text-red-600 font-medium">Лимит превышен на {fmt(result.income - result.income_limit)}</span>
                    : <>Остаток: {fmt(result.income_remaining)}</>}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed text-muted-foreground min-h-48">
          <div className="text-center space-y-2">
            <Briefcase className="h-10 w-10 mx-auto opacity-25" />
            <p className="text-sm">Введите данные и нажмите «Рассчитать»</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Порог НДС ─────────────────────────────────────────────────────────────────

function NdsThresholdCalc() {
  const [turnover, setTurnover] = useState("");
  const amount = Number(turnover) || 0;
  const pct = Math.min(100, (amount / NDS_THRESHOLD) * 100);
  const remaining = Math.max(0, NDS_THRESHOLD - amount);
  const exceeded = amount >= NDS_THRESHOLD;

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Контроль порога НДС
          </CardTitle>
          <CardDescription>
            При превышении 30 000 МРП ({fmt(NDS_THRESHOLD)}) в год необходима постановка на учёт по НДС
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="turnover">Годовой оборот (тенге)</Label>
            <Input
              id="turnover"
              type="number" min="0" step="1"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              placeholder="50 000 000"
            />
          </div>

          {amount > 0 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Использовано от лимита</span>
                  <span className="font-mono font-medium">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pctColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Текущий оборот</span>
                  <span className="font-mono">{fmt(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Порог НДС (20 000 МРП)</span>
                  <span className="font-mono">{fmt(NDS_THRESHOLD)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-3">
                  {exceeded ? (
                    <>
                      <span className="text-red-600">Превышение</span>
                      <span className="font-mono text-red-600">{fmt(amount - NDS_THRESHOLD)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">Запас до порога</span>
                      <span className="font-mono text-green-700">{fmt(remaining)}</span>
                    </>
                  )}
                </div>
              </div>

              {exceeded ? (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Порог превышен. Необходимо встать на учёт по НДС в течение 10 рабочих дней
                    (ст. 82 НК РК). Ставка НДС — 16%.
                  </span>
                </div>
              ) : pct >= 85 ? (
                <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Оборот приближается к порогу. Рекомендуется заранее подготовиться к постановке на учёт по НДС.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <Badge variant="success" className="mt-0.5 shrink-0 h-fit">OK</Badge>
                  <span>Оборот в пределах нормы. Постановка на учёт по НДС не требуется.</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Страница ──────────────────────────────────────────────────────────────────

export default function IpCalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Инструменты для ИП</h1>
        <p className="text-muted-foreground mt-1">
          Расчёт налогов ИП и контроль порога НДС на {new Date().getFullYear()} год
        </p>
      </div>

      <Tabs defaultValue="tax">
        <TabsList>
          <TabsTrigger value="tax" className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            Налоги ИП
          </TabsTrigger>
          <TabsTrigger value="nds" className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            Порог НДС
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tax"><IpTaxForm /></TabsContent>
        <TabsContent value="nds"><NdsThresholdCalc /></TabsContent>
      </Tabs>
    </div>
  );
}
