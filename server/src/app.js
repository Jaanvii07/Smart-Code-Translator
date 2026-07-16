import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-code-translator-rho.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;