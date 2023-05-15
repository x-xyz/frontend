import { Button, ButtonProps } from '@chakra-ui/button'
import { useCallbackRef } from '@chakra-ui/hooks'
import VisuallyHidden from '@chakra-ui/visually-hidden'
import React, { useRef } from 'react'

type FileChanger =
  | {
      onFileChange: (file: File) => void
      multiple?: false
    }
  | {
      onFileChange: (files: File[]) => void
      multiple: true
    }

export type SelectFileButtonProps = ButtonProps &
  FileChanger & {
    accept?: string
  }

export default function SelectFileButton({
  multiple,
  onFileChange,
  children,
  accept,
  ...props
}: SelectFileButtonProps) {
  const fileChanger = { multiple, onFileChange } as FileChanger

  const inputRef = useRef<HTMLInputElement>(null)

  const onClick = useCallbackRef(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      inputRef.current?.click()
      if (props.onClick) props.onClick(e)
    },
    [props.onClick],
  )

  return (
    <>
      <Button {...props} onClick={onClick}>
        {children}
      </Button>
      <VisuallyHidden>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={e => {
            if (!e.target.files?.length) return
            if (!fileChanger.multiple) fileChanger.onFileChange(e.target.files[0])
            else fileChanger.onFileChange(Array.from(e.target.files))
          }}
        />
      </VisuallyHidden>
    </>
  )
}
