import Koa from "koa"
import { bodyParser } from "@koa/bodyparser"
import { router } from "./src/controller.js"
import { errorHandler } from "./src/usefull.js"

const app = new Koa()

app.use(errorHandler)
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})
