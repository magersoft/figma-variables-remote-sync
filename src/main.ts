import { emit, on, showUI } from '@create-figma-plugin/utilities'

import { ClosePluginEvent, InitEvent, SyncVariablesEvent } from './types'
import { useVariables } from './features';

export default function () {
  const { getAllVariables, syncVariables } = useVariables();

  on<InitEvent>('INIT', () => getAllVariables())

  on<SyncVariablesEvent>('SYNC_VARIABLES', (data: any) => syncVariables(data))

  on<ClosePluginEvent>('CLOSE_PLUGIN', () => figma.closePlugin())

  showUI({ height: 240, width: 320 })
}
