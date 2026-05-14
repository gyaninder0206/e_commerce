import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialCustomer = {
  name: "",
  email: "",
  address: ""
};

function App() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(initialCustomer);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/products`);

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();
        setProducts(data);

        if (data.length > 0) {
          setSelectedProductId(data[0]._id);
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await fetch(`${apiUrl}/orders`);

        if (!response.ok) {
          throw new Error("Unable to load orders.");
        }

        const data = await response.json();
        setOrders(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchProducts();
    fetchOrders();
  }, []);

  const selectedProduct = products.find((product) => product._id === selectedProductId) || null;

  const cartTotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry._id === item.productId);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  const addToCart = (productId) => {
    setError("");
    setSuccess("");

    const product = products.find((entry) => entry._id === productId);

    if (!product || product.stock < 1) {
      setError("This item is out of stock.");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === productId);

      if (existing) {
        if (existing.quantity >= product.stock) {
          setError("You have reached the available stock for this item.");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentCart, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, nextQuantity) => {
    const quantity = Math.max(1, Number(nextQuantity) || 1);
    const product = products.find((entry) => entry._id === productId);

    if (!product) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, product.stock) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError("Add at least one product before checkout.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer,
          items: cart
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed.");
      }

      setSuccess(`Order placed successfully. Order id: ${data.order._id}`);
      setCustomer(initialCustomer);
      setCart([]);

      const refreshedProducts = await fetch(`${apiUrl}/products`);

      if (!refreshedProducts.ok) {
        throw new Error("Order was saved, but products could not be refreshed.");
      }

      const refreshedData = await refreshedProducts.json();
      setProducts(refreshedData);
      setSelectedProductId((currentId) =>
        refreshedData.some((product) => product._id === currentId) ? currentId : refreshedData[0]?._id || ""
      );
      setOrders((currentOrders) => [data.order, ...currentOrders]);
      setView("orders");
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Sample MERN Commerce</p>
          <h1>Browse products and simulate a purchase flow.</h1>
        </div>
        <div className="view-switcher">
          <button
            type="button"
            className={view === "shop" ? "switch-button active" : "switch-button"}
            onClick={() => setView("shop")}
          >
            Shop
          </button>
          <button
            type="button"
            className={view === "orders" ? "switch-button active" : "switch-button"}
            onClick={() => setView("orders")}
          >
            Orders
          </button>
        </div>
      </header>

      {error ? <div className="message error">{error}</div> : null}
      {success ? <div className="message success">{success}</div> : null}

      {view === "shop" ? (
        <main className="layout">
          <section className="panel">
            <div className="panel-header">
              <h2>Products</h2>
              <span>{loading ? "Loading..." : `${products.length} available`}</span>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  className={`product-card ${selectedProductId === product._id ? "active" : ""}`}
                  onClick={() => setSelectedProductId(product._id)}
                >
                  <img src={product.image} alt={product.name} />
                  <div className="product-content">
                    <div className="product-heading">
                      <h3>{product.name}</h3>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                    <p>{product.category}</p>
                    <small>{product.stock} in stock</small>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Details</h2>
            </div>

            {selectedProduct ? (
              <div className="details-card">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="details-image" />
                <div className="details-copy">
                  <p className="eyebrow">{selectedProduct.category}</p>
                  <h3>{selectedProduct.name}</h3>
                  <p>{selectedProduct.description}</p>
                  <strong>${selectedProduct.price.toFixed(2)}</strong>
                  <span>{selectedProduct.stock} units left</span>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => addToCart(selectedProduct._id)}
                    disabled={selectedProduct.stock < 1}
                  >
                    {selectedProduct.stock < 1 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            ) : (
              <p>Select a product to view details.</p>
            )}
          </section>

          <section className="panel cart-panel">
            <div className="panel-header">
              <h2>Cart & Checkout</h2>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <div className="cart-list">
              {cart.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                cart.map((item) => {
                  const product = products.find((entry) => entry._id === item.productId);

                  if (!product) {
                    return null;
                  }

                  return (
                    <div className="cart-item" key={item.productId}>
                      <div>
                        <strong>{product.name}</strong>
                        <p>${product.price.toFixed(2)} each</p>
                      </div>
                      <div className="cart-actions">
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.productId, event.target.value)}
                        />
                        <button type="button" onClick={() => removeFromCart(item.productId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form className="checkout-form" onSubmit={handleCheckout}>
              <input
                type="text"
                placeholder="Full name"
                value={customer.name}
                onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                required
              />
              <textarea
                placeholder="Shipping address"
                rows="4"
                value={customer.address}
                onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
                required
              />
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Submitting..." : "Purchase"}
              </button>
            </form>
          </section>
        </main>
      ) : (
        <main className="orders-layout">
          <section className="panel orders-panel">
            <div className="panel-header">
              <h2>Orders</h2>
              <span>{ordersLoading ? "Loading..." : `${orders.length} total`}</span>
            </div>

            {orders.length === 0 && !ordersLoading ? (
              <p>No orders yet.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="order-card" key={order._id}>
                    <div className="order-top">
                      <div>
                        <h3>{order.customer.name}</h3>
                        <p>{order.customer.email}</p>
                      </div>
                      <div className="order-summary">
                        <strong>${order.totalAmount.toFixed(2)}</strong>
                        <span>{order.status}</span>
                      </div>
                    </div>
                    <p className="order-address">{order.customer.address}</p>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div className="order-item" key={`${order._id}-${item.product}`}>
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>${item.lineTotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
