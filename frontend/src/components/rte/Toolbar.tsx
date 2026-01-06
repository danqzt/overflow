import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  StrikethroughIcon,
} from '@heroicons/react/20/solid'
import { Button } from '@heroui/button'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useEffect, useState } from 'react'
import { RichTextOptions } from '@/libs/types/rte.ts'

export default function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [selectionMap, setSelectionMap] = useState<
    Record<RichTextOptions, boolean>
  >({
    [RichTextOptions.Bold]: false,
    [RichTextOptions.Italics]: false,
    [RichTextOptions.Strikethrough]: false,
    [RichTextOptions.Code]: false,
  })

  const updateToolbar = () => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const newSelectionMap: Record<RichTextOptions, boolean> = {
        [RichTextOptions.Bold]: selection.hasFormat('bold'),
        [RichTextOptions.Italics]: selection.hasFormat('italic'),
        [RichTextOptions.Strikethrough]: selection.hasFormat('strikethrough'),
        [RichTextOptions.Code]: selection.hasFormat('code'),
      }
      setSelectionMap(newSelectionMap)
    }
  }
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])
  const actions = [
    {
      icon: <BoldIcon className="h-5 w-5" />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        setSelectionMap((prev) => ({ ...prev, bold: !prev.bold }))
      },
      pressed: selectionMap.bold,
    },
    {
      icon: <ItalicIcon className="h-5 w-5" />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        setSelectionMap((prev) => ({ ...prev, italics: !prev.italics }))
      },
      pressed: selectionMap.italics,
    },
    {
      icon: <StrikethroughIcon className="h-5 w-5" />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        setSelectionMap((prev) => ({ ...prev, strikethrough: !prev.strikethrough }))
      },
      pressed: selectionMap.strikethrough,
    },
    {
      icon: <CodeBracketIcon className="h-5 w-5" />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
        setSelectionMap((prev) => ({ ...prev, code: !prev.code }))
      },
      pressed: selectionMap.code,
    },
  ]
  return (
    <div className="rounded-md space-x-1 pb-1 z-50">
      {actions.map((action, index) => (
        <Button
          key={index}
          type="button"
          onPress={action.onClick}
          radius="sm"
          isIconOnly
          color={action.pressed ? 'primary' : 'default'}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  )
}
