/** Bucket configured in Supabase (see supabase/storage_collection_covers.sql). */
export const COLLECTION_COVERS_BUCKET = 'collection-covers'

/**
 * Upload a cover image for a collection; returns public URL.
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string} collectionId
 * @param {File} file
 */
export async function uploadCollectionCover(client, collectionId, file) {
  if (!file || !collectionId) return null
  const rawExt = file.name.split('.').pop() || 'jpg'
  const ext = rawExt.replace(/[^\w]/g, '').slice(0, 8) || 'jpg'
  const path = `${collectionId}/cover-${Date.now()}.${ext}`
  const { error } = await client.storage
    .from(COLLECTION_COVERS_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = client.storage.from(COLLECTION_COVERS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
