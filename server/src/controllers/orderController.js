import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const getOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res) => {
  const reservedItems = [];

  try {
    const { customer, items } = req.body;

    if (!customer?.name || !customer?.email || !customer?.address) {
      return res.status(400).json({ message: "Customer name, email, and address are required." });
    }

    if (!isValidEmail(customer.email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must include at least one item." });
    }

    const orderItems = [];
    let totalAmount = 0;
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error("Each item must include a valid productId and quantity.");
      }

      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        },
        {
          new: true
        }
      );

      if (!product) {
        const existingProduct = await Product.findById(item.productId);

        if (!existingProduct) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        throw new Error(`Insufficient stock for ${existingProduct.name}.`);
      }

      const lineTotal = Number((product.price * item.quantity).toFixed(2));
      totalAmount += lineTotal;
      reservedItems.push({ productId: product._id, quantity: item.quantity });

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal
      });
    }

    const order = await Order.create({
      customer,
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2))
    });

    res.status(201).json({
      message: "Order created successfully.",
      order
    });
  } catch (error) {
    if (reservedItems.length > 0) {
      for (const item of reservedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        }).catch(() => null);
      }
    }

    res.status(400).json({
      message: error.message || "Unable to create order."
    });
  }
};
