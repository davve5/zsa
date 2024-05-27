import { z } from "zod"
import { createServerAction } from "zsa"
import {
  createOpenApiServerActionRouter,
  createRouteHandlers,
} from "zsa-openapi"

const getReply = createServerAction()
  .input(
    z.object({ postId: z.string(), replyId: z.string(), message: z.string() })
  )
  .handler(async ({ input, request }) => {
    // Sleep for .5 seconds
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Update the message
    return {
      input,
      auth: request ? request.headers.get("authorization") : undefined,
    }
  })

const updatePost = createServerAction()
  .input(z.object({ postId: z.string() }))
  .handler(async ({ input }) => {
    // Sleep for .5 seconds
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Update the message
    return input.postId
  })

const createPost = updatePost
const getPosts = createPost

const router = createOpenApiServerActionRouter({
  pathPrefix: "/api",
  defaults: {
    tags: ["posts"],
  },
})
  .get("/", getPosts, {
    tags: ["posts"],
  })
  .post("/posts", createPost, {
    tags: ["posts"],
  })

const routerTwo = createOpenApiServerActionRouter({
  pathPrefix: "/hello/123412",
  defaults: {
    tags: ["posts"],
  },
})
  .put("/posts/{postId}", updatePost, {})
  .get("/posts/{postId}/replies/{replyId}", getReply, {
    protect: true,
  })

const merged = createOpenApiServerActionRouter({
  extend: [router, routerTwo],
})

export const { GET, POST, PUT } = createRouteHandlers(router)
