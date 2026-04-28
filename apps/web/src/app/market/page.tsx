import { api } from "@/lib/api";
import { formatCurrency, timeAgo } from "@/lib/format";

export default async function MarketPage() {
  const { items } = await api.getMarketItems();

  return (
    <main className="page-shell narrow">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Student listings</h1>
        </div>
        <button className="button" type="button">
          Sell item
        </button>
      </div>
      <div className="market-grid">
        {items.map((item) => (
          <article className="market-card" key={item.id}>
            <div className="market-thumb">{item.category.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.condition} · {item.campus}</p>
            </div>
            <div className="market-footer">
              <span>{formatCurrency(item.priceCents)}</span>
              <small>{timeAgo(item.createdAt)}</small>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
