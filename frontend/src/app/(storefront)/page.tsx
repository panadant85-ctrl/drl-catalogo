import Storefront from "@/components/storefront/Storefront";
import { getProducts } from "@/lib/api";

export default async function Home() {
  const data = await getProducts();

  const products = Array.isArray(data?.data)
    ? data.data
    : [];

  return <Storefront products={products} />;
}