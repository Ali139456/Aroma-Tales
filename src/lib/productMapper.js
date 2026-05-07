/** Normalize DB row ↔ storefront product shape used across Shop / Detail / Cart */

/** URL slug from display name (admin auto-fill). */
export function slugifyFromName(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseJsonField(val, fallback) {
  if (val == null) return fallback
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return fallback
    }
  }
  return val
}

export function normalizeImages(images) {
  const arr = parseJsonField(images, [])
  if (!Array.isArray(arr)) return []
  return arr.filter(Boolean).map(String)
}

export function normalizeVariants(variants) {
  const arr = parseJsonField(variants, [{ label: '30ml' }, { label: '50ml' }])
  return Array.isArray(arr) && arr.length ? arr : [{ label: '30ml' }, { label: '50ml' }]
}

export function normalizeNotes(notes) {
  const n = parseJsonField(notes, {})
  return {
    top: n.top ?? '',
    heart: n.heart ?? '',
    base: n.base ?? '',
  }
}

/**
 * @param {Record<string, unknown>} row - Supabase products row
 * @returns {import('../context/ProductsContext').StoreProduct}
 */
export function mapRowToStoreProduct(row) {
  const images = normalizeImages(row.images)
  const primary = images[0] || '/favicon.svg'
  const saleRaw = row.sale_price
  const salePrice =
    saleRaw != null && saleRaw !== '' ? Number(saleRaw) : null

  const rawStatus = row.status
  const status =
    rawStatus === 'draft' || rawStatus === 'published' ? rawStatus : 'published'

  const sq = row.stock_quantity
  let stockQuantity = null
  if (sq != null && sq !== '') {
    const n = Math.floor(Number(sq))
    stockQuantity = Number.isFinite(n) ? Math.max(0, n) : null
  }

  const lst = row.low_stock_threshold
  const lowStockThreshold =
    lst != null && lst !== '' && Number.isFinite(Number(lst))
      ? Math.max(0, Math.floor(Number(lst)))
      : 5

  return {
    uuid: row.id,
    id: row.slug,
    name: row.title,
    category: row.category || 'Unisex',
    collectionId: row.collection_id ?? null,
    price: Number(row.price),
    price30ml: Number(row.price_30ml),
    salePrice: salePrice != null && !Number.isNaN(salePrice) ? salePrice : null,
    isBestSeller: Boolean(row.is_best_seller),
    image: primary,
    images,
    description: row.description || '',
    notes: normalizeNotes(row.notes),
    specs: parseJsonField(row.specs, {}),
    ingredients: Array.isArray(parseJsonField(row.ingredients, []))
      ? parseJsonField(row.ingredients, [])
      : [],
    variants: normalizeVariants(row.variants),
    status,
    stockQuantity,
    lowStockThreshold,
  }
}

/** Sale-adjusted prices for cart / display (proportional discount on 30ml). */
export function getEffectivePrices(product) {
  const base50 = product.price
  const base30 = product.price30ml
  const sale = product.salePrice
  if (sale != null && sale > 0 && sale < base50) {
    const ratio = sale / base50
    return {
      price: sale,
      price30ml: Math.max(0, Math.round(base30 * ratio)),
      onSale: true,
    }
  }
  return { price: base50, price30ml: base30, onSale: false }
}

/**
 * Build payload for Supabase insert/update
 * @param {object} form
 * @param {string|null} collectionId
 * @param {{ status?: 'draft'|'published' }} [options]
 */
export function mapFormToDbRow(form, collectionId, options = {}) {
  let images = []
  if (Array.isArray(form.imageUrls)) {
    images = form.imageUrls.map(String).map((u) => u.trim()).filter(Boolean)
  } else if (form.imagesJson != null) {
    try {
      images = JSON.parse(form.imagesJson || '[]')
    } catch {
      images = String(form.imagesJson || '')
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (!Array.isArray(images)) images = []
  }

  let variants = []
  const v30 = Boolean(form.variant30ml)
  const v50 = Boolean(form.variant50ml)
  if ('variant30ml' in form || 'variant50ml' in form) {
    if (v30) variants.push({ label: '30ml' })
    if (v50) variants.push({ label: '50ml' })
    if (!variants.length) variants = [{ label: '30ml' }, { label: '50ml' }]
  } else if (form.variantsJson != null) {
    try {
      variants = JSON.parse(form.variantsJson || '[]')
    } catch {
      variants = [{ label: '30ml' }, { label: '50ml' }]
    }
    if (!Array.isArray(variants) || !variants.length) {
      variants = [{ label: '30ml' }, { label: '50ml' }]
    }
  } else {
    variants = [{ label: '30ml' }, { label: '50ml' }]
  }

  let notes = { top: '', heart: '', base: '' }
  if (
    form.noteTop != null ||
    form.noteHeart != null ||
    form.noteBase != null
  ) {
    notes = {
      top: String(form.noteTop ?? '').trim(),
      heart: String(form.noteHeart ?? '').trim(),
      base: String(form.noteBase ?? '').trim(),
    }
  } else if (form.notesJson != null) {
    try {
      notes = JSON.parse(form.notesJson || '{}')
    } catch {
      notes = { top: '', heart: '', base: '' }
    }
  }

  const specs = {}
  if (
    form.specLasting != null ||
    form.specSillage != null ||
    form.specConcentration != null
  ) {
    const lasting = String(form.specLasting ?? '').trim()
    const sillage = String(form.specSillage ?? '').trim()
    const concentration = String(form.specConcentration ?? '').trim()
    if (lasting) specs.lasting = lasting
    if (sillage) specs.sillage = sillage
    if (concentration) specs.concentration = concentration
  } else if (form.specsJson != null) {
    try {
      Object.assign(specs, JSON.parse(form.specsJson || '{}'))
    } catch {
      /* keep {} */
    }
  }

  let ingredients = []
  if (Array.isArray(form.ingredientRows)) {
    ingredients = form.ingredientRows
      .filter(
        (r) =>
          r &&
          (String(r.name || '').trim() || String(r.percentage || '').trim())
      )
      .map((r) => ({
        name: String(r.name || '').trim(),
        percentage: String(r.percentage || '').trim(),
      }))
  } else if (form.ingredientsJson != null) {
    try {
      ingredients = JSON.parse(form.ingredientsJson || '[]')
    } catch {
      ingredients = []
    }
    if (!Array.isArray(ingredients)) ingredients = []
  }

  const saleNum =
    form.salePrice === '' || form.salePrice == null
      ? null
      : Number(form.salePrice)

  const stockRaw =
    form.stockQuantity == null ? '' : String(form.stockQuantity).trim()
  let stock_quantity = null
  if (stockRaw !== '') {
    const parsed = parseInt(stockRaw, 10)
    stock_quantity = Number.isFinite(parsed) ? Math.max(0, parsed) : null
  }

  const lt = Number(form.lowStockThreshold)
  const low_stock_threshold =
    Number.isFinite(lt) && lt >= 0 ? Math.floor(lt) : 5

  const status =
    options.status === 'draft' || options.status === 'published'
      ? options.status
      : 'published'

  const title =
    form.name != null
      ? String(form.name).trim()
      : String(form.title ?? '').trim()

  return {
    slug: form.slug.trim(),
    title,
    description: form.description || '',
    images,
    variants,
    price: Number(form.price),
    sale_price:
      saleNum != null && !Number.isNaN(saleNum) && saleNum > 0 ? saleNum : null,
    price_30ml: Number(form.price30ml),
    category: form.category || 'Unisex',
    collection_id: collectionId || null,
    is_best_seller: Boolean(form.isBestSeller),
    notes: {
      top: typeof notes.top === 'string' ? notes.top : '',
      heart: typeof notes.heart === 'string' ? notes.heart : '',
      base: typeof notes.base === 'string' ? notes.base : '',
    },
    specs,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    status,
    stock_quantity,
    low_stock_threshold,
  }
}

/** Null / absent stock means unlimited inventory for storefront checks. */
export function getTrackedStock(product) {
  if (!product || product.stockQuantity == null) return null
  const n = Number(product.stockQuantity)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.floor(n))
}

export function cartUnitsForProduct(cart, productId) {
  return cart
    .filter((i) => i.id === productId)
    .reduce((s, i) => s + i.quantity, 0)
}

export function cartUnitsForProductExcept(cart, productId, excludeSize) {
  return cart
    .filter((i) => i.id === productId && i.size !== excludeSize)
    .reduce((s, i) => s + i.quantity, 0)
}
