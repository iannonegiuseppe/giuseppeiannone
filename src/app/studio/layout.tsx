import { NextStudioLayout } from "next-sanity/studio";

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextStudioLayout>{children}</NextStudioLayout>
      </body>
    </html>
  );
}
