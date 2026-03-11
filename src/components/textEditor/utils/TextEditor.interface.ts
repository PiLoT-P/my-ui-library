import { IDefaultFile, IMembersUG } from "@lib/interfaces/defaults.intefaces"
import { Dispatch, HTMLAttributes, SetStateAction } from "react"

export interface QuoteAuthor{
  id: number,
  lastName: string,
  firstName: string
}

export interface Quote{
  author:QuoteAuthor,
  content: string,
}

export interface TextEditorState {
  html: string,
  quote?: Quote,
  files?: IDefaultFile[]
  userTag?: IMembersUG,
  tagUsers?: IMembersUG[],
}

export interface TextEditorOptios {
  placeholder?: string,
  fullWidth?: boolean,
  blockHeight?: number,
  isDesabledFiles?: boolean,
}

export interface TextEditorProps {
  state: TextEditorState,
  setState: Dispatch<SetStateAction<TextEditorState>>

  handleSend?: (data: TextEditorState, idUpdateElement?: number) => void,
  handleCancel?: () => void,

  options?: TextEditorOptios

  editorAttributes?: HTMLAttributes<HTMLDivElement>

  update: {
    idUpdateElement?: number,
  }
}