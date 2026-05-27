import { useState } from "react";
import {
  CalendarDays, Calculator, Briefcase, FileSpreadsheet, BookOpen,
  Send, Mail, CheckCircle2, AlertCircle, MessageSquare, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/api";

const TG_USERNAME = "Tlegenabd";
const CONTACT_EMAIL = "tlegen2011@gmail.com";

const FEATURES = [
  { icon: CalendarDays, label: "Налоговый календарь", desc: "Дедлайны по всем видам отчётности с фильтрацией по типу налогоплательщика" },
  { icon: Calculator,   label: "Калькулятор зарплаты", desc: "Расчёт брутто → нетто, обратный расчёт нетто → брутто, вычеты ОПВ, ВОСМС, ИПН, алименты" },
  { icon: Briefcase,    label: "Калькулятор ИП", desc: "Упрощённая декларация (3%) и патент (1%) с учётом ОПВ, ОПВР, СО, ОСМС" },
  { icon: FileSpreadsheet, label: "Расчётная ведомость", desc: "Пакетный расчёт зарплаты по всем сотрудникам, выгрузка печатной формы в Excel" },
  { icon: BookOpen,     label: "Справочник ставок", desc: "Актуальные ставки налогов, взносов и отчислений на 2026 год" },
];

function FeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "error" | "not_configured"
  const [errMsg, setErrMsg] = useState("");

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status) setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.message.trim()) return;
    setStatus("loading");
    try {
      await api.submitFeedback(form);
      setStatus("ok");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      if (err.message?.includes("not configured") || err.message?.includes("503")) {
        setStatus("not_configured");
      } else {
        setStatus("error");
        setErrMsg(err.message || "Неизвестная ошибка");
      }
    }
  }

  if (status === "ok") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="font-medium">Сообщение отправлено!</p>
        <p className="text-sm text-muted-foreground">Ответим в ближайшее время.</p>
        <Button variant="outline" size="sm" onClick={() => setStatus(null)}>Написать ещё</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Имя <span className="text-muted-foreground">(необязательно)</span></label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Иван Иванов"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email <span className="text-muted-foreground">(необязательно)</span></label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="ivan@example.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Сообщение <span className="text-destructive">*</span></label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Нашли ошибку, есть пожелание или вопрос — пишите..."
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

      {status === "not_configured" && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Форма пока не настроена. Напишите напрямую:{" "}
            <a href={`https://t.me/${TG_USERNAME}`} target="_blank" rel="noopener noreferrer" className="underline">Telegram</a>
            {" "}или{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errMsg}
        </div>
      )}

      <Button type="submit" disabled={!form.message.trim() || status === "loading"}>
        <Send className="h-4 w-4 mr-1.5" />
        {status === "loading" ? "Отправляем..." : "Отправить"}
      </Button>
    </form>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">О проекте</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          <strong>BuhBase</strong> — бесплатный онлайн-сервис для бухгалтеров и предпринимателей Казахстана.
          Помогает быстро считать налоги, отслеживать дедлайны отчётности и формировать расчётные ведомости
          без лишних таблиц и сложных программ.
        </p>
      </div>

      {/* Возможности */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Возможности</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Контакты */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Контакты</CardTitle>
          <CardDescription>Вопросы, предложения, сотрудничество</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <a
            href={`https://t.me/${TG_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Send className="h-4 w-4" />
            @{TG_USERNAME}
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
        </CardContent>
      </Card>

      {/* Форма обратной связи */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Обратная связь
          </CardTitle>
          <CardDescription>
            Нашли ошибку? Есть пожелание? Напишите — читаем всё.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>
    </div>
  );
}
