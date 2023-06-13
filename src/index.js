// Imports

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { connectToDatabase } from "./utilities/db.js";
import { config } from "dotenv";

// App

const app = express();

config();

// Routes

import user from "./routes/user.route.js";
import files from "./routes/file.route.js";

// Initialize Middleware

app.use(helmet());
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(
  helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'"] } })
);
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

// Routes

app.use("/user", user);
app.use("/files", files);

// Start Listening

const listener = app.listen(process.env.PORT || 8081, () => {
  console.log("Listening on port " + listener.address().port);
});

connectToDatabase();
