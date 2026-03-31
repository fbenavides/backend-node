import { eventBus } from "../events/eventBus.js";

eventBus.on("sale.created", (sale) => {
  console.log("Guardando en logs:", sale.id);
});

eventBus.on("sale.created", (sale) => {
  console.log(`Notificando al cliente ${sale.customer}`);
});