import Editor from '@monaco-editor/react';

type Props = { value: string; onChange: (v: string) => void; height?: string };

export default function JSONEditor({ value, onChange, height = '300px' }: Props) {
  return (
    <Editor
      height={height}
      defaultLanguage="json"
      value={value}
      onChange={(v) => onChange(v || '')}
      options={{ minimap: { enabled: false }, automaticLayout: true }}
    />
  );
}


