import { searchProducts } from '../../server/services/serp/fetcher';

async function run() {
  const rs = await searchProducts("desktop CPU");
  console.log("total raw results:", rs.length);
  for (const r of rs) {
    if (!r) continue;
    console.log(r.title?.substring(0, 30));
    console.log("extracted_price:", r.extracted_price, "price:", r.price);
  }
}
run();
