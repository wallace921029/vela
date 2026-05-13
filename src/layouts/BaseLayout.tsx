import { Outlet, useNavigate } from "react-router";
import {
  User,
  Settings,
  LogOut,
  Languages,
  Sun,
  Moon,
  Monitor,
  Upload,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { importBookmarksFile } from "@/utils/bookmarkImport";
import AuroraBackground from "@/components/AuroraBackground";
import logo from "@/assets/apple-touch-icon.png";

const BaseLayout = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleImportBookmarks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const result = await importBookmarksFile(file, localStorage.getItem('vela_token'));

      if (result.ok) {
        window.location.reload();
      } else if (result.reason === 'empty') {
        alert("No bookmarks found in the file.");
      } else {
        alert("Import failed to save to server");
      }
    } catch (err) {
      console.error("Failed to import bookmarks", err);
      alert("Import failed to read the file");
    }

    e.target.value = "";
  };

  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-50 font-sans selection:bg-primary/20 flex flex-col relative">
      <AuroraBackground />

      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/50 dark:bg-neutral-950/50 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 select-none outline-none"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Vela" className="size-6" />
            <span className="text-xl font-bold tracking-tight">Vela</span>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="system" className="cursor-pointer">
                    <Monitor className="mr-2 size-4" /> System
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="light" className="cursor-pointer">
                    <Sun className="mr-2 size-4" /> Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                    <Moon className="mr-2 size-4" /> Dark
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                >
                  <Languages className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 rounded-xl">
                <DropdownMenuRadioGroup
                  value={i18n.language}
                  onValueChange={(val) => {
                    i18n.changeLanguage(val);
                    localStorage.setItem("vela_language", val);
                  }}
                >
                  <DropdownMenuRadioItem value="en" className="cursor-pointer">English</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="zh" className="cursor-pointer">中文</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (
              <div className="ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <Avatar className="size-8 ring-2 ring-transparent hover:ring-primary/50 transition-all cursor-pointer">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.nickname || user.email} />}
                      <AvatarFallback>
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.nickname || (user.role === 'ADMIN' ? t("header.adminUser") : 'User')}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/account")}>
                      <Settings className="mr-2 size-4" />
                      <span>{t("header.accountSettings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/about")}>
                      <Info className="mr-2 size-4" />
                      <span>{t("header.about")}</span>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/system")}>
                        <SlidersHorizontal className="mr-2 size-4" />
                        <span>{t("header.systemSettings")}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 size-4" />
                      <span>
                        {t("header.importBookmarks", {
                          defaultValue: "Import Bookmarks",
                        })}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" />
                      <span>{t("header.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <input
        type="file"
        accept=".html"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImportBookmarks}
      />
    </div>
  );
};

export default BaseLayout;
