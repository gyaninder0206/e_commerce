# Sample MERN E-Commerce App

This is a simple MERN sample with:

- `client/` for the React frontend
- `server/` for the Express + MongoDB API
- MongoDB Atlas support through environment variables

## Features

- Browse products
- View product details
- Add items to a local cart
- Simulate checkout
- Save orders to MongoDB Atlas
- Decrement product stock after purchase

## Project Structure

```text
e_commerce/
  client/
  server/
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow your IP address in Network Access.
4. Copy your connection string.
5. In `server/.env`, set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/mern_shop?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

## Install

Open two terminals.

### Server

```bash
cd server
npm install
Copy-Item .env.example .env
```

Update `.env` with your Atlas connection string, then seed sample products:

```bash
npm run seed
npm run dev
```

### Client

```bash
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

## API

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/orders`

## Purchase Payload

```json
{
  "customer": {
    "name": "Alex Doe",
    "email": "alex@example.com",
    "address": "221B Baker Street"
  },
  "items": [
    {
      "productId": "PRODUCT_ID",
      "quantity": 1
    }
  ]
}
```

## Notes

- Cart state is stored in the browser only for this sample.
- Checkout is simulated; no real payment gateway is used.
