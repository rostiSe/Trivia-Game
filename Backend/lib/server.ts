import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
 
const app = express();
const port = 3005;
 
app.all("/api/auth/*", toNodeHandler(auth)); // For ExpressJS v4
// app.all("/api/auth/*splat", toNodeHandler(auth)); For ExpressJS v5 
 
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());
 
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});