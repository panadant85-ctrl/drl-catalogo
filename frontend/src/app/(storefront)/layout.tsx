import type { ReactNode } from "react";
import { StorefrontProvider } from "@/components/storefront/StorefrontProvider";
import Header from "@/components/storefront/Header";

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <StorefrontProvider>
      <Header />
      {children}
    </StorefrontProvider>
  );
}