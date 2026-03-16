type User = {
  name: string
  age: number
}

function createUser(user: User) {
  return user.name
}

let nombre = createUser({ name: "Fernando", age: 30 })
console.log('Nombre:', nombre)
var nombre2 = createUser({ username: "Fernando" })
console.log('Nombre 2:', nombre2)