import { useState, useEffect } from "react";
import { BookOpen, AlertCircle, Clock } from "lucide-react";
import { api } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatValue(rate) {
  if (rate.unit === "percent") return `${Number(rate.value).toFixed(1)}%`;
  if (rate.unit === "mrp") return `${Number(rate.value).toFixed(0)} МРП`;
  return Number(rate.value).toLocaleString("ru-KZ") + " ₸";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ru-KZ", { day: "numeric", month: "long", year: "numeric" });
}

// Карточки с ключевыми показателями (МРП, МЗП, ставки налогов)
const KEY_CODES = ["mrp", "mzp", "opv", "ipn", "osms_emp", "osms_er", "so", "sn", "nds", "kpn"];

export default function Rates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getRates()
      .then(setRates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
        <Clock className="h-5 w-5 animate-spin" />
        Загрузка...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive py-6">
        <AlertCircle className="h-5 w-5" />
        Ошибка: {error}
      </div>
    );
  }

  const byCode = Object.fromEntries(rates.map((r) => [r.code, r]));
  const mrp = byCode["mrp"];
  const mzp = byCode["mzp"];
  const nds = byCode["nds"];
  const ipn = byCode["ipn"];
  const ipn_high = byCode["ipn_high"];
  const kpn = byCode["kpn"];
  const year = mrp ? new Date(mrp.valid_from).getFullYear() : new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Справочник ставок</h1>
        <p className="text-muted-foreground mt-1">Актуальные налоговые ставки, МРП и МЗП на {year} год</p>
      </div>

      {/* Ключевые показатели */}
      {mrp && mzp && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>МРП {year}</CardDescription>
              <CardTitle className="text-2xl text-primary">{Number(mrp.value).toLocaleString("ru-KZ")} ₸</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Месячный расчётный показатель</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>МЗП {year}</CardDescription>
              <CardTitle className="text-2xl text-primary">{Number(mzp.value).toLocaleString("ru-KZ")} ₸</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Минимальная заработная плата</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>ИПН / КПН</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {ipn ? `${Number(ipn.value).toFixed(0)}%` : "—"}
                {ipn_high ? `/${Number(ipn_high.value).toFixed(0)}%` : ""}
                {kpn ? ` / ${Number(kpn.value).toFixed(0)}%` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Подоходный / корпоративный</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>НДС</CardDescription>
              <CardTitle className="text-2xl text-primary">{nds ? `${Number(nds.value).toFixed(0)}%` : "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Налог на добавленную стоимость</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Полная таблица */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Все ставки
          </CardTitle>
          <CardDescription>Действует с 1 января {year} года</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Налог / показатель</TableHead>
                <TableHead>Код</TableHead>
                <TableHead className="text-right">Ставка / значение</TableHead>
                <TableHead>Действует с</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{rate.code}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatValue(rate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(rate.valid_from)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {rate.description || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
