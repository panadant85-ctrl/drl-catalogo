import CustomerDetailsPage from "@/components/admin/customers/CustomerDetailsPage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailsRoute({
  params,
}: PageProps) {
  const { id } = await params;

  return <CustomerDetailsPage customerId={id} />;
}