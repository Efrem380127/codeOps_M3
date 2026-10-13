import Link from "next/link";

import EmptyState from "@/app/components/EmptyState";
import { price, number } from "@/lib/format";

/**
 * Stock on hand.
 *
 * The reorder alert is the reason this table exists: a pharmacy that runs out
 * of an antibiotic is a different problem from a shop that runs out of a book.
 * Rows at or below the threshold are marked in words AND the table is
 * ordered so they appear first — a colour alone would be invisible to anyone who
 * cannot see it.
 */
export default function StockTable({ medicines = [], threshold = 10 }) {
  if (medicines.length === 0) {
    return (
      <EmptyState icon="package" title="No stock recorded">
        The catalogue is empty.
      </EmptyState>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <caption>
          Stock on hand, lowest first. Anything at or below {threshold} units is
          at the reorder point.
        </caption>

        <thead>
          <tr>
            <th scope="col">Medicine</th>
            <th scope="col">Category</th>
            <th scope="col" className="num">
              Stock
            </th>
            <th scope="col" className="num">
              Unit price
            </th>
            <th scope="col" className="num">
              Retail value
            </th>
            <th scope="col">State</th>
          </tr>
        </thead>

        <tbody>
          {medicines.map((medicine) => {
            const low = medicine.stock <= threshold;
            const out = medicine.stock === 0;

            return (
              <tr key={medicine.id}>
                <th scope="row" style={{ fontWeight: 600 }}>
                  <Link href={`/medicines/${medicine.id}`}>{medicine.name}</Link>
                  <br />
                  <span className="small muted" style={{ fontWeight: 400 }}>
                    {medicine.genericName} · {medicine.strength}
                  </span>
                </th>
                <td>{medicine.category}</td>
                <td className="num">{number.format(medicine.stock)}</td>
                <td className="num">{price(medicine.price)}</td>
                <td className="num">{price(medicine.price * medicine.stock)}</td>
                <td>
                  {out ? (
                    <span className="status status--out">Out of stock</span>
                  ) : low ? (
                    <span className="status status--low">Reorder</span>
                  ) : (
                    <span className="status status--ok">Healthy</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
