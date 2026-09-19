import { createClient } from "../lib/supabase/server";
import WatchlistEditor from "./WatchlistEditor";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  marketCap: number;
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"];

async function getStocks(symbols: string[]): Promise<Stock[]> {
  const key = process.env.FMP_API_KEY;
  if (!key || symbols.length === 0) return [];

  const lists = await Promise.all(
    symbols.map(async (symbol) => {
      const url =
        "https://financialmodelingprep.com/stable/quote?symbol=" +
        encodeURIComponent(symbol) +
        "&apikey=" +
        key;
      const res = await fetch(url, { next: { revalidate: 21600 } });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    })
  );

  return lists.flat();
}

function formatCap(value: number) {
  if (!value) return "—";
  if (value >= 1_000_000_000_000) {
    return (value / 1_000_000_000_000).toFixed(2) + "T";
  }
  return (value / 1_000_000_000).toFixed(1) + "B";
}

export default async function StocksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let symbols = DEFAULT_SYMBOLS;
  let isPersonalized = false;

  if (user) {
    const { data: watchlist } = await supabase
      .from("watchlist")
      .select("symbol")
      .order("created_at", { ascending: true });

    if (watchlist && watchlist.length > 0) {
      symbols = watchlist.map((row) => row.symbol);
      isPersonalized = true;
    }
  }

  const stocks = await getStocks(symbols);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">სტოკები</h1>
      <p className="text-purple-200 mb-8">
        {isPersonalized
          ? "შენი პირადი საყურებელი სია."
          : "პირველადი სია. მონაცემი შეიძლება დაგვიანებული იყოს."}
      </p>

      {user ? (
        <WatchlistEditor symbols={symbols} />
      ) : (
        <p className="mb-8 text-purple-300">
          <a href="/login" className="underline hover:text-white">
            შედი ანგარიშში
          </a>{" "}
          საკუთარი აქციების სიის ასაწყობად.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-purple-800/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-purple-950/80 text-purple-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">სახელი</th>
              <th className="p-3">ტიკერი</th>
              <th className="p-3">ფასი</th>
              <th className="p-3">ცვლილება</th>
              <th className="p-3">მარკეტქეფი</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={stock.symbol} className="border-t border-purple-800/50">
                <td className="p-3 text-purple-300">{index + 1}</td>
                <td className="p-3">{stock.name}</td>
                <td className="p-3">{stock.symbol}</td>
                <td className="p-3">${Number(stock.price || 0).toFixed(2)}</td>
                <td className="p-3">
                  {Number(stock.changePercentage || 0).toFixed(2)}%
                </td>
                <td className="p-3">{formatCap(stock.marketCap)}</td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td className="p-3 text-purple-300" colSpan={6}>
                  მონაცემი ვერ მოიძებნა.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
