import { createFileRoute } from '@tanstack/react-router'
import { cloudinary } from '@/libs/server/cloudinary.ts'

export const Route = createFileRoute('/api/sign-image')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            paramsToSign: Record<string, string>
          }
          const signature = cloudinary.v2.utils.api_sign_request(
            body.paramsToSign,
            process.env.CLOUDINARY_API_SECRET as string,
          )
          return Response.json({ signature })
        } catch (error) {
          console.log('SIGNINGERR: ', error);
          new Response("Failed to upload", { status: 500 });
        }
      },
      DELETE: async ({ request }) => {
        try {
          const publicId = await request.json()
          await cloudinary.v2.uploader.destroy(publicId)
          return new Response(null, { status: 204 })
        } catch (error) {
          console.log('Delete fai: ', error);
          return new Response("Failed to delete", { status: 500 })
        }
      },
    },
  },
})
