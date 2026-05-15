import {
  Bookmark,
  CloudSun,
  Database,
  ExternalLink,
  Info,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContentPageLayout, { ContentPageHeader } from "@/layouts/ContentPageLayout";
import logo from "@/assets/apple-touch-icon.png";

const APP_VERSION = "0.0.2";
const CARD_CLASS =
  "h-full min-h-[188px] rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55";
const ICON_CLASS =
  "mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary";

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
    <ContentPageLayout>
      <ContentPageHeader backLabel={t("notes.backToDashboard")} className="mb-8">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <img src={logo} alt="Vela" className="size-16 shrink-0 rounded-2xl shadow-sm" />
          <div className="min-w-0">
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
        </div>
      </ContentPageHeader>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className={CARD_CLASS}>
                <CardHeader>
                  <div className={ICON_CLASS}>
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid auto-rows-fr gap-5">
          <Card className={CARD_CLASS}>
            <CardHeader>
              <div className={ICON_CLASS}>
                <Info className="size-5" />
              </div>
              <CardTitle>{t("about.project.title")}</CardTitle>
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
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">GitHub</span>
                <a
                  href="https://github.com/wallace921029/vela"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 items-center gap-1.5 text-right font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-4 shrink-0" />
                  <span className="truncate">wallace921029/vela</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader>
              <div className={ICON_CLASS}>
                <Database className="size-5" />
              </div>
              <CardTitle>{t("about.storage.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("about.storage.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentPageLayout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

export default About;
