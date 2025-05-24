const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
require("./db");


app.use("/users", require("./routes/user.routes"));
app.use("/pools", require("./routes/pool.routes"));
app.use("/transactions", require("./routes/transaction.routes"));
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
