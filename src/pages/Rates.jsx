import { useState, useEffect } from "react";
import { BookOpen, AlertCircle, Clock, History } from "lucide-react";
import { api } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function formatValue(rate) {
  if (rate.unit === "percent") return `${Number(rate.value).toFixed(1)}%`;
  if (rate.unit === "mrp") return `${Number(rate.value).toFixed(0)} МРП`;
  return Number(rate.value).toLocaleString("ru-KZ") + " ₸";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ru-KZ", { day: "numeric", month: "long", year: "numeric" });
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
      <Clock className="h-5 w-5 animate-spin" />
      Загрузка...
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex items-center gap-2 text-destructive py-6">
      <AlertCircle className="h-5 w-5" />
      Ошибка: {error}
    </div>
  );
}

// ─── Текущие ставки ────────────────────────────────────────────────────────────

function CurrentRates({ rates }) {
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Все ставки
          </CardTitle>
          <CardDescription>Действует с 1 января {year} года</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
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

// ─── История изменений ──────────────────────────────────────────────────────────

function changeBadge(prevRate, currRate) {
  if (!prevRate || !currRate) return null;
  const a = Number(prevRate.value);
  const b = Number(currRate.value);
  if (a === b) return null;
  const diff = b - a;
  const pct = a !== 0 ? ((diff / a) * 100).toFixed(1) : null;
  const label = diff > 0 ? `+${pct}%` : `${pct}%`;
  return (
    <Badge variant={diff > 0 ? "destructive" : "success"} className="ml-1 text-xs">
      {label}
    </Badge>
  );
}

function RatesHistory({ allRates }) {
  const years = [...new Set(allRates.map((r) => new Date(r.valid_from).getFullYear()))].sort();
  const byCodeYear = {};
  for (const r of allRates) {
    const yr = new Date(r.valid_from).getFullYear();
    if (!byCodeYear[r.code]) byCodeYear[r.code] = { name: r.name, byYear: {} };
    byCodeYear[r.code].byYear[yr] = r;
    byCodeYear[r.code].name = r.name;
  }
  const codes = Object.keys(byCodeYear).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          История изменений ставок
        </CardTitle>
        <CardDescription>Сравнение по годам: {years.join(", ")}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">Показатель</TableHead>
                <TableHead>Код</TableHead>
                {years.map((y) => (
                  <TableHead key={y} className="text-right">{y}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => {
                const entry = byCodeYear[code];
                return (
                  <TableRow key={code}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{code}</Badge>
                    </TableCell>
                    {years.map((yr, i) => {
                      const rate = entry.byYear[yr];
                      const prevRate = i > 0 ? entry.byYear[years[i - 1]] : null;
                      return (
                        <TableCell key={yr} className="text-right font-mono">
                          {rate ? (
                            <span className="inline-flex items-center justify-end gap-1">
                              <span className={i === years.length - 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
                                {formatValue(rate)}
                              </span>
                              {i > 0 && changeBadge(prevRate, rate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Страница ──────────────────────────────────────────────────────────────────

export default function Rates() {
  const [rates, setRates] = useState([]);
  const [allRates, setAllRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getRates(), api.getAllRates()])
      .then(([current, all]) => {
        setRates(current);
        setAllRates(all);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Справочник ставок</h1>
        <p className="text-muted-foreground mt-1">
          Актуальные налоговые ставки, МРП и МЗП на {new Date().getFullYear()} год
        </p>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Актуальные
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <History className="h-4 w-4" />
            История изменений
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <CurrentRates rates={rates} />
        </TabsContent>
        <TabsContent value="history">
          {allRates.length > 0
            ? <RatesHistory allRates={allRates} />
            : <div className="text-muted-foreground py-8 text-center">Нет исторических данных</div>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}
