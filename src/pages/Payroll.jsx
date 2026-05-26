import { useState } from "react";
import { Users, Plus, Trash2, Calculator, Download, AlertCircle } from "lucide-react";
import { api } from "@/api";
import { useEmployees } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function fmt(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("ru-KZ") + " ₸";
}

function periodLabel(year, month) {
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

// ─── Таблица редактирования сотрудников ───────────────────────────────────────

function EmployeeTable({ employees, onUpdate, onRemove, onAdd }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Сотрудники
            </CardTitle>
            <CardDescription className="mt-1">
              Список сохраняется в браузере автоматически
            </CardDescription>
          </div>
          <Button size="sm" onClick={onAdd} className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {employees.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm px-4">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
            Добавьте сотрудников для расчёта ведомости
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">ФИО</TableHead>
                <TableHead className="min-w-36 hidden sm:table-cell">Должность</TableHead>
                <TableHead className="min-w-36">Оклад (брутто)</TableHead>
                <TableHead className="text-center min-w-20">Дети</TableHead>
                <TableHead className="text-center min-w-24">Алименты</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <Input
                      value={emp.name}
                      onChange={(e) => onUpdate(emp.id, { name: e.target.value })}
                      placeholder="Иванов Иван Иванович"
                      className="h-8 min-w-40"
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Input
                      value={emp.position}
                      onChange={(e) => onUpdate(emp.id, { position: e.target.value })}
                      placeholder="Должность"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={emp.gross_salary || ""}
                      onChange={(e) => onUpdate(emp.id, { gross_salary: Number(e.target.value) })}
                      placeholder="300 000"
                      className="h-8 min-w-32"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={emp.children || ""}
                      onChange={(e) => onUpdate(emp.id, { children: Number(e.target.value) })}
                      placeholder="0"
                      className="h-8 w-14 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={emp.alimony_children || ""}
                      onChange={(e) => onUpdate(emp.id, { alimony_children: Number(e.target.value) })}
                      placeholder="0"
                      className="h-8 w-14 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(emp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Таблица-ведомость (результат) ────────────────────────────────────────────

function PayrollSheet({ result, period }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Начисления сотрудникам — {period}</CardTitle>
          <CardDescription>Удержания из зарплаты сотрудника</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">ФИО</TableHead>
                <TableHead className="hidden md:table-cell min-w-32">Должность</TableHead>
                <TableHead className="text-right min-w-28">Оклад</TableHead>
                <TableHead className="text-right min-w-24">ОПВ</TableHead>
                <TableHead className="text-right min-w-24">ВОСМС</TableHead>
                <TableHead className="text-right min-w-24">ИПН</TableHead>
                <TableHead className="text-right min-w-24">Алименты</TableHead>
                <TableHead className="text-right min-w-28 font-semibold">К выплате</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.employees.map((emp, i) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">
                    <span className="text-muted-foreground text-xs mr-1">{i + 1}.</span>
                    {emp.name || <span className="text-muted-foreground italic">Без имени</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {emp.position || "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmt(emp.gross)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.opv)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.osms_employee)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.ipn)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {emp.alimony > 0 ? fmt(emp.alimony) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">{fmt(emp.to_pay)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2} className="hidden md:table-cell">ИТОГО</TableCell>
                <TableCell className="md:hidden">ИТОГО</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.gross)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.opv)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.osms_employee)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.ipn)}</TableCell>
                <TableCell className="text-right font-mono">
                  {result.totals.alimony > 0 ? fmt(result.totals.alimony) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-primary">{fmt(result.totals.to_pay)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Расходы работодателя — {period}</CardTitle>
          <CardDescription>Начисления сверх оклада</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">ФИО</TableHead>
                <TableHead className="text-right min-w-28">Оклад</TableHead>
                <TableHead className="text-right min-w-24">ОПВР</TableHead>
                <TableHead className="text-right min-w-24">СО</TableHead>
                <TableHead className="text-right min-w-24">ООСМС</TableHead>
                <TableHead className="text-right min-w-24">СН</TableHead>
                <TableHead className="text-right min-w-32 font-semibold">Итого затрат</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium text-sm">
                    {emp.name || <span className="text-muted-foreground italic">Без имени</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmt(emp.gross)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.opvr)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.so)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.osms_employer)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(emp.sn)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-orange-600">{fmt(emp.total_cost)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell>ИТОГО</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.gross)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.opvr)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.so)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.osms_employer)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(result.totals.sn)}</TableCell>
                <TableCell className="text-right font-mono text-orange-600">{fmt(result.totals.total_cost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Экспорт в Excel (через backend / openpyxl) ───────────────────────────────

async function exportToExcel(employees, period, setExporting) {
  setExporting(true);
  try {
    const blob = await api.exportPayroll({ employees, period });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vedomost_${period.replace(/ /g, "_")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    setExporting(false);
  }
}

// ─── Страница ─────────────────────────────────────────────────────────────────

export default function PayrollPage() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const { employees, add, update, remove } = useEmployees();

  const period = periodLabel(year, month);

  async function handleCalculate() {
    const valid = employees.filter((e) => e.gross_salary > 0);
    if (valid.length === 0) {
      setError("Добавьте хотя бы одного сотрудника с окладом");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.calcPayroll({ employees: valid });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const activeCount = employees.filter((e) => e.gross_salary > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Расчётная ведомость</h1>
        <p className="text-muted-foreground mt-1">
          Пакетный расчёт зарплаты и выгрузка в Excel
        </p>
      </div>

      {/* Период */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Месяц</label>
          <select
            value={month}
            onChange={(e) => { setMonth(e.target.value); setResult(null); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm w-36"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>{name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Год</label>
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setResult(null); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm w-24"
          >
            {["2025", "2026"].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
          {result && (
            <Button
              variant="outline"
              disabled={exporting}
              onClick={() => exportToExcel(employees.filter(e => e.gross_salary > 0), period, setExporting)}
            >
              <Download className="h-4 w-4 mr-1.5" />
              {exporting ? "Формирую..." : <><span className="hidden sm:inline">Скачать</span> Excel</>}
            </Button>
          )}
          <Button onClick={handleCalculate} disabled={loading || activeCount === 0}>
            <Calculator className="h-4 w-4 mr-1.5" />
            {loading ? "Считаем..." : `Рассчитать${activeCount > 0 ? ` (${activeCount})` : ""}`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <EmployeeTable
        employees={employees}
        onUpdate={update}
        onRemove={(id) => { remove(id); setResult(null); }}
        onAdd={add}
      />

      {result && <PayrollSheet result={result} period={period} />}
    </div>
  );
}
