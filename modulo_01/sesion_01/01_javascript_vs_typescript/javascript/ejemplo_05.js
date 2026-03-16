function createUser(user) {
  return user.name
}

var nombre = createUser({ name: "Fernando", age: 30 })
console.log('Nombre:', nombre)
var nombre2 = createUser({ username: "Fernando" })
console.log('Nombre 2:', nombre2)