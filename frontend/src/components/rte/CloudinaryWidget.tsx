import { useEffect, useRef } from 'react'
import type { CloudinaryUploadWidgetResults } from '@cloudinary-util/types'
import type { ReactNode} from 'react';
import { getCloudinaryUploadOptions } from '@/libs/uploadConfig.ts'

declare global {
  interface Window {
    cloudinary: CloudinaryBase
  }
}

interface CloudinaryUploadWidgetProps {
  onUpload?: (result: CloudinaryUploadWidgetResults) => void
  signatureEndpoint: string
  className?: string
  children?: ReactNode | string
}

export const CloudinaryWidget = ({
  signatureEndpoint,
  onUpload,
  children,
  className,
  ...props
}: CloudinaryUploadWidgetProps) => {
  const uploadWidgetRef = useRef<any>(null)
  const uploadButtonRef = useRef<HTMLButtonElement>(null)
  const uploadOptions = getCloudinaryUploadOptions(signatureEndpoint)

  useEffect(() => {
    const initializeUploadWidget = () => {
      if (window.cloudinary && uploadButtonRef.current) {
        // Create upload widget
        uploadWidgetRef.current = window.cloudinary.createUploadWidget(
          uploadOptions as CloudinaryUploadWidgetOptions,
          (error: any, result: any) => {
            if (!error && result && result.event === 'success') {
              onUpload?.(result)
            }
          },
        )

        // Add click event to open widget
        const handleUploadClick = () => {
          if (uploadWidgetRef.current) {
            uploadWidgetRef.current.open()
          }
        }

        const buttonElement = uploadButtonRef.current
        buttonElement.addEventListener('click', handleUploadClick)

        // Cleanup
        return () => {
          buttonElement.removeEventListener('click', handleUploadClick)
        }
      }
    }

    initializeUploadWidget()
  }, [])

  return (
    <button {...props} className={className || ''} ref={uploadButtonRef}>
      {children || 'Upload'}
    </button>
  )
}
