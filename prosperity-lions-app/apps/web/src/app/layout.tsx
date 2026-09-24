import "./globals.css";

export const metadata = {
  title: "Prosperity Lions",
  description: "Meet your Resorts World Sentosa Prosperity Lion this Chinese New Year."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Placeholder fonts for the storybook look. Swap for brand fonts once set. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
