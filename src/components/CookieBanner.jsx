import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-background border rounded-lg shadow-lg p-4 z-50">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Мы используем cookies для аналитики и корректной работы сайта. Подробнее в{" "}
        <Link to="/privacy" className="underline hover:text-foreground">
          Политике конфиденциальности
        </Link>
        .
      </p>
      <Button size="sm" className="mt-3" onClick={accept}>
        Принять
      </Button>
    </div>
  );
}
