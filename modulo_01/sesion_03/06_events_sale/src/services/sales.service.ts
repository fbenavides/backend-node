import { eventBus } from "../events/eventBus.js";

export function createSale(product: string, customer: string) {
  const sale = {
    id: Math.floor(Math.random() * 1000),
    product,
    customer,
    date: new Date(),
  };

  console.log("Venta creada:", sale);

  eventBus.emit("sale.created", sale);
}