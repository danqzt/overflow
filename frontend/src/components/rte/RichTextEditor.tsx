import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import Image from '@tiptap/extension-image'
import Toolbar from '@/components/rte/Toolbar.tsx'
import { useDeleteImage } from '@/libs/hooks.ts'
import { extractPublicIdsFromHtml } from '@/libs/util.ts'

type Props = {
  value: string
  onChange: (body: string) => void
  onBlur: () => void
  errorMessage?: string
}
export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  errorMessage,
}: Props) {
  const { mutateAsync } = useDeleteImage()
  const prevPublicIds = useRef<Array<string>>([])
  const editor = useEditor({
    extensions: [StarterKit, Image],
    editorProps: {
      attributes: {
        class: clsx(
          'w-full p-3 bg-default-100 rounded-xl min-h-60 prose ' +
            'dark:prose-invert max-w-none dark:prose-pre:bg-primary-100',
          {
            'bg-red-50 dark:bg-red-900/30': Boolean(errorMessage),
          },
        ),
      },
    },
    onBlur: onBlur,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      const currentPublicIds = extractPublicIdsFromHtml(html)
      const prev = prevPublicIds.current
      const deleted = prev.filter((id) => !currentPublicIds.includes(id))
      if (deleted.length > 0) {
        deleted.forEach(async (id) => {
          await mutateAsync(id)
          console.log('deleted image:', id)
        })
      }
      prevPublicIds.current = currentPublicIds
    },
    immediatelyRender: false,
  })
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])
  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
