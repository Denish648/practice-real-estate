import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils/format";
import { getDeals } from "@/lib/data/deals";
import { getUser } from "@/lib/data/user";

export default async function BrowseDeals() {
  const { user, error: userError } = await getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Unauthorized");

  const { data: deals, error: dealsError } = await getDeals();
  if (dealsError) throw dealsError;
  if (!deals) throw new Error("Deals not found");

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <h1 className="text-3xl font-semibold tracking-tight">Browse Deals</h1>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead>Deal</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Visibility</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {deals.length > 0 ? (
                deals.map((deal) => {
                  const { id, title, city, price, is_private } = deal;

                  return (
                    <TableRow key={deal.id}>
                      <TableCell>{title}</TableCell>

                      <TableCell>{city}</TableCell>

                      <TableCell>{formatPrice(price)}</TableCell>

                      <TableCell>
                        <Badge variant={is_private ? "secondary" : "default"}>
                          {is_private ? "Private" : "Public"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No Deals Found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
