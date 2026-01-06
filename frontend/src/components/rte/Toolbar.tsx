import { Editor, useEditorState } from '@tiptap/react'
import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  StrikethroughIcon,
} from '@heroicons/react/20/solid'
import { Button } from '@heroui/button'

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
      }
    },
  })

  if (!editor) return null

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
    </div>
  )
}
