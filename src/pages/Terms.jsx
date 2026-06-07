import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <Helmet>
        <title>Пользовательское соглашение | BuhBase</title>
        <meta name="description" content="Пользовательское соглашение сервиса BuhBase — условия использования сервиса для бухгалтеров Казахстана" />
        <link rel="canonical" href="https://buhbase.kz/terms" />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Пользовательское соглашение</h1>
        <p className="text-muted-foreground mt-1 text-sm">Действует с 6 июля 2026 г.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Общие условия</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между Владельцем сервиса <strong>buhbase.kz</strong> (далее — «Сервис») и его Пользователями.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Используя Сервис, Пользователь подтверждает согласие со всеми условиями Соглашения. Если Пользователь не согласен с условиями — он должен прекратить использование Сервиса.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Предмет соглашения</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Сервис предоставляет Пользователю безвозмездный доступ к информационным и расчётным инструментам, предназначенным для бухгалтеров и предпринимателей Республики Казахстан:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>налоговый календарь;</li>
          <li>калькуляторы заработной платы и налогов;</li>
          <li>справочник ставок и нормативов;</li>
          <li>иные сопутствующие инструменты.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Информационный характер Сервиса</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>3.1.</strong> Вся информация, предоставляемая Сервисом, носит исключительно <strong>справочно-информационный характер</strong>.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>3.2.</strong> Сервис <strong>не является</strong> официальным источником нормативно-правовой информации, не заменяет консультацию профессионального бухгалтера, аудитора, юриста или налогового консультанта.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>3.3.</strong> Несмотря на усилия по поддержанию актуальности данных, Сервис <strong>не гарантирует</strong> точность, полноту и своевременность обновления информации. Перед принятием решений, имеющих финансовые или юридические последствия, Пользователь обязан самостоятельно проверять актуальность данных по официальным источникам (Налоговый кодекс РК, постановления Правительства РК).
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>3.4.</strong> Владелец Сервиса <strong>не несёт ответственности</strong> за любые прямые или косвенные убытки, возникшие в результате использования или невозможности использования Сервиса, в том числе за решения, принятые Пользователем на основании информации Сервиса.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Права и обязанности Пользователя</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>4.1.</strong> Пользователь вправе использовать Сервис в законных целях и в соответствии с настоящим Соглашением.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>4.2.</strong> Пользователю запрещается:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>использовать Сервис для нарушения законодательства Республики Казахстан;</li>
          <li>предпринимать действия, направленные на нарушение работоспособности Сервиса (DDoS-атаки, попытки несанкционированного доступа, парсинг с чрезмерной нагрузкой);</li>
          <li>копировать, распространять или коммерчески использовать материалы Сервиса без разрешения Владельца.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Интеллектуальная собственность</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Дизайн, программный код, тексты и иные материалы Сервиса принадлежат Владельцу и охраняются законодательством об авторском праве. Использование материалов без согласия Владельца не допускается.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Информация о налоговых ставках и нормативах является общедоступной и охране не подлежит.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Изменения Соглашения</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Владелец вправе изменять условия Соглашения. Актуальная редакция всегда доступна по адресу: <strong>https://buhbase.kz/terms</strong>. Продолжение использования Сервиса после публикации изменений означает согласие Пользователя с новой редакцией.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Применимое право</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          К отношениям между Владельцем и Пользователем применяется законодательство Республики Казахстан. Все споры подлежат разрешению в порядке, установленном законодательством РК.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Контакты</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Email:</strong> <a href="mailto:tlegen2011@gmail.com" className="underline hover:text-foreground">tlegen2011@gmail.com</a></li>
          <li><strong>Владелец:</strong> Абдрахманов Тлеген Кельденович</li>
        </ul>
      </section>

      <div className="border-t pt-4 text-xs text-muted-foreground">
        Также ознакомьтесь с{" "}
        <Link to="/privacy" className="underline hover:text-foreground">Политикой конфиденциальности</Link>.
      </div>
    </div>
  );
}
