const express = require('express');
const app = express();
const userRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const categoryRouter = require('./routes/category');
const cartRouter = require('./routes/cartItems');
const likeRouter = require('./routes/likes');
const orderRouter = require('./routes/orders');
const dotenv = require('dotenv');

dotenv.config();
app.listen(process.env.PORT);
app.use("/users",userRouter);
app.use("/books",bookRouter);
app.use("/category",categoryRouter);
app.use("/cartItems",cartRouter);
app.use("/likes",likeRouter);
app.use("/orders",orderRouter);