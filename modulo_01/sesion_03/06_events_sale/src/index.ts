import "./listeners/sales.listener.js"; 
import { createSale } from "./services/sales.service.js";

console.log("Servidor iniciado");

createSale("Laptop", "Fernando");