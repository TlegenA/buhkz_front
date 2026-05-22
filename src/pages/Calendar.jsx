import { useState, useEffect } from "react";
import { CalendarDays, AlertCircle, Clock } from "lucide-react";
import { api } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function urgencyVariant(daysLeft) {
  if (daysLeft < 0) return "destructive";
  if (daysLeft <= 7) return "destructive";
  if (daysLeft <= 14) return "warning";
  return "success";
}

function urgencyLabel(daysLeft) {
  if (daysLeft < 0) return `Просрочено на ${Math.abs(daysLeft)} дн.`;
  if (daysLeft === 0) return "Сегодня!";
  return `${daysLeft} дн.`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-KZ", { day: "numeric", month: "long", year: "numeric" });
}

function DeadlineCard({ deadline }) {
  const daysLeft = deadline.days_left;
  return (
    <Card className={daysLeft <= 7 && daysLeft >= 0 ? "border-red-200 bg-red-50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{deadline.title}</CardTitle>
          <Badge variant={urgencyVariant(daysLeft)} className="shrink-0">
            {urgencyLabel(daysLeft)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {deadline.form_code && (
            <Badge variant="outline">Форма {deadline.form_code}</Badge>
          )}
          {deadline.tax_type && (
            <Badge variant="secondary">{deadline.tax_type}</Badge>
          )}
          {deadline.entity_type && (
            <Badge variant="secondary">{deadline.entity_type}</Badge>
          )}
          {deadline.tax_regime && (
            <Badge variant="outline">{deadline.tax_regime}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{formatDate(deadline.due_date)}</span>
        </div>
        {deadline.description && (
          <p className="mt-2 text-sm text-muted-foreground">{deadline.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [entityType, setEntityType] = useState("all");
  const [taxRegime, setTaxRegime] = useState("all");
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getDeadlines({
        month: `${year}-${month}`,
        entity_type: entityType === "all" ? "" : entityType,
        tax_regime: taxRegime === "all" ? "" : taxRegime,
      })
      .then(setDeadlines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, month, entityType, taxRegime]);

  const years = ["2025", "2026"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Налоговый календарь</h1>
        <p className="text-muted-foreground mt-1">Дедлайны по сдаче отчётности и уплате налогов</p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4" style={{ position: "relative", zIndex: 10 }}>
        <div className="space-y-1.5">
          <Label>Месяц</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={i} value={String(i + 1).padStart(2, "0")}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Год</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Тип организации</Label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="ТОО">ТОО</SelectItem>
              <SelectItem value="ИП">ИП</SelectItem>
              <SelectItem value="ФЛ">Физ. лицо</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Режим налогообложения</Label>
          <Select value={taxRegime} onValueChange={setTaxRegime}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все режимы</SelectItem>
              <SelectItem value="Общий">Общий</SelectItem>
              <SelectItem value="УСН">УСН</SelectItem>
              <SelectItem value="СНР">СНР</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Контент */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Загрузка...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive py-6">
          <AlertCircle className="h-5 w-5" />
          <span>Ошибка: {error}</span>
        </div>
      )}

      {!loading && !error && deadlines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>В выбранном периоде дедлайнов нет</p>
        </div>
      )}

      {!loading && !error && deadlines.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ position: "relative", zIndex: 0 }}>
          {deadlines.map((d) => (
            <DeadlineCard key={d.id} deadline={d} />
          ))}
        </div>
      )}
    </div>
  );
}
