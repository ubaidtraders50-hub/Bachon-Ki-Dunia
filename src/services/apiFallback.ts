import { ClientStorage } from './clientStorage';
import type { Product, Order } from '../types';

interface MockResponse {
  status: number;
  data: any;
}

export function handleFallbackApi(
  urlStr: string,
  method: string,
  bodyData?: any
): MockResponse | null {
  try {
    const url = new URL(urlStr, window.location.origin);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // 1. PRODUCTS ROUTE
    if (pathname === '/api/products' && method === 'GET') {
      let list = ClientStorage.getProducts();

      const search = searchParams.get('search');
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q)
        );
      }

      const category = searchParams.get('category');
      if (category && category !== 'all') {
        list = list.filter((p) => p.category === category);
      }

      const season = searchParams.get('season');
      if (season && season !== 'all') {
        list = list.filter((p) => p.season === season || p.season === 'all');
      }

      const gender = searchParams.get('gender');
      if (gender && gender !== 'all') {
        list = list.filter((p) => p.gender === gender || p.gender === 'unisex');
      }

      const size = searchParams.get('size');
      if (size) {
        list = list.filter((p) => p.variations.some((v) => v.size === size));
      }

      const color = searchParams.get('color');
      if (color) {
        list = list.filter((p) =>
          p.variations.some((v) => v.colorName.toLowerCase() === color.toLowerCase())
        );
      }

      const inStock = searchParams.get('inStock') === 'true';
      if (inStock) {
        list = list.filter((p) => p.variations.some((v) => v.stock > 0));
      }

      const minPrice = searchParams.get('minPrice');
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) list = list.filter((p) => (p.salePrice || p.regularPrice) >= min);
      }

      const maxPrice = searchParams.get('maxPrice');
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) list = list.filter((p) => (p.salePrice || p.regularPrice) <= max);
      }

      const sort = searchParams.get('sort');
      if (sort === 'price_asc') {
        list.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
      } else if (sort === 'price_desc') {
        list.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
      } else if (sort === 'popular') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      const limit = searchParams.get('limit');
      const total = list.length;
      if (limit) {
        const l = parseInt(limit, 10);
        if (!isNaN(l)) list = list.slice(0, l);
      }

      return { status: 200, data: { products: list, total } };
    }

    // 1b. PRODUCT DETAILS BY SLUG
    if (pathname.startsWith('/api/products/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/products/', ''));
      const list = ClientStorage.getProducts();
      const product = list.find((p) => p.slug === slug || p.id === slug);
      if (!product) {
        return { status: 404, data: { error: 'Product not found' } };
      }
      const related = list
        .filter((p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
        .slice(0, 4);
      return { status: 200, data: { product, related } };
    }

    // 1c. CREATE PRODUCT (ADMIN)
    if (pathname === '/api/products' && method === 'POST') {
      const list = ClientStorage.getProducts();
      const newProduct: Product = {
        ...bodyData,
        id: `prod-${Date.now()}`,
        slug: bodyData.slug || bodyData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [newProduct, ...list];
      ClientStorage.saveProducts(updated);
      return { status: 201, data: newProduct };
    }

    // 1d. UPDATE PRODUCT (ADMIN)
    if (pathname.startsWith('/api/products/') && method === 'PUT') {
      const id = pathname.replace('/api/products/', '');
      const list = ClientStorage.getProducts();
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) {
        return { status: 404, data: { error: 'Product not found' } };
      }
      const updatedProduct = { ...list[idx], ...bodyData };
      list[idx] = updatedProduct;
      ClientStorage.saveProducts([...list]);
      return { status: 200, data: updatedProduct };
    }

    // 1e. DELETE PRODUCT (ADMIN)
    if (pathname.startsWith('/api/products/') && method === 'DELETE') {
      const id = pathname.replace('/api/products/', '');
      const list = ClientStorage.getProducts();
      const filtered = list.filter((p) => p.id !== id);
      ClientStorage.saveProducts(filtered);
      return { status: 200, data: { success: true } };
    }

    // 2. STORE SETTINGS
    if (pathname === '/api/settings' && method === 'GET') {
      return { status: 200, data: ClientStorage.getSettings() };
    }

    if (pathname === '/api/settings' && method === 'PUT') {
      const saved = ClientStorage.saveSettings(bodyData);
      return { status: 200, data: saved };
    }

    // 3. ADMIN AUTH
    if (pathname === '/api/admin/login' && method === 'POST') {
      const { emailOrUsername, password } = bodyData || {};
      const cleanUser = (emailOrUsername || '').trim().toLowerCase();
      // Validate credentials
      if (
        (cleanUser === 'admin' || cleanUser === 'admin@bachonkidunia.com') &&
        password === 'BachonAdmin2026!'
      ) {
        const token = `bkd_tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const admin = {
          id: 'admin-001',
          username: 'admin',
          email: 'admin@bachonkidunia.com',
          role: 'super_admin',
        };
        return { status: 200, data: { token, admin } };
      }
      return { status: 401, data: { error: 'Invalid credentials. Please enter username & password.' } };
    }

    if (pathname === '/api/admin/me' && method === 'GET') {
      return {
        status: 200,
        data: {
          admin: {
            id: 'admin-001',
            username: 'admin',
            email: 'admin@bachonkidunia.com',
            role: 'super_admin',
          },
        },
      };
    }

    // 4. ADMIN DASHBOARD STATS
    if (pathname === '/api/admin/dashboard-stats' && method === 'GET') {
      const orders = ClientStorage.getOrders();
      const products = ClientStorage.getProducts();

      const totalRevenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;
      const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
      const totalProducts = products.length;

      return {
        status: 200,
        data: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalProducts,
          recentOrders: orders.slice(0, 5),
        },
      };
    }

    // 5. ORDERS
    if ((pathname === '/api/admin/orders' || pathname === '/api/orders') && method === 'GET') {
      return { status: 200, data: { orders: ClientStorage.getOrders() } };
    }

    if (pathname.startsWith('/api/admin/orders/') && method === 'PUT') {
      const id = pathname.replace('/api/admin/orders/', '');
      const orders = ClientStorage.getOrders();
      const idx = orders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        orders[idx] = {
          ...orders[idx],
          ...bodyData,
          updatedAt: new Date().toISOString(),
        };
        ClientStorage.saveOrders([...orders]);
        return { status: 200, data: orders[idx] };
      }
      return { status: 404, data: { error: 'Order not found' } };
    }

    if (pathname === '/api/orders' && method === 'POST') {
      const orders = ClientStorage.getOrders();
      const newOrder: Order = {
        ...bodyData,
        id: `BKD-ORD-${Date.now().toString().slice(-6)}`,
        status: 'pending',
        paymentStatus: bodyData.paymentMethod === 'cod' ? 'pending' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      ClientStorage.saveOrders([newOrder, ...orders]);
      return { status: 201, data: newOrder };
    }

    if (pathname.startsWith('/api/orders/') && method === 'GET' && !pathname.includes('track')) {
      const id = pathname.replace('/api/orders/', '');
      const orders = ClientStorage.getOrders();
      const found = orders.find((o) => o.id === id);
      if (found) return { status: 200, data: found };
      return { status: 404, data: { error: 'Order not found' } };
    }

    if (pathname === '/api/orders/track' && method === 'GET') {
      const orderId = searchParams.get('orderId');
      const query = searchParams.get('query');
      const orders = ClientStorage.getOrders();

      const found = orders.find(
        (o) =>
          o.id.toLowerCase() === (orderId || '').toLowerCase() ||
          (query && (o.customer.phone.includes(query) || o.customer.email.toLowerCase().includes(query.toLowerCase())))
      );
      if (found) {
        return {
          status: 200,
          data: {
            order: {
              id: found.id,
              status: found.status,
              createdAt: found.createdAt,
              updatedAt: found.updatedAt,
              courierName: found.courierName,
              trackingNumber: found.trackingNumber,
              total: found.total,
              itemCount: found.items.reduce((acc, i) => acc + i.quantity, 0),
              city: found.customer.city,
              items: found.items.map((i) => ({
                productName: i.productName,
                colorName: i.colorName,
                size: i.size,
                quantity: i.quantity,
                imageUrl: i.imageUrl,
              })),
            },
          },
        };
      }
      return { status: 404, data: { error: 'Order not found' } };
    }

    // 6. COUPONS
    if (pathname === '/api/coupons/validate' && method === 'POST') {
      const { code, subtotal } = bodyData || {};
      const coupons = ClientStorage.getCoupons();
      const found = coupons.find((c) => c.code.toUpperCase() === (code || '').toUpperCase() && c.isActive);
      if (!found) {
        return { status: 400, data: { error: 'Invalid or expired coupon code.' } };
      }
      if (subtotal < found.minOrderValue) {
        return {
          status: 400,
          data: {
            error: `Minimum order amount for this voucher is Rs. ${found.minOrderValue.toLocaleString()}`,
          },
        };
      }
      const discount =
        found.discountType === 'percentage'
          ? Math.round((subtotal * found.discountValue) / 100)
          : found.discountValue;
      return {
        status: 200,
        data: {
          code: found.code,
          discount,
          message: `Coupon applied! You saved Rs. ${discount.toLocaleString()}`,
        },
      };
    }

    // 7. HEALTH
    if (pathname === '/api/health') {
      return {
        status: 200,
        data: { status: 'ok', store: 'Bachon Ki Dunia API', mode: 'resilient' },
      };
    }

    return null;
  } catch (err) {
    console.error('Fallback router error:', err);
    return null;
  }
}
