"use server"

import { sleep } from "lib/utils"
import { notFound, redirect } from "next/navigation"
import { z } from "zod"
import { createServerAction } from "zsa"
import { CLIENT_TEST_DATA, TEST_DATA } from "./data"
import {
  adminAction,
  faultyOutputProcedure,
  inputNumberProcedure,
  ownsPostAction,
  ownsPostIsAdminAction,
  protectedAction,
  protectedTimeoutAction,
  publicAction,
  rateLimitedAction,
  redirectAction,
  retryAction,
  timeoutAction,
} from "./procedures"

export const helloWorldAction = publicAction.handler(async () => {
  return "hello world" as const
})

export const getUserIdAction = protectedAction.handler(async ({ ctx }) => {
  return ctx.auth.id
})

export const getUserGreetingAction = protectedAction.handler(
  async ({ ctx }) => {
    return `Hello, ${ctx.auth.name}!` as const
  }
)

export const getAdminGreetingAction = adminAction.handler(async ({ ctx }) => {
  return `Hello, ${ctx.auth.name}!` as const
})

export const queryAction = publicAction
  .input(
    z.object({
      searchTerm: z.string(),
    })
  )
  .handler(async ({ input }) => {
    await sleep(CLIENT_TEST_DATA.sleep)
    return {
      result: `Query Result: ${input.searchTerm}`,
    }
  })

const generateItems = (page: number) => {
  const items = []
  const startId = (page - 1) * 10 + 1
  for (let i = startId; i < startId + 10; i++) {
    items.push({ id: i, name: `Item ${i}` })
  }
  return items
}

export const infiniteQueryAction = publicAction
  .input(
    z.object({
      page: z.number().min(1),
    })
  )
  .handler(async ({ input }) => {
    const { page } = input
    await sleep(CLIENT_TEST_DATA.sleep)
    const items = generateItems(page)
    const hasMore = page < 5
    const nextPage = hasMore ? page + 1 : undefined
    return {
      items,
      hasMore,
      nextPage,
    }
  })

export const mutationAction = publicAction
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async ({ input }) => {
    await sleep(CLIENT_TEST_DATA.sleep)
    return {
      result: `Mutation Result: ${input.name}`,
    }
  })

export const statesAction = publicAction
  .input(
    z.object({
      status: z.enum(["success", "error"]),
    })
  )
  .handler(async ({ input }) => {
    await sleep(CLIENT_TEST_DATA.sleep)
    if (input.status === "error") {
      throw new Error("Error")
    }
    return "Success"
  })

export const getPostByIdAction = ownsPostAction.handler(async ({ ctx }) => {
  return ctx.post
})

export const resetAction = publicAction.handler(async () => {
  await sleep(CLIENT_TEST_DATA.sleep)
  return CLIENT_TEST_DATA.resultMessages.resetAction
})

export const loadingHelloWorldAction = publicAction
  .input(z.object({ ms: z.number() }))
  .handler(async ({ input: { ms } }) => {
    await sleep(ms)
    return CLIENT_TEST_DATA.resultMessages.helloWorldAction
  })

export const loadingGetUserGreetingAction = protectedAction
  .input(z.object({ ms: z.number() }))
  .handler(async ({ ctx, input: { ms } }) => {
    await sleep(ms)
    return `Hello, ${ctx.auth.name}!` as const
  })

export const optimisticAction = publicAction.handler(async () => {
  await sleep(CLIENT_TEST_DATA.sleep)
  return CLIENT_TEST_DATA.resultMessages.optimisticUpdates as string
})

export const errorAction = publicAction.handler(async () => {
  throw new Error(TEST_DATA.errors.string)
})

export const callbacksAction = publicAction
  .input(z.object({ shouldError: z.boolean() }))
  .handler(async ({ input: { shouldError } }) => {
    await sleep(CLIENT_TEST_DATA.sleep)
    if (shouldError) {
      throw new Error(CLIENT_TEST_DATA.resultMessages.callbacksAction)
    }
    return CLIENT_TEST_DATA.resultMessages.callbacksAction
  })

export const getPostByIdIsAdminAction = ownsPostIsAdminAction.handler(
  async ({ ctx }) => {
    return ctx.post
  }
)

export const faultyAction = protectedAction
  .input(
    z.object({
      errorType: z.enum(["string", "class"]),
    })
  )
  .handler(async ({ input }) => {
    if (input.errorType === "string") {
      throw TEST_DATA.errors.string
    } else {
      throw new Error(TEST_DATA.errors.string)
    }

    return "success"
  })

export const undefinedAction = rateLimitedAction.handler(async ({ ctx }) => {
  return ctx
})

export const helloWorldTimeoutAction = createServerAction()
  .timeout(TEST_DATA.timeout)
  .handler(async () => {
    await sleep(TEST_DATA.timeout + 1000) // trigger timeout
    return "hello world" as const
  })

export const helloWorldProcedureTimeoutAction = timeoutAction.handler(
  async () => {
    await sleep(TEST_DATA.timeout + 1000) // trigger timeout
    return "hello world" as const
  }
)

export const helloWorldProtectedTimeoutAction = protectedTimeoutAction.handler(
  async () => {
    await sleep(TEST_DATA.timeout + 1000) // trigger timeout
    return "hello world" as const
  }
)

export const helloWorldRetryAction = publicAction
  .retry({
    maxAttempts: TEST_DATA.retries.maxAttempts,
    delay: TEST_DATA.retries.delay,
  })
  .handler(async () => {
    throw new Error("forcing retry")
  })

export const helloWorldExponentialRetryAction = publicAction
  .retry({
    maxAttempts: TEST_DATA.retries.maxAttempts,
    delay: (currentAttempt) =>
      TEST_DATA.retries.delay * Math.pow(2, currentAttempt - 1),
  })
  .handler(async () => {
    throw new Error("forcing retry")
  })

export const helloWorldRetryProcedureAction = retryAction.handler(async () => {
  return "hello world" as const
})

export const faultyOutputInProcedureAction = faultyOutputProcedure
  .createServerAction()
  .handler(async () => {
    return
  })

export const faultyOutputAction = publicAction
  .output(
    z.object({
      number: z.number().refine((n) => n > 0),
    })
  )
  .handler(async () => {
    return {
      number: 0,
    }
  })

export const transformedOutputAction = publicAction
  .output(
    z.object({
      number: z.number().transform((n) => 100),
    })
  )
  .handler(async () => {
    return {
      number: 1,
    }
  })

export const inputNumberAction = inputNumberProcedure
  .createServerAction()
  .handler(async ({ input }) => {
    return input
  })

export const inputLargeNumberAction = inputNumberProcedure
  .createServerAction()
  .input(
    z.object({
      number: z.number().refine((n) => n > 100),
    })
  )
  .handler(async ({ input }) => {
    return input
  })

export const multiplyAction = publicAction
  .input(
    z.object({
      number2: z.coerce.number(),
      number1: z.coerce.number(),
    })
  )
  .handler(async ({ input }) => {
    return {
      result: input.number1 * input.number2,
    }
  })

export const multiplyActionWithCustomResponse = publicAction
  .input(
    z.object({
      number2: z.coerce.number(),
      number1: z.coerce.number(),
    })
  )
  .handler(async ({ input }) => {
    return new Response(
      JSON.stringify({ result: input.number1 * input.number2 }),
      {
        status: 201,
        headers: {
          "content-type": "application/json",
          "custom-header": "123",
        },
      }
    )
  })

export const protectedMultiplyAction = protectedAction
  .input(
    z.object({
      number2: z.coerce.number(),
      number1: z.coerce.number(),
    })
  )
  .handler(async ({ input, responseMeta }) => {
    if (responseMeta) {
      responseMeta.statusCode = 201
    }

    return {
      result: input.number1 * input.number2,
    }
  })

export const subtractAction = publicAction
  .input(
    z.object({
      number2: z.coerce.number(),
      number1: z.coerce.number(),
      number3: z.coerce.number(),
    })
  )
  .handler(async ({ input }) => {
    return {
      result: input.number1 - input.number2 - input.number3,
    }
  })

export const divideAction = publicAction
  .input(
    z.object({
      number1: z.coerce.number(),
      number2: z.coerce.number().refine((n) => n !== 0),
    })
  )
  .handler(async ({ input }) => {
    return {
      result: input.number1 / input.number2,
    }
  })

export const nextRedirectAction = publicAction.handler(async () => {
  redirect("/123")
  return "123"
})

export const nextNotFoundAction = publicAction.handler(async () => {
  notFound()
  return "123"
})

export const nextRedirectInProcedureAction = redirectAction.handler(
  async () => {
    return "123"
  }
)
