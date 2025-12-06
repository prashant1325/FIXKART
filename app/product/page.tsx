"use client";

import { useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stock?: number;
  vendor?: any;
};

function AddProductForm({
  categoryId,
  onCreated,
  close,
}: {
  categoryId?: string | null;
  onCreated: (p: Product) => void;
  close: () => void;
}) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    stock: "",
    minOrderQuantity: "",
    unit: "",
    specifications: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // const BASE_URL = process.env.BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const body = {
        name: form.name,
        description: form.description,
        brand: form.brand,
        price: Number(form.price),
        stock: Number(form.stock),
        minOrderQuantity: Number(form.minOrderQuantity),
        unit: form.unit,
        specifications: form.specifications,
        category: categoryId ?? undefined,
      };
      const res = await fetch(`http://localhost:5000/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create product");
      }

      const created = await res.json();
      onCreated(created);
      close();
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 12 }}>
      <h3>Add Product</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Brand</label>
          <input name="brand" value={form.brand} onChange={handleChange} />
        </div>
        <div>
          <label>Price</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
          />
        </div>
        <div>
          <label>Stock</label>
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            type="number"
          />
        </div>
        <div>
          <label>Min Order Qty</label>
          <input
            name="minOrderQuantity"
            value={form.minOrderQuantity}
            onChange={handleChange}
            type="number"
          />
        </div>
        <div>
          <label>Unit</label>
          <input name="unit" value={form.unit} onChange={handleChange} />
        </div>
        <div>
          <label>Specifications</label>
          <input
            name="specifications"
            value={form.specifications}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={close} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
    </div>
  );
}

export default function ProductPage() {
  const { user, isSignedIn } = useUser();
  const { getToken, userId, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const role = user?.publicMetadata?.role as string | undefined;

  const isVendor = isSignedIn && role === "vendor";

  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryId) params.set("category", categoryId);
      // If vendor, request vendor-scoped products
      if (isVendor) params.set("scope", "vendor");

      const url = `http://localhost:5000/api/products`;

      const headers: any = {};
      if (isVendor) {
        const token = await getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // wait for clerk to load before fetching vendor-scoped results
    if (isVendor && !isLoaded) return;
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, isVendor, isLoaded]);

  return (
    <div style={{ padding: 20 }}>
      {isVendor ? (
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Close" : "Add Product"}
          </button>

          {showForm && (
            <AddProductForm
              categoryId={categoryId}
              onCreated={(p) => setProducts((s) => [p, ...s])}
              close={() => setShowForm(false)}
            />
          )}

          <h3 style={{ marginTop: 18 }}>Products</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {products.map((p) => (
                <li key={p._id}>
                  <strong>{p.name}</strong> — {p.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {products.map((p) => (
                <li key={p._id}>
                  <strong>{p.name}</strong> — {p.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
