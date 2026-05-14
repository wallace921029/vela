import {
  Bookmark,
  CloudSun,
  Database,
  Info,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logo from "@/assets/apple-touch-icon.png";

const APP_VERSION = "0.0.1";

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Bookmark,
      title: t("about.features.bookmarks.title"),
      description: t("about.features.bookmarks.description"),
    },
    {
      icon: Layers,
      title: t("about.features.organization.title"),
      description: t("about.features.organization.description"),
    },
    {
      icon: CloudSun,
      title: t("about.features.weather.title"),
      description: t("about.features.weather.description"),
    },
    {
      icon: ShieldCheck,
      title: t("about.features.admin.title"),
      description: t("about.features.admin.description"),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 md:px-10">
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <img src={logo} alt="Vela" className="size-16 rounded-2xl shadow-sm" />
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("about.title")}
            </h1>
            <Badge variant="secondary">v{APP_VERSION}</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("about.description")}
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55"
              >
                <CardHeader>
                  <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-5">
          <Card className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="size-4" />
                {t("about.project.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow
                label={t("about.project.version")}
                value={`v${APP_VERSION}`}
              />
              <InfoRow
                label={t("about.project.frontend")}
                value="React / Vite / Tailwind CSS"
              />
              <InfoRow
                label={t("about.project.backend")}
                value="Fastify / SQLite"
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-4" />
                {t("about.storage.title")}
              </CardTitle>
              <CardDescription>
                {t("about.storage.description")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

export default About;
