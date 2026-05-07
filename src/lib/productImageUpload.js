/** Bucket configured in Supabase (see supabase/schema.sql or storage_product_images.sql). */
export const PRODUCT_IMAGES_BUCKET = 'product-images'

/**
 * Upload a product gallery image; returns public URL.
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string} productId - UUID of the product row
 * @param {File} file
 */
export async function uploadProductImage(client, productId, file) {
  if (!file || !productId) return null
  const rawExt = file.name.split('.').pop() || 'jpg'
  const ext = rawExt.replace(/[^\w]/g, '').slice(0, 8) || 'jpg'
  const path = `${productId}/img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
  const { error } = await client.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = client.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
