import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deadline Clock",
  description: "A circular annual clock for tracking research conference deadlines.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('deadline-clock:theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}` }} /></head>
    <body>{children}</body>
  </html>;
}
