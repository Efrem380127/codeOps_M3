import { price, dateOnly } from "@/lib/format";

/**
 * Accessible mirrors of the two charts.
 *
 * The reading sheet asks for a table alongside every chart, and this is why: a
 * Recharts <BarChart> renders an <svg> with no text a screen reader can follow.
 * Marking the chart aria-hidden and rendering the same numbers as a real table
 * means the data is available to everyone, and it also survives being printed or
 * pasted into a report.
 *
 * Both tables are Server Components — no JavaScript is shipped to draw them.
 */

export function RevenueTable({ data = [] }) {
  const total = data.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <div className="table-wrap mt-4">
      <table className="table">
        <caption>Revenue by therapeutic category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col" className="num">
              Revenue
            </th>
            <th scope="col" className="num">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.category}>
              <th scope="row" style={{ fontWeight: 600 }}>
                {row.category}
              </th>
              <td className="num">{price(row.revenue)}</td>
              <td className="num">
                {total === 0 ? "—" : `${((row.revenue / total) * 100).toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="num">
              <strong>{price(total)}</strong>
            </td>
            <td className="num">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function OrdersTimeTable({ data = [] }) {
  const totalOrders = data.reduce((sum, row) => sum + row.orders, 0);
  const totalRevenue = data.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <div className="table-wrap mt-4">
      <table className="table">
        <caption>Orders and revenue per day, last 14 days</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col" className="num">
              Orders
            </th>
            <th scope="col" className="num">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date}>
              <th scope="row" style={{ fontWeight: 600 }}>
                {dateOnly.format(new Date(`${row.date}T09:00:00.000Z`))}
              </th>
              <td className="num">{row.orders}</td>
              <td className="num">{price(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="num">
              <strong>{totalOrders}</strong>
            </td>
            <td className="num">
              <strong>{price(totalRevenue)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
