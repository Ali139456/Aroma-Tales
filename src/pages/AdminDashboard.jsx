import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Layers,
  RefreshCw,
  Database,
  X,
  Upload,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { uploadCollectionCover } from '../lib/collectionCoverUpload';
import { uploadProductImage } from '../lib/productImageUpload';
import OrdersAdminSection from '../components/admin/OrdersAdminSection';
import ClientsAnalyticsSection from '../components/admin/ClientsAnalyticsSection';
import { useProducts } from '../context/ProductsContext';
import { products as staticSeed } from '../data/products';
import {
  mapFormToDbRow,
  getTrackedStock,
  slugifyFromName,
  getEffectivePrices,
} from '../lib/productMapper';
import {
  parseBrowseProductsField,
  serializeBrowseProductPaths,
  formatBrowseProductsPreview,
  resolveCollectionBrowseHref,
  canonicalizeBrowseProductsInput,
  browseProductsUrlToPlainText,
} from '../lib/browseProductsLink';
import { toastConfirm, toastSuccess, toastError } from '../lib/appToast';

const emptyForm = () => ({
  slug: '',
  name: '',
  description: '',
  imageUrls: [],
  variant30ml: true,
  variant50ml: true,
  price: '',
  salePrice: '',
  price30ml: '',
  category: 'Unisex',
  collectionId: '',
  isBestSeller: false,
  noteTop: '',
  noteHeart: '',
  noteBase: '',
  specLasting: '',
  specSillage: '',
  specConcentration: '',
  ingredientRows: [{ name: '', percentage: '' }],
  stockQuantity: '',
  lowStockThreshold: '5',
});

function storeProductToForm(p) {
  const imgs =
    p.images?.length ? [...p.images] : p.image ? [p.image] : [];
  const variants =
    p.variants?.length ? p.variants : [{ label: '30ml' }, { label: '50ml' }];
  const ing = Array.isArray(p.ingredients) ? p.ingredients : [];
  const sp = p.specs || {};
  return {
    slug: p.id,
    name: p.name,
    description: p.description || '',
    imageUrls: imgs.filter(Boolean).map(String),
    variant30ml: variants.some((v) => v.label === '30ml'),
    variant50ml: variants.some((v) => v.label === '50ml'),
    price: String(p.price),
    salePrice: p.salePrice != null ? String(p.salePrice) : '',
    price30ml: String(p.price30ml),
    category: p.category || 'Unisex',
    collectionId: p.collectionId || '',
    isBestSeller: Boolean(p.isBestSeller),
    noteTop: p.notes?.top ?? '',
    noteHeart: p.notes?.heart ?? '',
    noteBase: p.notes?.base ?? '',
    specLasting: sp.lasting != null ? String(sp.lasting) : '',
    specSillage: sp.sillage != null ? String(sp.sillage) : '',
    specConcentration:
      sp.concentration != null ? String(sp.concentration) : '',
    ingredientRows:
      ing.length > 0
        ? ing.map((row) => ({
            name: row.name != null ? String(row.name) : '',
            percentage:
              row.percentage != null ? String(row.percentage) : '',
          }))
        : [{ name: '', percentage: '' }],
    stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : '',
    lowStockThreshold: String(p.lowStockThreshold ?? 5),
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const productSlugManualRef = useRef(false);
  const {
    products: publishedProducts,
    catalogAll,
    loading: catalogLoading,
    remoteLoaded,
    loadError,
    refreshProducts,
  } = useProducts();
  const formRef = useRef(null);

  const [tab, setTab] = useState('products');
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collListSort, setCollListSort] = useState('display');
  const [crmError, setCrmError] = useState('');
  const [busy, setBusy] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingProductImages, setPendingProductImages] = useState([]);
  const [productUrlDraft, setProductUrlDraft] = useState('');
  const [browsePickerTarget, setBrowsePickerTarget] = useState(null);
  const [browsePickerSelectedPaths, setBrowsePickerSelectedPaths] = useState([]);
  const [browseSort, setBrowseSort] = useState('name_asc');

  const [newColl, setNewColl] = useState({
    name: '',
    image_url: '',
    tile_label: '',
    description: '',
    browse_products_url: '',
    sort_order: '0',
  });
  const [newCollCoverFile, setNewCollCoverFile] = useState(null);

  const [collModalOpen, setCollModalOpen] = useState(false);
  const [collForm, setCollForm] = useState({
    id: '',
    name: '',
    slug: '',
    image_url: '',
    tile_label: '',
    description: '',
    browse_products_url: '',
    sort_order: '0',
  });
  const [collCoverFile, setCollCoverFile] = useState(null);

  const collFilePreview = useMemo(() => {
    if (!collCoverFile) return null;
    return URL.createObjectURL(collCoverFile);
  }, [collCoverFile]);

  useEffect(() => {
    if (!collFilePreview) return undefined;
    return () => URL.revokeObjectURL(collFilePreview);
  }, [collFilePreview]);

  useEffect(() => {
    if (modalOpen) setProductUrlDraft('');
  }, [modalOpen]);

  const browseCatalogSorted = useMemo(() => {
    const list = [...catalogAll];
    const pa = (p) => getEffectivePrices(p).price;
    switch (browseSort) {
      case 'name_desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        list.sort((a, b) => pa(a) - pa(b));
        break;
      case 'price_desc':
        list.sort((a, b) => pa(b) - pa(a));
        break;
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [catalogAll, browseSort]);

  const toggleBrowsePickerPath = useCallback((path) => {
    setBrowsePickerSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }, []);

  const toggleBrowsePickerVisiblePage = useCallback(() => {
    const rowPaths = browseCatalogSorted.map((p) => `/product/${p.id}`);
    setBrowsePickerSelectedPaths((prev) => {
      const allOn =
        rowPaths.length > 0 && rowPaths.every((p) => prev.includes(p));
      if (allOn) return prev.filter((p) => !rowPaths.includes(p));
      return [...new Set([...prev, ...rowPaths])];
    });
  }, [browseCatalogSorted]);

  const applyBrowsePicker = useCallback(() => {
    const serialized = serializeBrowseProductPaths(browsePickerSelectedPaths);
    if (browsePickerTarget === 'newColl') {
      setNewColl((s) => ({ ...s, browse_products_url: serialized }));
    } else if (browsePickerTarget === 'editColl') {
      setCollForm((s) => ({ ...s, browse_products_url: serialized }));
    }
    setBrowsePickerTarget(null);
  }, [browsePickerTarget, browsePickerSelectedPaths]);

  useEffect(() => {
    if (!browsePickerTarget) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setBrowsePickerTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [browsePickerTarget]);

  const loadCollections = useCallback(async () => {
    if (!supabase) {
      setCollections([]);
      setCollectionsLoading(false);
      return;
    }
    setCollectionsLoading(true);
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    setCollectionsLoading(false);
    if (error) {
      setCrmError(error.message);
      return;
    }
    setCollections(data || []);
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const refreshOrders = useCallback(async () => {
    if (!supabase) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(800);
    setOrdersLoading(false);
    if (error) {
      setCrmError(error.message);
      setOrders([]);
      return;
    }
    setOrders(data || []);
  }, []);

  useEffect(() => {
    if (tab === 'orders' || tab === 'clients') refreshOrders();
  }, [tab, refreshOrders]);

  const sortedCollections = useMemo(() => {
    const arr = [...collections];
    if (collListSort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (collListSort === 'slug') arr.sort((a, b) => a.slug.localeCompare(b.slug));
    else
      arr.sort(
        (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.name.localeCompare(b.name)
      );
    return arr;
  }, [collections, collListSort]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  useEffect(() => {
    if (!collModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setCollModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [collModalOpen]);

  const collectionOptions = useMemo(
    () =>
      collections.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      )),
    [collections]
  );

  const clearPendingProductImages = useCallback(() => {
    setPendingProductImages((prev) => {
      prev.forEach((entry) => {
        if (entry?.url) URL.revokeObjectURL(entry.url);
      });
      return [];
    });
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const openCreate = () => {
    setCrmError('');
    productSlugManualRef.current = false;
    setEditingId(null);
    setForm(emptyForm());
    clearPendingProductImages();
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setCrmError('');
    productSlugManualRef.current = false;
    setEditingId(p.uuid);
    setForm(storeProductToForm(p));
    clearPendingProductImages();
    setModalOpen(true);
  };

  const persistProduct = async (statusIntent) => {
    if (!form.variant30ml && !form.variant50ml) {
      setCrmError('Choose at least one variant size (30ml and/or 50ml).');
      return;
    }
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    setCrmError('');
    if (!supabase) {
      setCrmError('Supabase client unavailable.');
      return;
    }
    setBusy(true);
    try {
      const payload = mapFormToDbRow(form, form.collectionId || null, {
        status: statusIntent,
      });
      let rowId = editingId;
      if (editingId) {
        payload.updated_at = new Date().toISOString();
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        rowId = data?.id ?? null;
      }

      if (pendingProductImages.length && rowId) {
        const uploaded = [];
        for (const entry of pendingProductImages) {
          const url = await uploadProductImage(supabase, rowId, entry.file);
          if (url) uploaded.push(url);
        }
        if (uploaded.length) {
          const merged = [...(payload.images || []), ...uploaded];
          const { error: imgErr } = await supabase
            .from('products')
            .update({
              images: merged,
              updated_at: new Date().toISOString(),
            })
            .eq('id', rowId);
          if (imgErr) throw imgErr;
        }
      }

      clearPendingProductImages();
      setModalOpen(false);
      await refreshProducts();
    } catch (err) {
      setCrmError(err.message || String(err));
    }
    setBusy(false);
  };

  const deleteProduct = async (uuid, title) => {
    if (!supabase || !uuid) return;
    const ok = await toastConfirm(`Delete “${title}”?`, 'This cannot be undone.', {
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    setBusy(true);
    setCrmError('');
    const { error } = await supabase.from('products').delete().eq('id', uuid);
    setBusy(false);
    if (error) {
      toastError('Could not delete product', error.message);
      setCrmError(error.message);
      return;
    }
    await refreshProducts();
    toastSuccess('Product deleted');
  };

  const addCollection = async (e) => {
    e.preventDefault();
    setCrmError('');
    if (!supabase) return;
    const slug = slugifyFromName(newColl.name.trim());
    if (!newColl.name.trim() || !slug) {
      setCrmError('Collection name is required (it generates the URL slug).');
      return;
    }
    const urlField = newColl.image_url.trim();
    setBusy(true);
    try {
      const sortNum = parseInt(String(newColl.sort_order).trim(), 10);
      const { data: row, error: insertErr } = await supabase
        .from('collections')
        .insert({
          name: newColl.name.trim(),
          slug,
          image_url: urlField || null,
          tile_label: newColl.tile_label.trim() || null,
          description: newColl.description.trim() || '',
          browse_products_url:
            canonicalizeBrowseProductsInput(newColl.browse_products_url) || null,
          sort_order: Number.isFinite(sortNum) ? sortNum : 0,
        })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      if (newCollCoverFile && row?.id) {
        const publicUrl = await uploadCollectionCover(supabase, row.id, newCollCoverFile);
        const { error: upErr } = await supabase
          .from('collections')
          .update({ image_url: publicUrl })
          .eq('id', row.id);
        if (upErr) throw upErr;
      }
      setNewColl({
        name: '',
        image_url: '',
        tile_label: '',
        description: '',
        browse_products_url: '',
        sort_order: '0',
      });
      setNewCollCoverFile(null);
      await loadCollections();
    } catch (err) {
      setCrmError(err.message || String(err));
    }
    setBusy(false);
  };

  const openEditCollection = (c) => {
    setCrmError('');
    setCollForm({
      id: c.id,
      name: c.name || '',
      slug: c.slug || '',
      image_url: c.image_url || '',
      tile_label: c.tile_label || '',
      description: c.description || '',
      browse_products_url: browseProductsUrlToPlainText(c.browse_products_url || ''),
      sort_order: String(c.sort_order ?? 0),
    });
    setCollCoverFile(null);
    setCollModalOpen(true);
  };

  const persistCollection = async () => {
    if (!supabase || !collForm.id) return;
    const slug = collForm.slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!collForm.name.trim() || !slug) {
      setCrmError('Name is required.');
      return;
    }
    setBusy(true);
    setCrmError('');
    try {
      let image_url = collForm.image_url.trim() || null;
      if (collCoverFile) {
        image_url = await uploadCollectionCover(supabase, collForm.id, collCoverFile);
      }
      const sortNum = parseInt(String(collForm.sort_order).trim(), 10);
      const { error } = await supabase
        .from('collections')
        .update({
          name: collForm.name.trim(),
          slug,
          image_url,
          tile_label: collForm.tile_label.trim() || null,
          description: collForm.description.trim() || '',
          browse_products_url:
            canonicalizeBrowseProductsInput(collForm.browse_products_url) || null,
          sort_order: Number.isFinite(sortNum) ? sortNum : 0,
        })
        .eq('id', collForm.id);
      if (error) throw error;
      setCollModalOpen(false);
      setCollCoverFile(null);
      await loadCollections();
      await refreshProducts();
    } catch (err) {
      setCrmError(err.message || String(err));
    }
    setBusy(false);
  };

  const deleteCollection = async (id, name) => {
    if (!supabase) return;
    const ok = await toastConfirm(`Delete collection “${name}”?`, 'Products keep their category text but lose this collection link.', {
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    setBusy(true);
    const { error } = await supabase.from('collections').delete().eq('id', id);
    setBusy(false);
    if (error) {
      toastError('Could not delete collection', error.message);
      setCrmError(error.message);
      return;
    }
    await loadCollections();
    await refreshProducts();
    toastSuccess('Collection deleted');
  };

  const seedFromStatic = async () => {
    if (!supabase) return;
    const ok = await toastConfirm(
      'Seed sample catalog?',
      'Upserts all sample fragrances from the codebase into Supabase (matched by slug).',
      { confirmLabel: 'Seed catalog', cancelLabel: 'Cancel' }
    );
    if (!ok) return;
    setBusy(true);
    setCrmError('');
    const { data: cols, error: cErr } = await supabase.from('collections').select('id, slug');
    if (cErr) {
      toastError('Seed failed', cErr.message);
      setCrmError(cErr.message);
      setBusy(false);
      return;
    }
    const collMap = Object.fromEntries((cols || []).map((c) => [c.slug, c.id]));
    const catSlug = { Mens: 'mens', Womens: 'womens', Unisex: 'unisex' };

    const rows = staticSeed.map((p) => {
      const slugKey = catSlug[p.category] || 'unisex';
      const collectionId = collMap[slugKey] || null;
      const f = storeProductToForm({
        ...p,
        salePrice: null,
        images: [p.image],
        variants: [{ label: '30ml' }, { label: '50ml' }],
        uuid: null,
        collectionId,
      });
      return mapFormToDbRow(f, collectionId);
    });

    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'slug' });
    setBusy(false);
    if (error) {
      toastError('Seed failed', error.message);
      setCrmError(error.message);
      return;
    }
    await refreshProducts();
    toastSuccess('Sample catalog synced');
  };

  const inputCls =
    'w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm outline-none focus:border-dark transition-colors';

  const modalFieldCls =
    'w-full rounded-2xl border border-dark/10 bg-white px-4 py-3.5 text-sm text-dark placeholder:text-dark/30 outline-none shadow-[0_2px_12px_-4px_rgba(18,18,18,0.08)] transition-all focus:border-dark focus:shadow-[0_0_0_3px_rgba(18,18,18,0.06)] disabled:bg-dark/[0.04] disabled:text-dark/45';

  const modalSelectCls =
    'w-full rounded-2xl border border-dark/10 bg-white ps-4 pe-10 py-3.5 text-sm text-dark outline-none shadow-[0_2px_12px_-4px_rgba(18,18,18,0.08)] transition-all focus:border-dark focus:shadow-[0_0_0_3px_rgba(18,18,18,0.06)] disabled:bg-dark/[0.04] disabled:text-dark/45';

  const modalLabelCls = 'text-[10px] uppercase tracking-[0.28em] font-bold text-dark/45 ml-0.5';

  const modalSectionTitle =
    'flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] font-bold text-gold pt-1';

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-dark">
      <header className="bg-white border-b border-dark/5 sticky top-0 z-20">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-red-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-red-600">Admin CRM</p>
              <h1 className="text-lg font-serif tracking-tight">Catalog</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                refreshProducts();
                refreshOrders();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark/10 text-[10px] uppercase tracking-[0.2em] font-bold text-dark/60 hover:bg-dark hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh data
            </button>
            <Link
              to="/"
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-dark/45 hover:text-dark transition-colors px-2"
            >
              View storefront
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-dark/15 text-[11px] uppercase tracking-[0.2em] font-bold text-dark/70 hover:bg-dark hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-10 space-y-8">
        {(crmError || loadError) && (
          <div className="rounded-2xl bg-red-50 border border-red-100 text-red-800 text-sm px-5 py-4">
            {crmError || loadError}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-sm px-5 py-4">
            Configure <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> in <code className="font-mono text-xs">.env</code>.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3"
        >
          <button
            type="button"
            onClick={() => setTab('products')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold transition-colors ${
              tab === 'products' ? 'bg-dark text-white' : 'bg-white border border-dark/10 text-dark/60 hover:border-dark/25'
            }`}
          >
            <Package className="w-4 h-4" />
            Products
          </button>
          <button
            type="button"
            onClick={() => setTab('collections')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold transition-colors ${
              tab === 'collections' ? 'bg-dark text-white' : 'bg-white border border-dark/10 text-dark/60 hover:border-dark/25'
            }`}
          >
            <Layers className="w-4 h-4" />
            Collections
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold transition-colors ${
              tab === 'orders' ? 'bg-dark text-white' : 'bg-white border border-dark/10 text-dark/60 hover:border-dark/25'
            }`}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            Orders
          </button>
          <button
            type="button"
            onClick={() => setTab('clients')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold transition-colors ${
              tab === 'clients' ? 'bg-dark text-white' : 'bg-white border border-dark/10 text-dark/60 hover:border-dark/25'
            }`}
          >
            <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
            Clients
          </button>
        </motion.div>

        {(tab === 'products' || tab === 'collections') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-dark/5 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/35 mb-2">Published on storefront</p>
              <p className="text-3xl font-serif">{catalogLoading ? '…' : publishedProducts.length}</p>
              <p className="text-xs text-dark/45 mt-1">
                {catalogLoading
                  ? '…'
                  : `${catalogAll.filter((p) => (p.status ?? 'published') === 'draft').length} drafts`}
                {' · '}
                {remoteLoaded ? 'Supabase' : 'Fallback catalog'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-dark/5 p-6 shadow-sm sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/35 mb-2">Quick actions</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <button
                  type="button"
                  disabled={busy || !supabase}
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-dark text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-dark transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  New product
                </button>
                <button
                  type="button"
                  disabled={busy || !supabase}
                  onClick={seedFromStatic}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-dark/15 text-[10px] uppercase tracking-[0.2em] font-bold text-dark/70 hover:bg-white transition-colors disabled:opacity-40"
                >
                  <Database className="w-4 h-4" />
                  Seed sample catalog
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="bg-white rounded-2xl border border-dark/5 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-dark/5 flex justify-between items-center flex-wrap gap-3">
              <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40">Product listing</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark/5 text-left text-[10px] uppercase tracking-[0.2em] text-dark/35 font-bold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4 hidden md:table-cell">Slug</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Sale</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 hidden md:table-cell text-right tabular-nums">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogAll.map((p) => (
                    <tr key={p.id} className="border-b border-dark/5 hover:bg-offwhite/80 transition-colors">
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-dark/45 hidden md:table-cell font-mono text-xs">{p.id}</td>
                      <td className="px-6 py-4 tabular-nums">Rs.{p.price}</td>
                      <td className="px-6 py-4 tabular-nums text-dark/45 hidden lg:table-cell">
                        {p.salePrice != null ? `Rs.${p.salePrice}` : '—'}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold ${
                            (p.status ?? 'published') === 'draft'
                              ? 'bg-amber-50 text-amber-900 border border-amber-100'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                          }`}
                        >
                          {(p.status ?? 'published') === 'draft' ? 'Draft' : 'Live'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark/55 hidden md:table-cell text-right tabular-nums text-xs font-medium">
                        {getTrackedStock(p) == null ? (
                          <span title="Unlimited">∞</span>
                        ) : (
                          <span
                            className={
                              p.stockQuantity <= (p.lowStockThreshold ?? 5)
                                ? 'text-orange-700 font-bold'
                                : ''
                            }
                          >
                            {p.stockQuantity}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={busy || !remoteLoaded || !p.uuid}
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold text-dark/60 hover:bg-dark hover:text-white transition-colors disabled:opacity-30 mr-2"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busy || !remoteLoaded || !p.uuid}
                          onClick={() => deleteProduct(p.uuid, p.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!remoteLoaded && (
              <p className="px-6 py-6 text-sm text-dark/45 font-light">
                Editing requires rows in Supabase (UUID). Seed the catalog or sync products into the database—fallback items from{' '}
                <code className="text-xs">products.js</code> cannot be updated remotely.
              </p>
            )}
          </div>
        )}

        {tab === 'collections' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-dark/5 p-8 shadow-sm space-y-6">
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40">Add collection</p>
              <p className="text-xs text-dark/45 font-light leading-relaxed">
                Upload a cover image or paste an image URL. Buckets:{' '}
                <code className="font-mono text-[11px]">collection-covers</code>,{' '}
                <code className="font-mono text-[11px]">product-images</code> — run the SQL under{' '}
                <code className="font-mono text-[11px]">supabase/</code> if uploads fail.
              </p>
              <form className="space-y-4" onSubmit={addCollection}>
                <input
                  className={inputCls}
                  placeholder="Name (e.g. Mens) — slug is generated from this"
                  value={newColl.name}
                  onChange={(e) => setNewColl((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Tile label (optional, storefront headline)"
                  value={newColl.tile_label}
                  onChange={(e) => setNewColl((s) => ({ ...s, tile_label: e.target.value }))}
                />
                <textarea
                  className={`${inputCls} min-h-[88px] resize-y`}
                  placeholder="Description (shown under tile on homepage)"
                  value={newColl.description}
                  onChange={(e) => setNewColl((s) => ({ ...s, description: e.target.value }))}
                />
                <div className="rounded-xl border border-dark/10 bg-white px-4 py-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                    Browse products link
                  </p>
                  <p className="text-xs text-dark/50 font-light break-all">
                    {newColl.browse_products_url.trim()
                      ? formatBrowseProductsPreview(newColl.browse_products_url, 4)
                      : 'Default: shop filtered by collection name'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBrowsePickerSelectedPaths(
                          parseBrowseProductsField(newColl.browse_products_url)
                        );
                        setBrowsePickerTarget('newColl');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark/15 text-[10px] uppercase tracking-[0.18em] font-bold text-dark/70 hover:bg-offwhite transition-colors"
                    >
                      Pick from catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewColl((s) => ({ ...s, browse_products_url: '' }))}
                      className="text-[10px] uppercase tracking-[0.18em] font-bold text-dark/45 hover:text-dark"
                    >
                      Use default
                    </button>
                  </div>
                  <textarea
                    className={`${inputCls} min-h-[104px] resize-y font-light leading-relaxed`}
                    placeholder="/product/black-stone — add one path per line to link several products"
                    value={newColl.browse_products_url}
                    onChange={(e) =>
                      setNewColl((s) => ({ ...s, browse_products_url: e.target.value }))
                    }
                    spellCheck={false}
                  />
                  <span className="text-[10px] text-dark/35 font-light leading-snug block">
                    Plain text: one URL path per line (or comma-separated). Product slug alone works (e.g.{' '}
                    <span className="font-medium text-dark/45">black-stone</span>). No JSON.
                  </span>
                </div>
                <input
                  type="number"
                  className={`${inputCls} tabular-nums`}
                  placeholder="Sort order (lower first)"
                  value={newColl.sort_order}
                  onChange={(e) => setNewColl((s) => ({ ...s, sort_order: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Cover image URL (optional if you upload a file)"
                  value={newColl.image_url}
                  onChange={(e) => setNewColl((s) => ({ ...s, image_url: e.target.value }))}
                />
                <label className="flex flex-col gap-2 cursor-pointer">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-dark/40">
                    Upload cover (JPEG / PNG / WebP)
                  </span>
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-dark/15 bg-offwhite py-4 px-4 text-[11px] font-bold text-dark/55 hover:border-dark/25 hover:bg-white transition-colors">
                    <Upload className="w-4 h-4" strokeWidth={1.5} />
                    {newCollCoverFile ? newCollCoverFile.name : 'Choose file'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setNewCollCoverFile(f || null);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy || !supabase}
                  className="w-full py-4 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-dark transition-colors disabled:opacity-40"
                >
                  Create collection
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl border border-dark/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-dark/5 flex flex-wrap justify-between items-center gap-4 bg-[#f7f7f7]/90">
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40">
                  Existing ({collectionsLoading ? '…' : collections.length})
                </span>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/45">
                    Sort list
                  </span>
                  <select
                    className="min-h-[42px] min-w-[200px] appearance-none rounded-full border border-dark/18 bg-white py-2.5 pl-4 pr-11 text-[12px] font-medium text-dark/55 shadow-[0_2px_8px_-2px_rgba(18,18,18,0.1)] outline-none ring-1 ring-dark/5 transition-[box-shadow] hover:border-dark/28 focus:border-dark/35 focus:ring-2 focus:ring-dark/10"
                    value={collListSort}
                    onChange={(e) => setCollListSort(e.target.value)}
                    aria-label="Sort collections list"
                  >
                    <option value="display">Sort order → name</option>
                    <option value="name">Name A–Z</option>
                    <option value="slug">Slug A–Z</option>
                  </select>
                </div>
              </div>
              <ul className="divide-y divide-dark/5">
                {sortedCollections.map((c) => {
                  const browseHref = resolveCollectionBrowseHref(c.browse_products_url, c.name);
                  return (
                  <li key={c.id} className="px-6 py-4 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-dark/[0.04] overflow-hidden shrink-0 border border-dark/8">
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-wider font-bold text-dark/25 text-center px-1">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.tile_label?.trim() || c.name}</p>
                        <p className="text-xs text-dark/40 font-mono truncate">{c.slug}</p>
                        {c.description?.trim() && (
                          <p className="text-[11px] text-dark/45 mt-1 line-clamp-2 font-light">{c.description}</p>
                        )}
                        <a
                          href={browseHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-[10px] uppercase tracking-[0.15em] font-bold text-gold hover:underline"
                        >
                          Browse products →
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busy || !supabase}
                        onClick={() => openEditCollection(c)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold text-dark/60 hover:bg-dark hover:text-white transition-colors disabled:opacity-30"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteCollection(c.id, c.name)}
                        className="text-[10px] uppercase tracking-[0.15em] font-bold text-red-600 hover:underline px-2 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <OrdersAdminSection
            supabase={supabase}
            catalogAll={catalogAll}
            orders={orders}
            ordersLoading={ordersLoading}
            refreshOrders={refreshOrders}
            inputCls={inputCls}
            setCrmError={setCrmError}
            busy={busy}
            setBusy={setBusy}
          />
        )}

        {tab === 'clients' && (
          <ClientsAnalyticsSection
            orders={orders}
            ordersLoading={ordersLoading}
            refreshOrders={refreshOrders}
          />
        )}
      </main>

      {modalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[200] overflow-y-auto overscroll-y-contain bg-dark/45 backdrop-blur-md px-4 py-10 md:py-14"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="relative mx-auto w-full max-w-2xl rounded-[2rem] border border-dark/8 bg-offwhite shadow-[0_32px_120px_-36px_rgba(18,18,18,0.45)] overflow-hidden mb-16 flex flex-col min-h-0 max-h-[min(92vh,calc(100vh-5rem))]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 relative px-8 pt-8 pb-6 md:px-10 border-b border-dark/6 bg-white/90 backdrop-blur-xl">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/70 to-transparent rounded-l-[2rem] opacity-90" aria-hidden />
              <div className="flex justify-between items-start gap-4 pl-2">
                <div className="space-y-3 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-px bg-gold shrink-0" aria-hidden />
                    <p className="text-[10px] uppercase tracking-[0.38em] font-bold text-gold">
                      {editingId ? 'Edit product' : 'New product'}
                    </p>
                  </div>
                  <h2 id="product-modal-title" className="text-3xl md:text-[2rem] font-serif text-dark tracking-tight leading-tight">
                    Catalog details
                  </h2>
                  <p className="text-sm text-dark/45 font-light leading-relaxed max-w-lg">
                    Slug appears in the URL; pricing syncs with shop cards and product pages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="shrink-0 w-11 h-11 rounded-full border border-dark/10 bg-white flex items-center justify-center text-dark/50 hover:bg-dark hover:text-white hover:border-dark transition-all duration-300 shadow-sm"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <form
              ref={formRef}
              className="flex flex-col flex-1 min-h-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto min-h-0 overscroll-contain touch-pan-y px-8 py-6 md:px-10 space-y-8 custom-scrollbar [scrollbar-gutter:stable]"
              >
                <div className="space-y-5">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Identity
                  </p>
                  <div className="grid grid-cols-1 gap-5">
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Name</span>
                      <input
                        className={modalFieldCls}
                        required
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setForm((f) =>
                            !editingId && !productSlugManualRef.current
                              ? { ...f, name, slug: slugifyFromName(name) }
                              : { ...f, name }
                          );
                        }}
                        placeholder="Black Stone"
                      />
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Slug (URL)</span>
                      <input
                        className={modalFieldCls}
                        required
                        disabled={Boolean(editingId)}
                        value={form.slug}
                        onChange={(e) => {
                          productSlugManualRef.current = true;
                          setForm((f) => ({ ...f, slug: e.target.value }));
                        }}
                        placeholder="black-stone"
                      />
                      {!editingId && (
                        <span className="text-[11px] text-dark/35 font-light block">
                          Generated from the name — tweak only if you need a different URL.
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Story
                  </p>
                  <label className="block space-y-2.5">
                    <span className={modalLabelCls}>Description</span>
                    <textarea
                      className={`${modalFieldCls} min-h-[140px] resize-y font-light leading-relaxed`}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="space-y-5">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Media & variants
                  </p>
                  <div className="space-y-3">
                    <span className={`${modalLabelCls} block`}>Images</span>
                    <div className="flex flex-wrap gap-3">
                      {form.imageUrls.map((url, idx) => {
                        const u = String(url).trim();
                        if (!u) return null;
                        return (
                        <div
                          key={`img-${idx}-${u.slice(0, 48)}`}
                          className="relative w-[5.5rem] h-[5.5rem] rounded-xl border border-dark/10 overflow-hidden bg-dark/[0.04] shadow-sm"
                        >
                          <img src={u} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                imageUrls: f.imageUrls.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-dark/75 text-white text-xs font-bold hover:bg-dark"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                        );
                      })}
                      {pendingProductImages.map((entry) => (
                        <div
                          key={entry.id}
                          className="relative w-[5.5rem] h-[5.5rem] rounded-xl border border-dashed border-gold/50 overflow-hidden bg-white"
                        >
                          <img
                            src={entry.url}
                            alt=""
                            className="w-full h-full object-cover opacity-90"
                          />
                          <span className="absolute bottom-1 left-1 text-[8px] uppercase tracking-wider font-bold bg-gold/90 text-dark px-1.5 py-0.5 rounded">
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingProductImages((prev) => {
                                URL.revokeObjectURL(entry.url);
                                return prev.filter((e) => e.id !== entry.id);
                              })
                            }
                            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-dark/75 text-white text-xs font-bold hover:bg-dark"
                            aria-label="Remove queued upload"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-dark/15 bg-white py-3.5 px-5 cursor-pointer hover:border-dark/25 transition-colors shadow-sm w-full sm:w-auto">
                      <Upload className="w-4 h-4 text-dark/50" strokeWidth={1.5} />
                      <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-dark/55">
                        Upload images
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          const files = [...(e.target.files || [])];
                          if (!files.length) return;
                          setPendingProductImages((prev) => [
                            ...prev,
                            ...files.map((file) => ({
                              id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                              file,
                              url: URL.createObjectURL(file),
                            })),
                          ]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <input
                        className={modalFieldCls}
                        placeholder="Or paste image URL (path or https://)"
                        value={productUrlDraft}
                        onChange={(e) => setProductUrlDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const u = productUrlDraft.trim();
                            if (!u) return;
                            setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, u] }));
                            setProductUrlDraft('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const u = productUrlDraft.trim();
                          if (!u) return;
                          setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, u] }));
                          setProductUrlDraft('');
                        }}
                        className="shrink-0 px-6 py-3.5 rounded-full border border-dark/15 text-[10px] uppercase tracking-[0.2em] font-bold text-dark/70 hover:bg-white transition-colors"
                      >
                        Add URL
                      </button>
                    </div>
                    <span className="text-[11px] text-dark/35 font-light">
                      Uploads save after you publish — ensure the{' '}
                      <code className="text-dark/50 text-[10px]">product-images</code> bucket exists in Supabase.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-8 rounded-2xl border border-dark/8 bg-white px-5 py-4 shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.variant30ml}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, variant30ml: e.target.checked }))
                        }
                        className="rounded border-dark/25 w-4 h-4 accent-dark"
                      />
                      <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-dark/55">
                        Offer 30ml
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.variant50ml}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, variant50ml: e.target.checked }))
                        }
                        className="rounded border-dark/25 w-4 h-4 accent-dark"
                      />
                      <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-dark/55">
                        Offer 50ml
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Pricing
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Price (50ml)</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        className={`${modalFieldCls} tabular-nums`}
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      />
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Sale price</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`${modalFieldCls} tabular-nums`}
                        value={form.salePrice}
                        onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                        placeholder="Optional"
                      />
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Price (30ml)</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        className={`${modalFieldCls} tabular-nums`}
                        value={form.price30ml}
                        onChange={(e) => setForm((f) => ({ ...f, price30ml: e.target.value }))}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Inventory
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Units in stock</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`${modalFieldCls} tabular-nums`}
                        value={form.stockQuantity}
                        onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                        placeholder="Leave blank for unlimited"
                      />
                      <span className="text-[11px] text-dark/35 font-light">
                        Tracked across cart sizes (30ml + 50ml share one pool).
                      </span>
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Low-stock threshold</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`${modalFieldCls} tabular-nums`}
                        value={form.lowStockThreshold}
                        onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                      />
                      <span className="text-[11px] text-dark/35 font-light">
                        Table highlights orange when units remaining ≤ this number.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Merchandising
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Category</span>
                      <select
                        className={modalSelectCls}
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      >
                        {['Mens', 'Womens', 'Unisex'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Collection link</span>
                      <select
                        className={modalSelectCls}
                        value={form.collectionId}
                        onChange={(e) => setForm((f) => ({ ...f, collectionId: e.target.value }))}
                      >
                        <option value="">None</option>
                        {collectionOptions}
                      </select>
                    </label>
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer rounded-2xl border border-dark/8 bg-white px-5 py-4 shadow-sm hover:border-dark/15 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.isBestSeller}
                      onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))}
                      className="rounded border-dark/25 w-4 h-4 accent-dark"
                    />
                    <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-dark/55">
                      Show bestseller badge on storefront
                    </span>
                  </label>
                </div>

                <div className="space-y-5 pb-2">
                  <p className={modalSectionTitle}>
                    <span className="h-px w-6 bg-gold/60 shrink-0" aria-hidden />
                    Fragrance details
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <label className="block space-y-2.5 md:col-span-3">
                      <span className={modalLabelCls}>Top notes</span>
                      <input
                        className={modalFieldCls}
                        value={form.noteTop}
                        onChange={(e) => setForm((f) => ({ ...f, noteTop: e.target.value }))}
                        placeholder="Woody, Agarwood"
                      />
                    </label>
                    <label className="block space-y-2.5 md:col-span-3">
                      <span className={modalLabelCls}>Heart notes</span>
                      <input
                        className={modalFieldCls}
                        value={form.noteHeart}
                        onChange={(e) => setForm((f) => ({ ...f, noteHeart: e.target.value }))}
                      />
                    </label>
                    <label className="block space-y-2.5 md:col-span-3">
                      <span className={modalLabelCls}>Base notes</span>
                      <input
                        className={modalFieldCls}
                        value={form.noteBase}
                        onChange={(e) => setForm((f) => ({ ...f, noteBase: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Lasting</span>
                      <input
                        className={modalFieldCls}
                        value={form.specLasting}
                        onChange={(e) => setForm((f) => ({ ...f, specLasting: e.target.value }))}
                        placeholder="12–14 hours"
                      />
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Sillage</span>
                      <input
                        className={modalFieldCls}
                        value={form.specSillage}
                        onChange={(e) => setForm((f) => ({ ...f, specSillage: e.target.value }))}
                        placeholder="Strong"
                      />
                    </label>
                    <label className="block space-y-2.5">
                      <span className={modalLabelCls}>Concentration</span>
                      <input
                        className={modalFieldCls}
                        value={form.specConcentration}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, specConcentration: e.target.value }))
                        }
                        placeholder="40% (Extrait De Parfum)"
                      />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <span className={`${modalLabelCls} block`}>Ingredients</span>
                    <div className="space-y-3">
                      {form.ingredientRows.map((row, idx) => (
                        <div key={idx} className="flex flex-wrap gap-2 items-center">
                          <input
                            className={`${modalFieldCls} flex-1 min-w-[140px]`}
                            placeholder="Accord name"
                            value={row.name}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((f) => {
                                const next = [...f.ingredientRows];
                                next[idx] = { ...next[idx], name: v };
                                return { ...f, ingredientRows: next };
                              });
                            }}
                          />
                          <input
                            className={`${modalFieldCls} w-full sm:w-28 tabular-nums`}
                            placeholder="%"
                            value={row.percentage}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((f) => {
                                const next = [...f.ingredientRows];
                                next[idx] = { ...next[idx], percentage: v };
                                return { ...f, ingredientRows: next };
                              });
                            }}
                          />
                          {form.ingredientRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  ingredientRows: f.ingredientRows.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-[10px] uppercase tracking-[0.15em] font-bold text-red-600 hover:underline px-2"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          ingredientRows: [
                            ...f.ingredientRows,
                            { name: '', percentage: '' },
                          ],
                        }))
                      }
                      className="text-[10px] uppercase tracking-[0.18em] font-bold text-dark/55 hover:text-dark border border-dark/12 rounded-full px-4 py-2"
                    >
                      + Add ingredient
                    </button>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-dark/8 bg-white/95 backdrop-blur-xl px-8 py-5 md:px-10 flex flex-wrap gap-3 justify-end items-center shadow-[0_-12px_40px_-28px_rgba(18,18,18,0.12)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-8 py-4 rounded-full border border-dark/12 text-[11px] uppercase tracking-[0.28em] font-bold text-dark/55 hover:bg-offwhite hover:border-dark/25 transition-colors order-3 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => persistProduct('draft')}
                  className="order-2 px-8 py-4 rounded-full border border-dark/18 text-[11px] uppercase tracking-[0.28em] font-bold text-dark hover:bg-dark hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  {busy ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => persistProduct('published')}
                  className="order-1 sm:order-3 min-w-[200px] flex-1 sm:flex-none py-4 px-10 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.28em] font-bold hover:bg-gold hover:text-dark transition-colors duration-300 shadow-lg disabled:opacity-40 disabled:pointer-events-none"
                >
                  {busy ? 'Saving…' : editingId ? 'Publish changes' : 'Publish live'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {collModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[210] overflow-y-auto overscroll-y-contain bg-dark/45 backdrop-blur-md px-4 py-10 md:py-14"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCollModalOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-modal-title"
            className="relative mx-auto w-full max-w-lg rounded-[1.75rem] border border-dark/8 bg-offwhite shadow-[0_32px_120px_-36px_rgba(18,18,18,0.45)] overflow-hidden mb-16"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-8 pt-7 pb-5 border-b border-dark/6 bg-white/90 flex justify-between items-start gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.38em] font-bold text-gold mb-2">
                  Collection
                </p>
                <h2 id="collection-modal-title" className="text-2xl font-serif text-dark tracking-tight">
                  Edit collection
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCollModalOpen(false)}
                className="shrink-0 w-10 h-10 rounded-full border border-dark/10 bg-white flex items-center justify-center text-dark/50 hover:bg-dark hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4 bg-white/60">
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Name
                </span>
                <input
                  className={inputCls}
                  value={collForm.name}
                  onChange={(e) => setCollForm((s) => ({ ...s, name: e.target.value }))}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Slug (URL)
                </span>
                <input
                  className={inputCls}
                  disabled
                  readOnly
                  value={collForm.slug}
                />
                <span className="text-[11px] text-dark/35 font-light">
                  Fixed after creation so existing links keep working.
                </span>
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Tile label
                </span>
                <input
                  className={inputCls}
                  placeholder="Optional storefront headline"
                  value={collForm.tile_label}
                  onChange={(e) => setCollForm((s) => ({ ...s, tile_label: e.target.value }))}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Description
                </span>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y`}
                  value={collForm.description}
                  onChange={(e) => setCollForm((s) => ({ ...s, description: e.target.value }))}
                />
              </label>
              <div className="rounded-xl border border-dark/10 bg-white px-4 py-3 space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45 block">
                  Browse products link
                </span>
                <p className="text-xs text-dark/50 font-light break-all">
                  {collForm.browse_products_url.trim()
                    ? formatBrowseProductsPreview(collForm.browse_products_url, 4)
                    : 'Default: shop filtered by collection name'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBrowsePickerSelectedPaths(
                        parseBrowseProductsField(collForm.browse_products_url)
                      );
                      setBrowsePickerTarget('editColl');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark/15 text-[10px] uppercase tracking-[0.18em] font-bold text-dark/70 hover:bg-offwhite transition-colors"
                  >
                    Pick from catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollForm((s) => ({ ...s, browse_products_url: '' }))}
                    className="text-[10px] uppercase tracking-[0.18em] font-bold text-dark/45 hover:text-dark"
                  >
                    Use default
                  </button>
                </div>
                <textarea
                  className={`${inputCls} min-h-[104px] resize-y font-light leading-relaxed`}
                  placeholder="/product/black-stone — one path per line for multiple products"
                  value={collForm.browse_products_url}
                  onChange={(e) =>
                    setCollForm((s) => ({ ...s, browse_products_url: e.target.value }))
                  }
                  spellCheck={false}
                />
                <span className="text-[10px] text-dark/35 font-light leading-snug block">
                  Plain text only — one path per line or commas between paths. Slug-only lines become{' '}
                  <span className="font-medium text-dark/45">/product/your-slug</span>. No JSON arrays.
                </span>
              </div>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Sort order
                </span>
                <input
                  type="number"
                  className={`${inputCls} tabular-nums`}
                  value={collForm.sort_order}
                  onChange={(e) => setCollForm((s) => ({ ...s, sort_order: e.target.value }))}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Cover image URL
                </span>
                <input
                  className={inputCls}
                  placeholder="https://…"
                  value={collForm.image_url}
                  onChange={(e) => setCollForm((s) => ({ ...s, image_url: e.target.value }))}
                  disabled={Boolean(collCoverFile)}
                />
              </label>
              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                  Replace with upload
                </span>
                <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-dark/15 bg-white py-3.5 px-4 text-[11px] font-bold text-dark/55 hover:border-dark/25 transition-colors">
                  <Upload className="w-4 h-4" strokeWidth={1.5} />
                  {collCoverFile ? collCoverFile.name : 'Choose image file'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setCollCoverFile(f || null);
                    e.target.value = '';
                  }}
                />
              </label>
              {(collFilePreview || collForm.image_url) && (
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-dark/10 bg-dark/[0.03]">
                  <img
                    src={collFilePreview || collForm.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="px-8 py-5 border-t border-dark/8 bg-white flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCollModalOpen(false)}
                className="px-6 py-3.5 rounded-full border border-dark/12 text-[11px] uppercase tracking-[0.22em] font-bold text-dark/55 hover:bg-offwhite transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !supabase}
                onClick={() => persistCollection()}
                className="px-8 py-3.5 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.22em] font-bold hover:bg-gold hover:text-dark transition-colors disabled:opacity-40"
              >
                {busy ? 'Saving…' : 'Save collection'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {browsePickerTarget && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[220] overflow-y-auto overscroll-y-contain bg-dark/50 backdrop-blur-sm px-4 py-10 md:py-14"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setBrowsePickerTarget(null);
          }}
        >
          <div
            className="relative mx-auto max-w-3xl rounded-[1.75rem] border border-dark/10 bg-offwhite shadow-[0_32px_120px_-36px_rgba(18,18,18,0.35)] overflow-hidden mb-12"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-dark/8 bg-white flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-gold mb-1">
                  Catalog browser
                </p>
                <h3 className="text-xl font-serif text-dark tracking-tight">Choose products</h3>
                <p className="text-xs text-dark/45 font-light mt-1 max-w-lg leading-relaxed">
                  Tick checkboxes or click a row to select multiple items. One link still opens that product;
                  several links open the shop with only those fragrances (
                  <code className="text-[11px] text-dark/55">/shop?products=…</code>
                  ).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBrowsePickerTarget(null)}
                className="shrink-0 w-10 h-10 rounded-full border border-dark/10 bg-white flex items-center justify-center text-dark/50 hover:bg-dark hover:text-white transition-colors"
                aria-label="Close catalog browser"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-dark/6 bg-white/90 flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-dark/45">
                Sort list
              </span>
              <select
                className="min-h-[40px] min-w-[200px] appearance-none rounded-full border border-dark/18 bg-white py-2 pl-4 pr-11 text-[12px] font-medium text-dark/65 outline-none hover:border-dark/28 focus:border-dark/35"
                value={browseSort}
                onChange={(e) => setBrowseSort(e.target.value)}
                aria-label="Sort products"
              >
                <option value="name_asc">Name A–Z</option>
                <option value="name_desc">Name Z–A</option>
                <option value="price_asc">Price · low to high</option>
                <option value="price_desc">Price · high to low</option>
              </select>
            </div>
            <div className="max-h-[min(52vh,520px)] overflow-y-auto overscroll-contain custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-[1] bg-[#f7f7f7] border-b border-dark/8 text-left text-[10px] uppercase tracking-[0.18em] text-dark/40 font-bold">
                  <tr>
                    <th className="pl-5 pr-2 py-3 w-11 align-middle">
                      <input
                        type="checkbox"
                        checked={
                          browseCatalogSorted.length > 0 &&
                          browseCatalogSorted.every((p) =>
                            browsePickerSelectedPaths.includes(`/product/${p.id}`)
                          )
                        }
                        onChange={toggleBrowsePickerVisiblePage}
                        className="rounded border-dark/25 w-4 h-4 accent-dark"
                        aria-label="Select all visible products"
                      />
                    </th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Slug</th>
                    <th className="px-5 py-3 text-right tabular-nums">Shelf price</th>
                  </tr>
                </thead>
                <tbody>
                  {browseCatalogSorted.map((p) => {
                    const path = `/product/${p.id}`;
                    const checked = browsePickerSelectedPaths.includes(path);
                    return (
                    <tr
                      key={p.uuid || p.id}
                      tabIndex={0}
                      onClick={() => toggleBrowsePickerPath(path)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleBrowsePickerPath(path);
                        }
                      }}
                      className="border-b border-dark/5 hover:bg-white cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-dark/25"
                    >
                      <td
                        className="pl-5 pr-2 py-3 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBrowsePickerPath(path)}
                          className="rounded border-dark/25 w-4 h-4 accent-dark"
                          aria-label={`Include ${p.name}`}
                        />
                      </td>
                      <td className="px-5 py-3 font-medium text-dark">{p.name}</td>
                      <td className="px-5 py-3 hidden sm:table-cell font-mono text-[11px] text-dark/45">
                        {p.id}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-dark/70">
                        Rs.{getEffectivePrices(p).price}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              {!browseCatalogSorted.length && (
                <p className="px-6 py-12 text-center text-sm text-dark/45 font-light">
                  No products loaded yet. Open the Products tab or seed the catalog first.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-dark/8 bg-white flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-dark/50 font-medium tabular-nums">
                {browsePickerSelectedPaths.length} selected
              </p>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setBrowsePickerSelectedPaths([])}
                  className="px-4 py-2.5 rounded-full border border-dark/12 text-[10px] uppercase tracking-[0.18em] font-bold text-dark/55 hover:bg-offwhite transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setBrowsePickerTarget(null)}
                  className="px-4 py-2.5 rounded-full border border-dark/12 text-[10px] uppercase tracking-[0.18em] font-bold text-dark/55 hover:bg-offwhite transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyBrowsePicker}
                  className="px-6 py-2.5 rounded-full bg-dark text-white text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-gold hover:text-dark transition-colors"
                >
                  Apply selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
