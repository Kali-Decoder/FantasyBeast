const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { getOrCreateUser } = require("./services/userServices");
dotenv.config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

require("./db");

app.use(express.json());
app.use(cors(
  {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
));
app.use(express.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  const userAddress = req.headers['x-user-address'];
  
  if (!userAddress) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  await getOrCreateUser(userAddress);
  req.body.userAddress = userAddress;
  next();
});



app.use("/api/users", require("./routes/user.routes"));
app.use("/api/pools", require("./routes/pool.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
