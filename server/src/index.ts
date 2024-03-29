import express, { Request, Response } from "express";
import path from "path";
import responser from "responser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { jwtLogin } from "./services/passport";
import database from "./database";
import proxyRouter from "./proxy";
import usersRouter from "./routes/users";
import ringsRouter from "./routes/rings";
import panelsRouter from "./routes/panels";
import notebooksRouter from "./routes/notebooks";

const app = express();

// App dependencies
(async () => {
  try {
    await database();
    console.log("Database connected successfully!");
    app.emit("ready");
  } catch (error) {
    console.log("Error connecting to database: ", error);
  }
})();

// Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(responser);
app.use(cors());
app.use(helmet());
app.use(hpp());

// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_TIME_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
});

// Apply limiter to all requests
app.use(limiter);

// Passport
app.use(passport.initialize());
passport.use(jwtLogin);

// Proxy Router
app.use("/proxy", proxyRouter);

// Users Router
app.use("/api/users", usersRouter);

// Rings Router
app.use("/api/rings", ringsRouter);

// Notebooks Router
app.use("/api/notebooks", notebooksRouter);

// Panels Router
app.use("/api/panels", panelsRouter);

// Serve React App
app.use(express.static(path.join(__dirname, "../build")));

// Catch all other routes to React App
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.on("ready", () => {
  // Create the Server
  app.listen(process.env.UX_SERVER_PORT, () => {
    console.log(`Server is running on ${process.env.UX_SERVER_PORT} port!`);
  });
});

export default app;
