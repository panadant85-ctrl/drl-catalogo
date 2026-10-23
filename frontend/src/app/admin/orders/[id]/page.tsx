import OrderDetailsPage from "@/components/admin/orders/OrderDetailsPage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsRoute({
  params,
}: PageProps) {
  const { id } = await params;

  return <OrderDetailsPage orderId={id} />;
}