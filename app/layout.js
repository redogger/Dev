import "./globals.css";

export const metadata = {
  title: "Dev-Cloud Pro | Professional C++ IDE",
  description:
    "Dev-Cloud Pro — A professional online C++ IDE with automated student branding, mutation engine, and Judge0 CE execution sandbox.",
  keywords: ["C++ IDE", "Online Compiler", "Dev-Cloud", "C++ Editor", "Judge0"],
  authors: [{ name: "Dev-Cloud Pro" }],
  openGraph: {
    title: "Dev-Cloud Pro | Professional C++ IDE",
    description: "Build, mutate, and execute unique C++ assignments online.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="overflow-hidden antialiased">{children}</body>
    </html>
  );
}
