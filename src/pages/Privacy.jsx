import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <Helmet>
        <title>Политика конфиденциальности | BuhBase</title>
        <meta name="description" content="Политика обработки персональных данных и условия использования сервиса BuhBase" />
        <link rel="canonical" href="https://buhbase.kz/privacy" />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Политика конфиденциальности</h1>
        <p className="text-muted-foreground mt-1 text-sm">Действует с 6 июля 2026 г. · Версия 1.0</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Общие положения</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты информации о пользователях сайта <strong>buhbase.kz</strong> (далее — «Сервис»).
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Политика разработана в соответствии с Законом Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите».
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Владелец Сервиса:</strong> Абдрахманов Тлеген Кельденович, ИИН 831110350941, г. Астана, Республика Казахстан.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Используя Сервис, Пользователь подтверждает, что ознакомился с настоящей Политикой и согласен с её условиями.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Какие данные мы обрабатываем</h2>

        <h3 className="text-base font-medium">2.1 Данные, которые мы НЕ собираем и НЕ храним на наших серверах</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Сервис BuhBase спроектирован так, чтобы <strong>минимизировать сбор персональных данных</strong>. В частности:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Данные расчётов ведомостей (ФИО сотрудников, размеры заработной платы, удержания, выплаты) сохраняются исключительно <strong>в браузере Пользователя</strong> (localStorage) на устройстве Пользователя.</li>
          <li>Эти данные <strong>не передаются на серверы Сервиса</strong>, не покидают устройство Пользователя и недоступны Владельцу Сервиса.</li>
          <li>Очистка кэша браузера или удаление данных сайта полностью удаляет все сохранённые расчёты.</li>
        </ul>

        <h3 className="text-base font-medium">2.2 Данные, которые автоматически собираются при посещении</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          При посещении сайта автоматически могут собираться следующие технические данные:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>IP-адрес;</li>
          <li>тип и версия браузера, операционная система;</li>
          <li>данные о посещённых страницах, времени посещения, источнике перехода;</li>
          <li>файлы cookie (см. раздел 4).</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Эти данные собираются хостинг-провайдерами и сервисами аналитики в обезличенном виде для анализа работы Сервиса.
        </p>

        <h3 className="text-base font-medium">2.3 Данные обратной связи</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Если Пользователь самостоятельно направляет обращение, в нём могут содержаться: имя, email, текст сообщения. Эти данные обрабатываются исключительно для ответа на обращение.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Цели обработки данных</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>предоставление функциональности Сервиса (калькуляторы, справочная информация);</li>
          <li>анализ работы Сервиса и устранение технических неполадок;</li>
          <li>ответ на обращения Пользователей;</li>
          <li>улучшение пользовательского опыта.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Сервис <strong>не использует</strong> данные Пользователей для рекламных целей, не продаёт и не передаёт их третьим лицам, за исключением случаев, предусмотренных законодательством Республики Казахстан.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Файлы cookie</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Сервис использует файлы cookie для:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>сохранения пользовательских настроек интерфейса;</li>
          <li>технической функциональности (сохранение расчётов в браузере);</li>
          <li>сбора обезличенной статистики посещений (Google Analytics, Яндекс.Метрика).</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Пользователь может отключить файлы cookie в настройках браузера, однако это может повлиять на работоспособность Сервиса.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Где хранятся данные</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Технические данные о посещениях обрабатываются с использованием инфраструктуры следующих сервисов:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li><strong>Vercel Inc.</strong> (США) — хостинг фронтенда;</li>
          <li><strong>Railway Corp.</strong> (США) — хостинг бэкенда и базы данных справочной информации.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          База данных Сервиса содержит <strong>исключительно публичную справочную информацию</strong> (налоговые ставки, МРП, МЗП и т.п.) и <strong>не содержит персональных данных Пользователей</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Права Пользователя</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          В соответствии с Законом РК «О персональных данных и их защите» Пользователь имеет право:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>знать о наличии у Владельца Сервиса своих персональных данных;</li>
          <li>получать информацию о порядке их обработки;</li>
          <li>требовать изменения, блокирования или уничтожения своих персональных данных;</li>
          <li>отзывать согласие на обработку персональных данных;</li>
          <li>обжаловать действия Владельца в уполномоченный орган по защите персональных данных.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Для реализации указанных прав обратитесь на: <a href="mailto:tlegen2011@gmail.com" className="underline hover:text-foreground">tlegen2011@gmail.com</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Защита данных</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>использование HTTPS-соединения для передачи данных;</li>
          <li>ограничение доступа к серверной инфраструктуре;</li>
          <li>регулярное обновление программного обеспечения.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Изменения Политики</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Владелец оставляет за собой право вносить изменения в настоящую Политику. Актуальная версия всегда доступна по адресу: <strong>https://buhbase.kz/privacy</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. Контакты</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Email:</strong> <a href="mailto:tlegen2011@gmail.com" className="underline hover:text-foreground">tlegen2011@gmail.com</a></li>
          <li><strong>Владелец:</strong> Абдрахманов Тлеген Кельденович</li>
        </ul>
      </section>

      <div className="border-t pt-4 text-xs text-muted-foreground">
        Также ознакомьтесь с{" "}
        <Link to="/terms" className="underline hover:text-foreground">Пользовательским соглашением</Link>.
      </div>
    </div>
  );
}
