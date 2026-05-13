import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuroraBackground from '@/components/AuroraBackground';
import logo from '@/assets/apple-touch-icon.png';

interface AuthPageShellProps {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AuthPageShell = ({ title, description, footer, children, className = 'p-4', onSubmit }: AuthPageShellProps) => {
  return (
    <div className={`min-h-screen text-neutral-900 dark:text-neutral-50 font-sans selection:bg-primary/20 flex flex-col relative items-center justify-center ${className}`}>
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full backdrop-blur-xl bg-white/70 dark:bg-neutral-950/70 border-neutral-200/60 dark:border-neutral-800/60 shadow-xl">
          <CardHeader className="flex flex-col items-center pt-8 pb-4 px-8">
            <img src={logo} alt="Vela" className="size-12 mb-4 drop-shadow-sm" />
            <CardTitle className="text-center text-2xl font-semibold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-center text-base">{description}</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardContent className="space-y-4 px-8">
              {children}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 bg-transparent border-t-0 px-8 pb-8">
              {footer}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthPageShell;
