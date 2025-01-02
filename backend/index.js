const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 4000;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Product API",
      description: "API documentation for managing products",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: ["./index.js"], // Points to your current file with the APIs and Swagger comments
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require('dotenv').config();
app.use(cors());

// Database Connection With MongoDB
mongoose.connect("mongodb+srv://komali:KNaOiiP9oTG45D72@shopping.o29ko.mongodb.net/Ecommerce");

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  });
});

// Route for Images folder
app.use('/images', express.static('upload/images'));

// Middleware to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Default role is 'user'
  },
  cartData: { type: Object },
  orders: [
    {
      orderId: { type: String },
      items: [
        {
          productId: { type: Number },
          name: { type: String },
          quantity: { type: Number },
          price: { type: Number },
        }
      ],
      totalAmount: { type: Number },
      orderDate: { type: Date, default: Date.now },
    },
  ], 
  default: [], //Initialize orders array as empty
  date: { type: Date, default: Date.now() },
  status: {
    type: String,
    default: 'active',
  },
  
});

// Updated Schema for creating Product with quantity and available fields
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
  quantity: { type: Number, default: 100 }, // Add default if not specified
  demand: { type: Number, default: 0 }, // User demand
  readyForCheckout: { type: Number, default: 0 }, // Ready for checkout
});

// Root API Route For Testing
/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint for testing server
 *     description: Returns a simple root response to check if the server is running
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Root"
 */
// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});

// Login Endpoint
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Allows users to log in using their email and password.
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User credentials for login
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       200:
 *         description: Successful login, returns a token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error during login"
 */
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;

  try {
    // Find the user by email
    let user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ success: success, errors: "Invalid email or password" });
    }

    // Compare the plain-text password with the hashed password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: success, errors: "Invalid email or password" });
    }

    // Generate a token
    const data = { user: { id: user.id,role: user.role } };
    const token = jwt.sign(data, 'secret_ecom');

    success = true;
    res.json({ success, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Signup Endpoint
// Signup Endpoint
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Registers a new user with email and password
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User credentials for signup
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       200:
 *         description: Successful signup, returns a token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *       400:
 *         description: Existing user with the email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: string
 *                   example: "Existing user found with this email"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error during signup"
 */
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;

  try {
    // Check if the email already exists
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: success, errors: "Existing user found with this email" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user with the hashed password
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword, // Store the hashed password
      cartData: cart,
      orders: [],
    });
    await user.save();

    // Generate a token
    const data = { user: { id: user.id ,role: user.role } };
    const token = jwt.sign(data, 'secret_ecom');

    success = true;
    res.json({ success, token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// GET request to display the password reset form
app.get('/resetpassword', async (req, res) => {
  const { id, token } = req.query;

  try {
    // Find the user by ID
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create the secret using the user's password
    const secret = process.env.JWT + user.password;

    // Verify the token
    jwt.verify(token, secret);

    // Render the reset password form
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .form-container {
            background: #fff;
            padding: 20px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }
          h2 {
            margin-bottom: 15px;
            color: #333;
            text-align: center;
          }
          label {
            display: block;
            margin-bottom: 5px;
            color: #555;
          }
          input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h2>Reset Password</h2>
          <form action="/resetpassword" method="POST">
            <input type="hidden" name="id" value="${id}" />
            <input type="hidden" name="token" value="${token}" />
            <label for="newPassword">New Password:</label>
            <input type="password" id="newPassword" name="password" placeholder="Enter your new password" required />
            <button type="submit">Reset Password</button>
          </form>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.post('/resetpassword', async (req, res) => {
  const { id, token, password } = req.body;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #fff3cd;
              color: #856404;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .message-box {
              text-align: center;
              padding: 20px;
              background: #fff3cd;
              border: 1px solid #ffeeba;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="message-box">
            <h1>Error</h1>
            <p>User not found with ID: ${id}</p>
          </div>
        </body>
        </html>
      `);
    }

    const secret = process.env.JWT + user.password;
    jwt.verify(token, secret); // Verify the token

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #e3f2fd;
            color: #0d47a1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .message-box {
            text-align: center;
            padding: 20px;
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 5px;
          }
          .message-box h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .message-box p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="message-box">
          <h1>Password Reset Successful</h1>
          <p>Your password has been updated. You can now log in with your new password.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8d7da;
            color: #721c24;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .message-box {
            text-align: center;
            padding: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
          }
          .message-box h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .message-box p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="message-box">
          <h1>Error</h1>
          <p>Server error during password reset. Please try again later.</p>
        </div>
      </body>
      </html>
    `);
  }
});


// Request Password Reset
/**
 * @swagger
 * /requestPasswordReset:
 *   post:
 *     summary: Request password reset link
 *     description: Sends a password reset link to the user's email
 *     parameters:
 *       - in: body
 *         name: email
 *         description: User's email to send password reset link
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset link sent"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: string
 *                   example: "User doesn't exist"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error during password reset request"
 */
app.post('/requestPasswordReset', async (req, res) => {
  console.log("Password Reset Request");
  let success = false;

  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success, errors: "User doesn't exist" });
    }

    // Generate a secret using user's password
    const secret = process.env.JWT + user.password;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });

    // Create the password reset URL
    const resetURL = `http://localhost:4000/resetpassword?id=${user._id}&token=${token}`;

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Note: Avoid hardcoding sensitive data
        // 
      },
    });

    // Define email options
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetURL}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    success = true;
    res.status(200).json({ success, message: 'Password reset link sent' });
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ success, errors: 'Server error during password reset request' });
  }
});


// Verify OTP and Reset Password
// Get All Products Endpoint
/**
 * @swagger
 * /allproducts:
 *   get:
 *     summary: Get all products
 *     description: Fetches all products available in the store
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   new_price:
 *                     type: number
 *                   old_price:
 *                     type: number
 *                   available:
 *                     type: boolean
 *                   quantity:
 *                     type: number
 */
// Get All Products Endpoint
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  res.send(products);
});
// Add Products Endpoint
/**
 * @swagger
 * /addproduct:
 *   post:
 *     summary: Add new products
 *     description: Adds new products to the inventory
 *     parameters:
 *       - in: body
 *         name: product
 *         description: List of products to add to the inventory
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             products:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   image:
 *                     type: string
 *                   category:
 *                     type: string
 *                   new_price:
 *                     type: number
 *                   old_price:
 *                     type: number
 *                   quantity:
 *                     type: number
 *                   available:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Products added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       quantity:
 *                         type: number
 */
// Add Product Endpoint (with quantity and availability)
app.post("/addproducts", async (req, res) => {
  try {
    const products = req.body.products;  // Expecting an array of products in the request body
    const existingProducts = await Product.find({});

    const addedProducts = await Promise.all(
      products.map(async (productData) => {
        let id = existingProducts.length > 0 ? existingProducts[existingProducts.length - 1].id + 1 : 1;

        const product = new Product({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          image: productData.image,
          category: productData.category,
          new_price: productData.new_price,
          old_price: productData.old_price,
          quantity: productData.quantity || 100,
          available: productData.quantity > 0,
          demand: productData.demand,
          readyForCheckout: productData.readyForCheckout,
        });

        await product.save();
        return { name: product.name, quantity: product.quantity };
      })
    );

    res.json({ success: true, products: addedProducts });
  } catch (error) {
    res.status(500).json({ error: "Server error while adding products",error: error.message });
  }
});


/**
 * @swagger
 * /addproduct:
 *   post:
 *     summary: Add a single product
 *     description: Adds a single product to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the product.
 *               description:
 *                 type: string
 *                 description: A short description of the product.
 *               image:
 *                 type: string
 *                 description: The URL of the product image.
 *               category:
 *                 type: string
 *                 description: The category of the product (e.g., women, men, kid).
 *               new_price:
 *                 type: number
 *                 description: The new price of the product.
 *               old_price:
 *                 type: number
 *                 description: The original price of the product.
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product available.
 *               demand:
 *                 type: number
 *                 description: The demand level for the product (optional).
 *               readyForCheckout:
 *                 type: number
 *                 description: Flag indicating if the product is ready for checkout (optional).
 *     responses:
 *       200:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates the operation success.
 *                 product:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the added product.
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the added product.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */

app.post("/addproduct", async (req, res) => {
  try {
    const productData = req.body;  // Expecting a single product in the request body
    const existingProducts = await Product.find({});

    // Generate ID for the new product
    let id = existingProducts.length > 0 ? existingProducts[existingProducts.length - 1].id + 1 : 1;

    // Create a new product instance
    const product = new Product({
      id: id,  // Use the generated ID
      name: productData.name,
      description: productData.description,
      image: productData.image,
      category: productData.category,
      new_price: productData.new_price,
      old_price: productData.old_price,
      quantity: productData.quantity || 100,
      available: productData.quantity > 0,
      demand: productData.demand,
      readyForCheckout: productData.readyForCheckout,
    });

    // Save the new product to the database
    await product.save();

    res.json({ success: true, product: { name: product.name, quantity: product.quantity } });
  } catch (error) {
    res.status(500).json({ error: "Server error while adding product", message: error.message });
  }
});



/**
 * @swagger
 * /updateproduct:
 *   post:
 *     summary: Update an existing product
 *     description: Updates all fields of an existing product in the inventory.
 *     parameters:
 *       - in: body
 *         name: product
 *         description: ID of the product and the fields to update.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: The unique identifier of the product.
 *               example: 1
 *             updates:
 *               type: object
 *               description: The updated fields for the product.
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Updated Product Name"
 *                 description:
 *                   type: string
 *                   example: "Updated product description"
 *                 image:
 *                   type: string
 *                   example: "updated-product-image-url"
 *                 category:
 *                   type: string
 *                   example: "Updated Category"
 *                 new_price:
 *                   type: number
 *                   example: 89.99
 *                 old_price:
 *                   type: number
 *                   example: 99.99
 *                 quantity:
 *                   type: number
 *                   example: 75
 *                 available:
 *                   type: boolean
 *                   example: true
 *                 demand:
 *                   type: number
 *                   example: 25
 *                 readyForCheckout:
 *                   type: boolean
 *                   example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Updated Product Name"
 *                     description:
 *                       type: string
 *                       example: "Updated product description"
 *                     image:
 *                       type: string
 *                       example: "updated-product-image-url"
 *                     category:
 *                       type: string
 *                       example: "Updated Category"
 *                     new_price:
 *                       type: number
 *                       example: 89.99
 *                     old_price:
 *                       type: number
 *                       example: 99.99
 *                     quantity:
 *                       type: number
 *                       example: 75
 *                     available:
 *                       type: boolean
 *                       example: true
 *                     demand:
 *                       type: number
 *                       example: 25
 *                     readyForCheckout:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Missing required fields in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ID and updates are required"
 *       404:
 *         description: Product with the given ID not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Server error while updating the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while updating product"
 */

app.post("/updateproduct", async (req, res) => {
  try {
    const productData = req.body;

    // Validate input
    if (!productData || !productData.id) {
      return res.status(400).json({ success: false, message: "id is required in the request body" });
    }

    // Find and update the product by id
    const updatedProduct = await Product.findOneAndUpdate(
      { id: productData.id }, // Find product by custom id field
      productData, // Replace the entire document with the new data
      { new: true, runValidators: true } // Return updated document and validate
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error while updating product" });
  }
});


/**
 * @swagger
 * /deleteproducts:
 *   post:
 *     summary: Delete multiple products by their IDs
 *     description: Deletes multiple products based on an array of product IDs provided in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4]  # Example IDs for the "Try it out" UI
 *     responses:
 *       200:
 *         description: Successfully deleted the products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Products deleted successfully."
 *       404:
 *         description: One or more products not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Products not found"
 *       500:
 *         description: Server error while deleting products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while deleting products"
 */
app.post("/deleteproducts", async (req, res) => {
  const { ids } = req.body;

  try {
    // Check if IDs array is provided and has at least one element
    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No product IDs provided" });
    }

    // Delete products by their IDs
    const result = await Product.deleteMany({ id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Products not found" });
    }

    res.json({ success: true, message: "Products deleted successfully." });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ error: "Server error while deleting products" });
  }
});

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a product by its ID
 *     description: Retrieves a product's details based on the provided product ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to fetch.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Product Name"
 *                 description:
 *                   type: string
 *                   example: "Product description goes here."
 *                 image:
 *                   type: string
 *                   example: "/images/product1.jpg"
 *                 category:
 *                   type: string
 *                   example: "electronics"
 *                 new_price:
 *                   type: number
 *                   example: 199.99
 *                 old_price:
 *                   type: number
 *                   example: 249.99
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2025-01-01"
 *                 available:
 *                   type: boolean
 *                   example: true
 *                 quantity:
 *                   type: integer
 *                   example: 50
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Server error while fetching the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while fetching product"
 */
// Endpoint to fetch a single product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Server error while fetching product" });
  }
});

// Purchase Endpoint
/**
 * @swagger
 * /purchase:
 *   post:
 *     summary: Process purchase and update stock
 *     description: Handles stock updates after a purchase is made
 *     parameters:
 *       - in: body
 *         name: purchase
 *         description: Items purchased with quantities
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: number
 *                   quantitySold:
 *                     type: number
 *     responses:
 *       200:
 *         description: Purchase processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order placed successfully!"
 *       400:
 *         description: Insufficient stock or product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient stock for product"
 */
// Purchase Endpoint to Handle Stock for Multiple Items
app.post("/purchase", async (req, res) => {
  const { items } = req.body; // Expecting an array of items from the frontend

  try {
    // Loop through each item in the order to check stock and update inventory
    for (const { productId, quantitySold } of items) {
      // Fetch the product from the database
      const product = await Product.findOne({ id: productId });

      // Check if the product exists and if there’s enough stock
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${productId} not found` });
      }

      if (product.quantity < quantitySold) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Only ${product.quantity} units available.` });
      }

      // Deduct the sold quantity from stock
      product.quantity -= quantitySold;

      // Update availability based on the new stock quantity
      product.available = product.quantity > 0;

      product.demand += quantitySold;

      // Save the updated product quantity to the database
      await product.save();
    }

    // All items processed successfully
    res.json({ success: true, message: "Order placed successfully!" });
  } catch (error) {
    console.error("Error during order processing:", error);
    res.status(500).json({ error: "Server error while processing order" });
  }
});


// Remove Product Endpoint
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});

// Subscription Endpoint
app.post("/subscribe", (req, res) => {
  const { email } = req.body;
  res.json({ success: true });
});

// Endpoint for getting related products based on category
app.post("/relatedproducts", async (req, res) => {
  const { category, excludeId } = req.body;

  try {
    // Fetch products in the same category excluding the product with excludeId
    const products = await Product.find({ category, id: { $ne: excludeId } }).limit(4);
    res.json(products);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: "Server error while fetching related products" });
  }
});

// Endpoint for fetching new collections
app.get("/newcollections", async (req, res) => {
  try {
    // Fetch the most recent products by sorting by `date` in descending order
    const products = await Product.find().sort({ date: -1 }).limit(8); // Adjust limit as needed
    res.json(products);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ error: "Server error while fetching new collections" });
  }
});

// Endpoint for getting popular products in the women category
app.get("/popularinwomen", async (req, res) => {
  try {
    // Fetch products where category is "women"
    const products = await Product.find({ category: "women" }).limit(4); // Adjust limit as needed
    res.json(products); // Return the products in JSON format
  } catch (error) {
    console.error("Error fetching popular products in women category:", error);
    res.status(500).json({ error: "Server error while fetching popular products" });
  }
});

// Search Endpoint
app.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;

    // Base query for search
    const query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    // If category is specified, add exact category filtering
    if (category) {
      query.category = category; // Exact match for category
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Server error while searching" });
  }
});

const { v4: uuidv4 } = require("uuid"); // To generate unique order IDs

app.post("/placeorder", async (req, res) => {
  console.log("Placing Order:", req.body); // Log incoming request
  const { userId, items, totalAmount } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User Found:", user); // Log fetched user

    const orderId = uuidv4();
    const order = {
      orderId,
      items,
      totalAmount,
      orderDate: new Date(), // Ensure orderDate is added
    };

    console.log("Order to be added:", order); // Log order details

    // Add order to user's orders array
    user.orders.push(order);

    // Clear cartData after placing the order
    user.cartData = {};
    await user.save();

    console.log("Order successfully added:", user.orders); // Log updated orders

    res.json({ success: true, message: "Order placed successfully!", orderId });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Server error while placing order" });
  }
});

//End point for order history
app.get("/orderhistory/:userId", async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, orders: user.orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Server error while fetching order history" });
  }
});

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get inventory details for clothing
 *     description: Returns inventory information including stock, demand, and items ready for checkout.
 *     responses:
 *       200:
 *         description: Successfully retrieved inventory details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStock:
 *                   type: number
 *                   example: 100
 *                 totalDemand:
 *                   type: number
 *                   example: 40
 *                 readyForCheckout:
 *                   type: number
 *                   example: 20
 *       500:
 *         description: Server error
 */
app.get("/inventory", async (req, res) => {
  try {
    const totalStock = await Product.aggregate([
      { $match: { category: "clothing" } },
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ]);

    const totalDemand = await Product.aggregate([
      { $match: { category: "clothing" } },
      { $group: { _id: null, totalDemand: { $sum: "$demand" } } },
    ]);

    const readyForCheckout = await Product.aggregate([
      { $match: { category: "clothing" } },
      { $group: { _id: null, readyForCheckout: { $sum: "$readyForCheckout" } } },
    ]);

    res.json({
      totalStock: totalStock[0]?.totalStock || 0,
      totalDemand: totalDemand[0]?.totalDemand || 0,
      readyForCheckout: readyForCheckout[0]?.readyForCheckout || 0,
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    res.status(500).json({ error: "Server error while fetching inventory details" });
  }
});

/**
 * @swagger
 * /updateinventory/{id}:
 *   patch:
 *     summary: Update inventory details for a product
 *     description: Updates stock, demand, or ready-for-checkout count for a specific product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: number
 *                 example: 50
 *               demand:
 *                 type: number
 *                 example: 30
 *               readyForCheckout:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Successfully updated product inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product inventory updated successfully."
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
app.patch("/updateinventory/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity, demand, readyForCheckout } = req.body;

  try {
    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (quantity !== undefined) product.quantity = quantity;
    if (demand !== undefined) product.demand = demand;
    if (readyForCheckout !== undefined) product.readyForCheckout = readyForCheckout;

    await product.save();
    res.json({ success: true, message: "Product inventory updated successfully." });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ error: "Server error while updating inventory" });
  }
});

// POST route to check inventory
/**
 * @swagger
 * /check-inventory:
 *   post:
 *     summary: Check inventory for requested products
 *     description: Receives an array of product IDs and returns their current inventory status, demand, and ready for checkout status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1
 *     responses:
 *       200:
 *         description: Inventory checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inventory checked successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Men's Formal Shirt"
 *                       quantity:
 *                         type: integer
 *                         example: 40
 *                       demand:
 *                         type: integer
 *                         example: 10
 *                       readyForCheckout:
 *                         type: integer
 *                         example: 15
 *       400:
 *         description: Invalid product data provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid product data provided.
 */
// Using async/await (recommended approach)
app.post("/check-inventory", async (req, res) => {
  const requestedProducts = req.body.products;
  
  // Check if the input products are in the correct format (just IDs)
  if (!requestedProducts || !Array.isArray(requestedProducts)) {
    return res.status(400).json({ error: "Invalid product data provided." });
  }

  // Extract only the product IDs from the request
  const productIds = requestedProducts.map(product => product.id); 

  try {
    const response = await Product.find({ id: { $in: productIds } });

    const productDetails = response.map((product) => ({
      productId: product.id,
      name: product.name,
      quantity: product.quantity,
      demand: product.demand,
      readyForCheckout: product.readyForCheckout,
    }));

    res.status(200).json({
      success: true,
      message: "Inventory checked successfully.",
      data: productDetails,
    });

  } catch (error) {
    console.error("Error during inventory check:", error); 
    res.status(500).json({ error: "Failed to check inventory.", details: error.message });
  }
});