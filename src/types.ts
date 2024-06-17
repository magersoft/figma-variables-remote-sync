import { EventHandler } from '@create-figma-plugin/utilities'

export interface InitEvent extends EventHandler {
  name: 'INIT'
  handler: () => void
}

export interface CollectVariablesEvent extends EventHandler {
  name: 'COLLECT_VARIABLES'
  handler: (data: VariablesData) => void
}

export interface SyncVariablesEvent extends EventHandler {
  name: 'SYNC_VARIABLES'
  handler: (data: any) => Promise<void>
}

export interface ErrorEvent extends EventHandler {
  name: 'ERROR'
  handler: (message?: string) => void
}

export interface SyncErrorEvent extends EventHandler {
  name: 'SYNC_ERROR'
  handler: () => void
}

export interface ClosePluginEvent extends EventHandler {
  name: 'CLOSE_PLUGIN'
  handler: () => void
}

export interface VariableItem {
  id: string
  name: string
  description: string
  type: string
  value: string | number | boolean | any
}

export interface VariablesMode {
  modeId: string
  name: string
}

export interface VariablesData {
  colorPalette: VariableItem[]
  themes: {
    [key: string]: {
      colors: VariableItem[]
      variables: VariableItem[]
    }
  }
}
