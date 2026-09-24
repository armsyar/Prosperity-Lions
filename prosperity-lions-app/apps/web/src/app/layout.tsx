export const metadata = {
  title: "Prosperity Lions",
  description: "Meet your Resorts World Sentosa Prosperity Lion this Chinese New Year."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
