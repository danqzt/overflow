import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from '@/components/rte/Toolbar.tsx'
import { useEffect } from 'react'
import clsx from 'clsx'

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
  const editor = useEditor({
    extensions: [StarterKit],
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
    onBlur : onBlur,
    onUpdate : ({ editor }) => {
      console.log("CHANGED:", editor.getHTML());
      onChange(editor.getHTML())
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
