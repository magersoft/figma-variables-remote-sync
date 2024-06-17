import { CollectVariablesEvent, ErrorEvent, VariablesData } from '../types';
import { mappingColorPalette, parseVariables } from '../utils';
import { emit } from '@create-figma-plugin/utilities';
import figmaConfig from '../config/figma.config';

export function useVariables() {
  const initialDataState: VariablesData = {} as VariablesData;

  const getAllVariables = () => {
    const collections = figma.variables.getLocalVariableCollections();
    const variables =  figma.variables.getLocalVariables()

    const [ColorPalette, Tokens] = collections;

    if (ColorPalette.name !== figmaConfig.colorPaletteName || Tokens.name !== figmaConfig.tokensName) {
      emit<ErrorEvent>('ERROR')
      return;
    }

    const colorPaletteVariables = variables.filter((variable) => variable.variableCollectionId === ColorPalette.id);
    const tokensVariables = variables.filter((variable) => variable.variableCollectionId === Tokens.id);

    const colorPalette = colorPaletteVariables.map((variable) => mappingColorPalette(variable, ColorPalette.defaultModeId));
    const themes = parseVariables(tokensVariables, Tokens.modes, colorPalette);

    emit<CollectVariablesEvent>('COLLECT_VARIABLES', {
      colorPalette,
      themes,
    })
  }

  const syncVariables = async (data: VariablesData) => {
    figma.notify(`🥰 Finished`);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('Test error');
        }, 1000);
      });

      emit('FINISHED');
      console.log(data);
    } catch (err) {
      console.error(err);
      emit('SYNC_ERROR', err);
    }
  }

  return {
    initialDataState,
    getAllVariables,
    syncVariables
  }
}
