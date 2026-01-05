const API_URL = "https://localhost:7155/api/products";

export let products = [];




export async function loadProductsFromAPI(categoryId) {
  try {
    let url;
    if (!categoryId) {
      // load all products
      url = `${API_URL}`;
    } else {
      url = `${API_URL}/category/${categoryId}`;
    }

    console.log("CALL API:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const data = json.data ?? [];

    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: p.imageUrl || p.images?.find(i => i.isMain)?.imageUrl ,
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""
    }));

  } catch (e) {
    console.error("API ERROR:", e);
    products = [];
  }
}

/**
 * LOAD THEO BRAND (HOMEPAGE)
 */
export async function loadProductsByBrand(brandId) {
  if (!brandId) {
    products = [];
    return;
  }

  try {
    const url = `${API_URL}/brand/${brandId}`;
    console.log("CALL API:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const data = json.data ?? [];

    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: p.imageUrl || p.images?.find(i => i.isMain)?.imageUrl || p.thumbnailUrl || DEFAULT_IMAGE,
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""
    }));

  } catch (e) {
    console.error("API ERROR:", e);
    products = [];
  }
}

/**
 * LOAD THEO CATEGORY VÀ BRAND (TRANG CATEGORY)
 */
export async function loadProductsByCategoryAndBrand(categoryId, brandId) {
  try {
    let url;
    if (!categoryId && !brandId) {
      // load all products
      url = `${API_URL}`;
    } else if (categoryId && !brandId) {
      url = `${API_URL}/category/${categoryId}`;
    } else if (!categoryId && brandId) {
      url = `${API_URL}/brand/${brandId}`;
    } else {
      // Both category and brand - need to filter client-side
      url = `${API_URL}`;
    }

    console.log("CALL API:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    let data = json.data ?? [];

    // Filter by brand if both category and brand are provided
    if (categoryId && brandId) {
      data = data.filter(p => p.categoryId == categoryId && p.brandId == brandId);
    }

    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: p.imageUrl || p.images?.find(i => i.isMain)?.imageUrl || p.thumbnailUrl || DEFAULT_IMAGE,
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""
    }));

  } catch (e) {
    console.error("API ERROR:", e);
    products = [];
  }
}

/**
 * DÙNG CHO QUICK VIEW / CART
 */
export function getProductById(id) {
  return products.find(p => p.id == id);
}

/**
 * SEARCH PRODUCTS (Header Search)
 * Calls GET /api/products/search with correct params:
 * ?keyword=xxx&brandId=BRD0001&status=active&page=1&pageSize=10
 */
export async function searchProducts(request) {
  try {
    // Build query string with CORRECT parameter names
    const params = new URLSearchParams();
    
    if (request.keyword) {
      params.append("keyword", request.keyword);
    }
    
    if (request.categoryId) {
      params.append("categoryId", request.categoryId);
    }
    
    if (request.brandId) {
      params.append("brandId", request.brandId);
    }
    
    if (request.status) {
      params.append("status", request.status);
    }

    // Add pagination defaults
    params.append("page", request.page || "1");
    params.append("pageSize", request.pageSize || "20");

    const url = `${API_URL}/search?${params.toString()}`;
    console.log("SEARCH API:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const data = json.data ?? [];

    // Transform to app product format
    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: p.imageUrl || p.images?.find(i => i.isMain)?.imageUrl || p.thumbnailUrl || DEFAULT_IMAGE,
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""
    }));

    console.log("Search results:", products.length, "products");
    return products;

  } catch (e) {
    console.error("SEARCH API ERROR:", e);
    products = [];
    return [];
  }
}

/**
 * GET PRODUCT WITH VARIATIONS (for Quick View)
 * Calls GET /api/products/{id}
 */
export async function getProductWithVariations(productId) {
  try {
    const url = `${API_URL}/${productId}`;
    console.log("GET PRODUCT WITH VARIATIONS:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const data = json.data || json;

    // Transform to full product format with variations
    const product = {
      id: data.productId,
      title: data.productName,
      price: Number(data.productPrice),
      old: Math.round(Number(data.productPrice) * 1.2),
      img: data.images?.[0]?.imageUrl || data.imageUrl || DEFAULT_IMAGE,
      images: data.images || [],
      stock: data.totalStock || 0,
      category: data.categoryName ?? "",
      brand: data.brandName ?? "",
      description: data.productDescription ?? "",
      specifications: data.specifications || data.productSpecifications || [],
      variations: (data.variations || []).map(v => ({
        variationId: v.variationId,
        price: Number(v.price),
        stockQuantity: v.stockQuantity,
        options: (v.options || []).map(opt => ({
          optionId: opt.optionId || opt.optionTypeId,
          // optionTypeName = tên loại (Màu sắc, Dung lượng)
          optionTypeName: opt.optionTypeName,
          // optionName = giá trị (Titan Xanh, 256GB)
          optionName: opt.optionName || opt.value,
          // value = giá trị
          value: opt.optionName || opt.value,
          optionType: opt.optionType || opt.type
        }))
      }))
    };

    return product;

  } catch (e) {
    console.error("GET PRODUCT ERROR:", e);
    return null;
  }
}