import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calculator, TrendingDown, TrendingUp, AlertCircle, RotateCcw, Umbrella, Stethoscope } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

function EmptyState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed text-muted-foreground min-h-48">
      <div className="text-center space-y-2">
        <Calculator className="h-10 w-10 mx-auto opacity-25" />
        <p className="text-sm">Введите данные и нажмите «Рассчитать»</p>
      </div>
    </div>
  );
}

function SalaryResults({ result }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Удержания с сотрудника
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
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
                    <ResultRow label={`− Алименты (${Math.round(result.alimony_rate * 100)}%)`} value={result.alimony} variant="deduction" />
                  )}
                  {result.executor_fee > 0 && (
                    <ResultRow label="− Вознаграждение суд. исполнителя" value={result.executor_fee} variant="deduction" />
                  )}
                  <ResultRow label="К выдаче сотруднику" value={result.salary_after_alimony} variant="net" />
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Дополнительные расходы работодателя
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
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
  );
}

function SalaryForm({ mode }) {
  const isReverse = mode === "reverse";
  const [value, setValue] = useState("200000");
  const [hasChild, setHasChild] = useState(false);
  const [childrenCount, setChildrenCount] = useState("1");
  const [entityType, setEntityType] = useState("ТОО");
  const [hasAlimony, setHasAlimony] = useState(false);
  const [alimonyChildren, setAlimonyChildren] = useState("1");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const val = Number(value);
    if (!value || val <= 0 || !Number.isFinite(val)) {
      setError("Введите корректную сумму больше нуля");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        has_child_deduction: hasChild,
        children_count: hasChild ? Number(childrenCount) : 0,
        entity_type: entityType,
        alimony_children: hasAlimony ? Number(alimonyChildren) : 0,
      };
      const data = isReverse
        ? await api.calcReverse({ net_salary: val, ...payload })
        : await api.calcSalary({ gross_salary: val, ...payload });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isReverse ? <RotateCcw className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
            Параметры расчёта
          </CardTitle>
          <CardDescription>
            {isReverse ? "Введите желаемую сумму «на руки»" : "Введите оклад до вычета налогов"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor={`val-${mode}`}>
                {isReverse ? "Сумма на руки (тенге)" : "Оклад (тенге)"}
              </Label>
              <Input
                id={`val-${mode}`}
                type="number" min="0" step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="200 000"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Тип организации</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ТОО">ТОО</SelectItem>
                  <SelectItem value="ИП">ИП</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id={`hasChild-${mode}`} checked={hasChild} onCheckedChange={setHasChild} />
                <Label htmlFor={`hasChild-${mode}`} className="cursor-pointer">
                  Вычет на детей-инвалидов (882 МРП/год)
                </Label>
              </div>
              {hasChild && (
                <div className="ml-6 space-y-1.5">
                  <Label>Количество детей</Label>
                  <Input
                    type="number" min="1" max="10"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(e.target.value)}
                    className="w-24"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id={`hasAlimony-${mode}`} checked={hasAlimony} onCheckedChange={setHasAlimony} />
                <Label htmlFor={`hasAlimony-${mode}`} className="cursor-pointer">
                  Удержание алиментов
                </Label>
              </div>
              {hasAlimony && (
                <div className="ml-6 space-y-1.5">
                  <Label>Количество детей</Label>
                  <Select value={alimonyChildren} onValueChange={setAlimonyChildren}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
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

      {result ? <SalaryResults result={result} /> : <EmptyState />}
    </div>
  );
}

function VacationForm() {
  const [gross, setGross] = useState("200000");
  const [days, setDays] = useState("24");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const grossVal = Number(gross);
    const daysVal = Number(days);
    if (!grossVal || grossVal <= 0 || !daysVal || daysVal <= 0) {
      setError("Введите корректные значения");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(await api.calcVacation({ gross_monthly: grossVal, vacation_days: daysVal }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Umbrella className="h-5 w-5" />
            Параметры расчёта
          </CardTitle>
          <CardDescription>Расчёт отпускных по ст. 109 ТК РК</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="vac-gross">Среднемесячный оклад (тенге)</Label>
              <Input
                id="vac-gross"
                type="number" min="0" step="1"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                placeholder="200 000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vac-days">Количество дней отпуска</Label>
              <Input
                id="vac-days"
                type="number" min="1" max="365" step="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">Минимум 24 календарных дня (ст. 101 ТК РК)</p>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Umbrella className="h-4 w-4 text-blue-500" />
              Расчёт отпускных
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
                <ResultRow label="Среднемесячный оклад" value={result.gross_monthly} />
                <TableRow>
                  <TableCell className="text-muted-foreground">Среднедневной заработок</TableCell>
                  <TableCell className="text-right font-mono">{fmt(result.avg_daily)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Дней отпуска</TableCell>
                  <TableCell className="text-right font-mono">{result.vacation_days} дн.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Сумма отпускных</TableCell>
                  <TableCell className="text-right font-mono font-bold text-green-700 text-base">{fmt(result.vacation_pay)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : <EmptyState />}
    </div>
  );
}

function SickLeaveForm() {
  const [gross, setGross] = useState("200000");
  const [days, setDays] = useState("10");
  const [seniority, setSeniority] = useState("10");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const grossVal = Number(gross);
    const daysVal = Number(days);
    if (!grossVal || grossVal <= 0 || !daysVal || daysVal <= 0) {
      setError("Введите корректные значения");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(await api.calcSickLeave({
        gross_monthly: grossVal,
        sick_days: daysVal,
        seniority_years: Number(seniority),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Параметры расчёта
          </CardTitle>
          <CardDescription>Расчёт больничных по ст. 133 Социального кодекса РК</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="sick-gross">Среднемесячный оклад (тенге)</Label>
              <Input
                id="sick-gross"
                type="number" min="0" step="1"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                placeholder="200 000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sick-days">Дней нетрудоспособности</Label>
              <Input
                id="sick-days"
                type="number" min="1" max="365" step="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Непрерывный трудовой стаж</Label>
              <Select value={seniority} onValueChange={setSeniority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">До 1 года — 60%</SelectItem>
                  <SelectItem value="3">От 1 до 5 лет — 80%</SelectItem>
                  <SelectItem value="10">Свыше 5 лет — 100%</SelectItem>
                </SelectContent>
              </Select>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-purple-500" />
              Расчёт больничных
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
                <ResultRow label="Среднемесячный оклад" value={result.gross_monthly} />
                <TableRow>
                  <TableCell className="text-muted-foreground">Среднедневной заработок</TableCell>
                  <TableCell className="text-right font-mono">{fmt(result.avg_daily)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Дней нетрудоспособности</TableCell>
                  <TableCell className="text-right font-mono">{result.sick_days} дн.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Стаж</TableCell>
                  <TableCell className="text-right font-mono">{result.seniority_label}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Коэффициент</TableCell>
                  <TableCell className="text-right font-mono">{Math.round(result.coefficient * 100)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Сумма пособия</TableCell>
                  <TableCell className="text-right font-mono font-bold text-green-700 text-base">{fmt(result.sick_pay)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : <EmptyState />}
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Калькулятор зарплаты Казахстан | BuhBase</title>
        <meta name="description" content="Онлайн-расчёт зарплаты брутто и нетто с учётом ОПВ, ВОСМС, ИПН и алиментов. Обратный расчёт нетто → брутто. Актуальные ставки 2026." />
        <link rel="canonical" href="https://buhbase.kz/calculator" />
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Калькулятор</h1>
        <p className="text-muted-foreground mt-1">
          Расчёт зарплаты, отпускных и больничных по ставкам {new Date().getFullYear()} года
        </p>
      </div>

      <Tabs defaultValue="salary">
        <TabsList className="w-full overflow-x-auto justify-start sm:justify-center sm:w-auto">
          <TabsTrigger value="salary" className="flex items-center gap-1.5 shrink-0">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Зарплата</span>
          </TabsTrigger>
          <TabsTrigger value="reverse" className="flex items-center gap-1.5 shrink-0">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Обратный расчёт</span>
          </TabsTrigger>
          <TabsTrigger value="vacation" className="flex items-center gap-1.5 shrink-0">
            <Umbrella className="h-4 w-4" />
            <span className="hidden sm:inline">Отпускные</span>
          </TabsTrigger>
          <TabsTrigger value="sick" className="flex items-center gap-1.5 shrink-0">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Больничные</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salary">
          <SalaryForm mode="salary" />
        </TabsContent>
        <TabsContent value="reverse">
          <SalaryForm mode="reverse" />
        </TabsContent>
        <TabsContent value="vacation">
          <VacationForm />
        </TabsContent>
        <TabsContent value="sick">
          <SickLeaveForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
