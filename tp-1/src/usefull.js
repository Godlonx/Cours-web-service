import seed from "./posts.seed.json" with { type: "json" }

export const posts = seed

const FIELDS = ["postId", "name", "email", "body"]
const MAX_LENGTH = { name: 255, email: 254, body: 10_000 }
const EMAIL_REGEX = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/ // https://regex101.com/library/SOgUIV

export const parseId = (ctx) => {
  if (!/^\d+$/.test(ctx.params.id)) ctx.throw(400, "id must be a positive integer")
  return Number(ctx.params.id)
}

export const findIndex = (ctx) => {
  const id = parseId(ctx)
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) ctx.throw(404, "Post not found")
  return index
}

export const validateField = (ctx, key, value) => {
  if (key === "postId") {
    if (!Number.isInteger(value)) ctx.throw(400, "postId must be an integer")
    return
  }
  if (typeof value !== "string" || value.trim() === "") {
    ctx.throw(400, `${key} must be a non-empty string`)
  }
  if (value.length > MAX_LENGTH[key]) {
    ctx.throw(400, `${key} must be at most ${MAX_LENGTH[key]} characters`)
  }
  if (key === "email" && !EMAIL_REGEX.test(value)) {
    ctx.throw(400, "email is not valid")
  }
}

export const rejectUnknownKeys = (ctx, body) => {
  const unknown = Object.keys(body).filter(key => !FIELDS.includes(key))
  if (unknown.length > 0) ctx.throw(400, `Unknown or read-only field(s): ${unknown.join(", ")}`)
}

export const validateFullPost = (ctx, body) => {
  rejectUnknownKeys(ctx, body)
  for (const key of FIELDS) {
    if (!(key in body)) ctx.throw(400, `${key} is required`)
    validateField(ctx, key, body[key])
  }
}

export const getNewPostId = () => {
  return Math.max(0, ...posts.map(p => p.id)) + 1
}

export const createPost = (id, { postId, name, email, body }) => {
  return ({ postId, id, name, email, body })
}

// Error handler: must be the first middleware so it catches errors from everything after it
export const errorHandler = async (ctx, next) => {
  try {
    await next()
    // No route matched (404) or allowedMethods() refused the method (405): no body was set
    if (ctx.status >= 400 && ctx.body == null) {
      const status = ctx.status
      ctx.body = { error: status === 404 ? "Not found" : "Method not allowed" }
      ctx.status = status // setting ctx.body changes a default 404 into 200, so restore it
    }
  } catch (err) {
    const status = err.status >= 400 && err.status < 500 ? err.status : 500
    ctx.status = status
    ctx.body = { error: status === 500 ? "Internal server error" : err.message }
    if (status === 500) console.error(err) // only log real server bugs
  }
}
