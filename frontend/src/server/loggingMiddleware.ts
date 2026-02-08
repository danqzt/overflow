import { createMiddleware } from "@tanstack/react-start";

const loggingMiddleware = createMiddleware().server(
    async ({ next, request }) => {
        console.log('url:', request.url)
        console.log('Incoming request:', JSON.stringify(request.body))
        return await next()
    },
)

export default loggingMiddleware;