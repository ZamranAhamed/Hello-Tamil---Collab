const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Import Routes */

const writingRoutes = require("./src/writing/writing.routes");

/* Register Routes */

app.use("/writing", writingRoutes);


/* Test Route */

app.get("/", (req, res) => {
  res.send("Hello Tamil Backend Running");
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend connected" });
});


/* Start Server */

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`Or from other devices at: http://10.225.125.116:${PORT}`);
});



