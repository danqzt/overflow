import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import Toolbar from '@/components/rte/Toolbar.tsx'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { EditorTheme } from '@/components/rte/EditorTheme.ts'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'

export default function RichTextEditor() {
  const config = {
    namespace: 'MyEditor',
    theme: EditorTheme,
    onError: (error: Error) => console.error(`RTE error ${error}`),
  }
  return (
    <LexicalComposer initialConfig={config}>
      <Toolbar/>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="w-full p-3 bg-default-100 rounded-xl min-h-60 prose dark:prose-invert max-w-none focus:outline-none" />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <AutoFocusPlugin/>
      <HistoryPlugin/>
    </LexicalComposer>
  )
}
