import { Router } from "@koa/router"
import {
  posts,
  findIndex,
  validateField,
  rejectUnknownKeys,
  validateFullPost,
  getNewPostId,
  createPost,
} from "./usefull.js"

export const router = new Router()

router.get("/posts", async (ctx) => {
  if (ctx.query.postId === undefined) {
    ctx.body = posts
    return
  }
  if (!/^\d+$/.test(ctx.query.postId)) ctx.throw(400, "postId must be an integer")
  const postId = Number(ctx.query.postId)
  ctx.body = posts.filter(p => p.postId === postId)
})

router.get("/posts/:id", async (ctx) => {
  const id = findIndex(ctx);
  ctx.body = posts[id]
})

router.post("/posts", async (ctx) => {
  const body = ctx.request.body
  validateFullPost(ctx, body)
  const post = createPost(getNewPostId(), body)
  posts.push(post)
  ctx.status = 201
  ctx.set("Location", `/posts/${post.id}`)
  ctx.body = post
})

router.put("/posts/:id", async (ctx) => {
  const index = findIndex(ctx)
  const body = ctx.request.body
  validateFullPost(ctx, body)
  posts[index] = createPost(posts[index].id, body)
  ctx.body = posts[index]
})

router.patch("/posts/:id", async (ctx) => {
  const index = findIndex(ctx)
  const body = ctx.request.body
  if (Object.keys(body).length === 0) ctx.throw(400, "Body must contain at least one field")
  rejectUnknownKeys(ctx, body)
  for (const [key, value] of Object.entries(body)) validateField(ctx, key, value)
  posts[index] = createPost(posts[index].id, { ...posts[index], ...body })
  ctx.body = posts[index]
})

router.delete("/posts/:id", async (ctx) => {
  const index = findIndex(ctx)
  posts.splice(index, 1)
  ctx.status = 204
})
