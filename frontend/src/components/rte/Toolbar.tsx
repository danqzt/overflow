import { useEditorState } from '@tiptap/react'
import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  LinkIcon,
  PhotoIcon,
  StrikethroughIcon,
} from '@heroicons/react/20/solid'
import { Button } from '@heroui/button'
import type { CloudinaryUploadWidgetResults } from '@cloudinary-util/types'
import type { Editor} from '@tiptap/react';
import { errorToast } from '@/libs/util.ts'
import { CloudinaryWidget } from '@/components/rte/CloudinaryWidget.tsx'

type Props = {
  editor: Editor | null
}
export default function Toolbar({ editor }: Props) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null
      return {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isStrike: editor.isActive('strike'),
        isCodeBlock: editor.isActive('codeBlock'),
        isLink: editor.isActive('link'),
      }
    },
  })

  if (!editor) return null

  const onUploadImage = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === 'object') {
      editor.chain().focus().setImage({ src: result.info.secure_url }).run()
    } else {
      errorToast({ message: 'Image upload failed' })
    }
  }

  const options = [
    {
      icon: <BoldIcon className="w-5 h-5" />,
      onclick: () => editor.chain().focus().toggleBold().run(),
      pressed: editorState?.isBold,
    },
    {
      icon: <ItalicIcon className="w-5 h-5" />,
      onclick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editorState?.isItalic,
    },
    {
      icon: <StrikethroughIcon className="w-5 h-5" />,
      onclick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editorState?.isStrike,
    },
    {
      icon: <CodeBracketIcon className="w-5 h-5" />,
      onclick: () => editor.chain().focus().toggleCodeBlock().run(),
      pressed: editorState?.isCodeBlock,
    },
    {
      icon: <LinkIcon className="w-5 h-5" />,
      onclick: () => editor.chain().focus().toggleLink().run(),
      pressed: editorState?.isLink,
    },
  ]
  return (
    <div className="rounded-md space-x-1 pb-1 z-50">
      {options.map((option, index) => (
        <Button
          isIconOnly
          key={index}
          type="button"
          radius="sm"
          size="sm"
          color={option.pressed ? 'primary' : 'default'}
          onPress={option.onclick}
        >
          {option.icon}
        </Button>
      ))}
      <Button
        isIconOnly
        radius="sm"
        size="sm"
        as={CloudinaryWidget}
        signatureEndpoint="/api/sign-image"
        onUpload={onUploadImage}
        type="button"
      >
        <PhotoIcon className="w-5 h-5" />
      </Button>
    </div>
  )
}
