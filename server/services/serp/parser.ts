export function parseSearchResult(result: any, category: string) {
  if (!result) return null;

  // Enhance price extraction targeting more SerpAPI formats
  let price = result.extracted_price;
  if (!price && result.price) {
    price = result.price?.value || result.price?.extracted_price;
    if (!price && result.price.raw) {
      const parsed = parseFloat(result.price.raw.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) price = parsed;
    } else if (typeof result.price === 'string') {
      const parsed = parseFloat(result.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) price = parsed;
    }
  }

  if (typeof price !== 'number' || price <= 0) return null;

  const name = result.title;
  let brand = result.brand;
  if (!brand && name) {
    brand = name.split(' ')[0];
  }

  // Map all available result fields into specs, minus the ones used at top-level
  const { title, extracted_price, price: pObj, thumbnail, link_clean, link, brand: bStr, ...otherSpecs } = result;

  return {
    name: name,
    brand: brand,
    price: price,
    image_url: result.thumbnail,
    buy_link: result.link_clean || result.link,
    source: "amazon.in",
    specs: otherSpecs,
    category: category
  };
}

export function parseProductDetail(detail: any, category: string, fallbackPrice: number) {
  if (!detail || !detail.product_results) return null;
  const pr = detail.product_results;
  
  const name = pr.title;
  
  let price = pr.extracted_price;
  if (!price && pr.price) {
    price = pr.price?.value || pr.price?.extracted_price;
    if (!price && pr.price.raw) {
      const parsed = parseFloat(pr.price.raw.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) price = parsed;
    } else if (typeof pr.price === 'string') {
      const parsed = parseFloat(pr.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) price = parsed;
    }
  }
  if (typeof price !== 'number' || price <= 0) {
    price = fallbackPrice;
  }
  
  if (!name || typeof price !== 'number' || price <= 0) return null;

  // Map all available result fields into specs
  const { title, extracted_price, price: pObj, thumbnail, thumbnails, link_clean, link, brand, ...otherSpecs } = pr;

  return {
    name: name,
    brand: pr.brand || name.split(' ')[0],
    price: price,
    image_url: pr.thumbnail || (pr.thumbnails && pr.thumbnails[0]),
    buy_link: pr.link_clean || pr.link,
    source: "amazon.in",
    category: category,
    specs: otherSpecs
  };
}
