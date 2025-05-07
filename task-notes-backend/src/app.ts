import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiv1 from "./routes/notes.routes";
import { AppDataSource } from "./config/database";
import "reflect-metadata";

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use("/", apiv1);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
