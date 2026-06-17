import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Wallet, Baby, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MZP_2026 = 85_000;
const MRP_2026 = 4_325;
const MAX_INCOME = 7 * MZP_2026; // 595 000

function fmt(n) {
  return Math.round(n).toLocaleString("ru-KZ") + " ₸";
}

// Коэффициент стажа участия (КСУ) и срок выплат
function getKsu(months) {
  if (months < 6)  return null;
  if (months < 12) return { ksu: 0.70, duration: 1 };
  if (months < 24) return { ksu: 0.75, duration: 2 };
  if (months < 36) return { ksu: 0.85, duration: 3 };
  if (months < 48) return { ksu: 0.90, duration: 4 };
  if (months < 60) return { ksu: 0.95, duration: 5 };
  // 60+: базовый 1.00 + 0.02 за каждые 12 мес. свыше 60, max 1.30
  const ksu = Math.min(1.30, 1.00 + Math.floor((months - 60) / 12) * 0.02);
  return { ksu, duration: 6 };
}

const KSU_TABLE = [
  ["6–12 мес.",  "0,70", "1 мес."],
  ["12–24 мес.", "0,75", "2 мес."],
  ["24–36 мес.", "0,85", "3 мес."],
  ["36–48 мес.", "0,90", "4 мес."],
  ["48–60 мес.", "0,95", "5 мес."],
  ["60–72 мес.", "1,00", "6 мес."],
  ["72+ мес.",   "1,02–1,30", "6 мес."],
];

// ── Пособие по безработице ──────────────────────────────────────────────────

function UnemploymentCalc() {
  const [income,  setIncome]  = useState("200000");
  const [months,  setMonths]  = useState("36");
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  function calculate(e) {
    e.preventDefault();
    const incomeVal = Number(income);
    const monthsVal = Number(months);

    if (!incomeVal || incomeVal <= 0) {
      setError("Введите корректную сумму дохода");
      return;
    }
    if (!monthsVal || monthsVal < 6) {
      setError("Минимальный стаж для получения пособия — 6 месяцев");
      return;
    }

    const ksuData = getKsu(monthsVal);
    const effectiveIncome = Math.min(incomeVal, MAX_INCOME);
    const monthly = effectiveIncome * 0.45 * ksuData.ksu;

    setError(null);
    setResult({
      income: incomeVal,
      effectiveIncome,
      capped: incomeVal > MAX_INCOME,
      ksu: ksuData.ksu,
      duration: ksuData.duration,
      monthly,
      total: monthly * ksuData.duration,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Параметры расчёта
          </CardTitle>
          <CardDescription>
            Социальная выплата при потере работы (ГФСС) — формула: доход × 0,45 × КСУ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={calculate} className="space-y-5" noValidate>

            <div className="space-y-1.5">
              <Label htmlFor="unemp-income">Среднемесячный доход за 24 мес. (тенге)</Label>
              <Input
                id="unemp-income"
                type="number" min="0" step="1"
                value={income}
                onChange={(e) => { setIncome(e.target.value); setResult(null); }}
                placeholder="200 000"
              />
              <p className="text-xs text-muted-foreground">
                Доход, с которого уплачивались соцотчисления. Максимум: {fmt(MAX_INCOME)} (7 МЗП)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unemp-months">Стаж участия в ГФСС (месяцев)</Label>
              <Input
                id="unemp-months"
                type="number" min="6" max="600" step="1"
                value={months}
                onChange={(e) => { setMonths(e.target.value); setResult(null); }}
                placeholder="36"
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Минимальный стаж — 6 месяцев за последние 2 года
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />{error}
              </div>
            )}

            <Button type="submit" className="w-full">Рассчитать</Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-blue-500" />
                Результат
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Показатель</TableHead>
                    <TableHead className="text-right">Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Среднемесячный доход</TableCell>
                    <TableCell className="text-right font-mono">{fmt(result.income)}</TableCell>
                  </TableRow>
                  {result.capped && (
                    <TableRow>
                      <TableCell className="text-muted-foreground">Расчётный доход (лимит 7 МЗП)</TableCell>
                      <TableCell className="text-right font-mono text-orange-600">{fmt(result.effectiveIncome)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="text-muted-foreground">Коэффициент замещения</TableCell>
                    <TableCell className="text-right font-mono">45%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Коэффициент стажа (КСУ)</TableCell>
                    <TableCell className="text-right font-mono">{result.ksu.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Срок выплат</TableCell>
                    <TableCell className="text-right font-mono">{result.duration} мес.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Ежемесячная выплата</TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-700 text-base">{fmt(result.monthly)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Итого за весь период</TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-700">{fmt(result.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Info className="h-4 w-4" />
                Таблица коэффициентов стажа
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Стаж участия</TableHead>
                    <TableHead className="text-center">КСУ</TableHead>
                    <TableHead className="text-center">Срок</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {KSU_TABLE.map(([stazh, ksu, dur]) => (
                    <TableRow key={stazh}>
                      <TableCell className="text-sm text-muted-foreground">{stazh}</TableCell>
                      <TableCell className="text-center text-sm">{ksu}</TableCell>
                      <TableCell className="text-center text-sm">{dur}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed text-muted-foreground min-h-48">
          <div className="text-center space-y-2">
            <Wallet className="h-10 w-10 mx-auto opacity-25" />
            <p className="text-sm">Введите данные и нажмите «Рассчитать»</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Декретные выплаты ───────────────────────────────────────────────────────

const MONTHLY_FIXED = {
  1: Math.round(5.76 * MRP_2026),  // 24 912
  2: Math.round(6.81 * MRP_2026),  // 29 426
  3: Math.round(7.85 * MRP_2026),  // 33 901
  4: Math.round(8.90 * MRP_2026),  // 38 493
};

function MaternityCalc() {
  const [employed,    setEmployed]    = useState(true);
  const [income,      setIncome]      = useState("200000");
  const [complicated, setComplicated] = useState(false);
  const [childNum,    setChildNum]    = useState("1");
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);

  function calculate(e) {
    e.preventDefault();

    const num = Number(childNum);
    let brPayout = null;
    let monthlyGfss = null;

    if (employed) {
      const incomeVal = Number(income);
      if (!incomeVal || incomeVal <= 0) {
        setError("Введите корректную сумму дохода");
        return;
      }
      const eff = Math.min(incomeVal, MAX_INCOME);
      const daysCoeff = complicated ? 140 / 30 : 126 / 30;
      const gross = eff * daysCoeff;
      const opv   = gross * 0.10;
      brPayout   = { gross, opv, net: gross - opv, eff, capped: incomeVal > MAX_INCOME, days: complicated ? 140 : 126 };
      monthlyGfss = eff * 0.40;
    }

    const birthLump = num >= 4
      ? Math.round(63 * MRP_2026)   // 272 475
      : Math.round(38 * MRP_2026);  // 164 350

    const monthlyAmount = employed ? monthlyGfss : MONTHLY_FIXED[Math.min(num, 4)];

    setError(null);
    setResult({
      employed,
      brPayout,
      birthLump,
      childNum: num,
      monthlyAmount,
      totalCare: monthlyAmount * 18,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Параметры расчёта
          </CardTitle>
          <CardDescription>
            Декретные выплаты и пособия при рождении ребёнка в РК (2026)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={calculate} className="space-y-5" noValidate>

            <div className="space-y-1.5">
              <Label>Порядковый номер ребёнка</Label>
              <Select value={childNum} onValueChange={(v) => { setChildNum(v); setResult(null); }}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1-й ребёнок</SelectItem>
                  <SelectItem value="2">2-й ребёнок</SelectItem>
                  <SelectItem value="3">3-й ребёнок</SelectItem>
                  <SelectItem value="4">4-й и более</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="mat-employed"
                checked={employed}
                onCheckedChange={(v) => { setEmployed(!!v); setResult(null); }}
              />
              <Label htmlFor="mat-employed" className="cursor-pointer">
                Официально трудоустроена (есть соцотчисления в ГФСС)
              </Label>
            </div>

            {employed && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="mat-income">Среднемесячный доход за 12 мес. (тенге)</Label>
                  <Input
                    id="mat-income"
                    type="number" min="0" step="1"
                    value={income}
                    onChange={(e) => { setIncome(e.target.value); setResult(null); }}
                    placeholder="200 000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Максимум для расчёта: {fmt(MAX_INCOME)} (7 МЗП)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mat-complicated"
                    checked={complicated}
                    onCheckedChange={(v) => { setComplicated(!!v); setResult(null); }}
                  />
                  <Label htmlFor="mat-complicated" className="cursor-pointer">
                    Осложнённые роды (140 дней вместо 126)
                  </Label>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />{error}
              </div>
            )}

            <Button type="submit" className="w-full">Рассчитать</Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-4">
          {result.brPayout && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Baby className="h-4 w-4 text-pink-500" />
                  Единовременная выплата по Б&amp;Р (ГФСС)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Показатель</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Расчётный доход (мес.)</TableCell>
                      <TableCell className="text-right font-mono">
                        {fmt(result.brPayout.eff)}
                        {result.brPayout.capped && <span className="text-xs text-orange-600 ml-1">(лимит)</span>}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        Коэффициент ({result.brPayout.days} дн. ÷ 30)
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(result.brPayout.days / 30).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Начислено</TableCell>
                      <TableCell className="text-right font-mono">{fmt(result.brPayout.gross)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">− ОПВ (10%)</TableCell>
                      <TableCell className="text-right font-mono text-red-600">− {fmt(result.brPayout.opv)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">К выплате</TableCell>
                      <TableCell className="text-right font-mono font-bold text-green-700 text-base">{fmt(result.brPayout.net)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Baby className="h-4 w-4 text-blue-500" />
                Единовременное пособие при рождении (из бюджета)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Основание</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      {result.childNum >= 4
                        ? "4-й и более ребёнок — 63 МРП"
                        : `${result.childNum}-й ребёнок — 38 МРП`}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-700 text-base">
                      {fmt(result.birthLump)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Baby className="h-4 w-4 text-purple-500" />
                Ежемесячное пособие по уходу до 1,5 лет
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Показатель</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      {result.employed
                        ? "40% от дохода (ГФСС)"
                        : `${result.childNum >= 4 ? "4-й+" : result.childNum + "-й"} ребёнок — фиксированное`}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-700 text-base">
                      {fmt(result.monthlyAmount)} / мес.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">За 18 месяцев (1,5 года)</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {fmt(result.totalCare)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Итого всех выплат</span>
                <span className="font-mono font-bold text-lg text-green-700">
                  {fmt(
                    (result.brPayout?.net ?? 0) +
                    result.birthLump +
                    result.totalCare
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.employed
                  ? "Выплата по Б&Р + Пособие при рождении + Уход 18 мес."
                  : "Пособие при рождении + Уход 18 мес."}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed text-muted-foreground min-h-48">
          <div className="text-center space-y-2">
            <Baby className="h-10 w-10 mx-auto opacity-25" />
            <p className="text-sm">Введите данные и нажмите «Рассчитать»</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────────────────────

export default function BenefitsPage() {
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Калькулятор пособий Казахстан 2026 | BuhBase</title>
        <meta
          name="description"
          content="Расчёт пособия по безработице и декретных выплат в Казахстане 2026. Формулы ГФСС: КСУ, коэффициент 45%, пособие по уходу 40% от дохода."
        />
        <link rel="canonical" href="https://buhbase.kz/benefits" />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Пособия</h1>
        <p className="text-muted-foreground mt-1">
          Расчёт социальных выплат по ставкам {new Date().getFullYear()} года
        </p>
      </div>

      <Tabs defaultValue="unemployment">
        <TabsList className="w-full overflow-x-auto justify-start sm:justify-center sm:w-auto">
          <TabsTrigger value="unemployment" className="flex items-center gap-1.5 shrink-0">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">По безработице</span>
          </TabsTrigger>
          <TabsTrigger value="maternity" className="flex items-center gap-1.5 shrink-0">
            <Baby className="h-4 w-4" />
            <span className="hidden sm:inline">Декрет</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="unemployment"><UnemploymentCalc /></TabsContent>
        <TabsContent value="maternity"><MaternityCalc /></TabsContent>
      </Tabs>
    </div>
  );
}
