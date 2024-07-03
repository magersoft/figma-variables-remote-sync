import { CollectVariablesEvent, ErrorEvent, VariablesData } from '../types';
import { mappingColorPalette, parseVariables } from '../utils';
import { emit } from '@create-figma-plugin/utilities';
import figmaConfig from '../config/figma.config';

export function useVariables() {
  const initialDataState: VariablesData = {} as VariablesData;

  const getAllVariables = () => {
    const collections = figma.variables.getLocalVariableCollections();
    const variables =  figma.variables.getLocalVariables()

    if (!collections.length || !variables.length) {
      emit<ErrorEvent>('ERROR', 'Плагин не может найти переменные. Пожалуйста, убедитесь, что у вас есть коллекции переменных в Figma.')
      return;
    }

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

  const syncAllVariables = async (data: VariablesData) => {
    figma.notify(`🥰 Finished`);

    const { colorPalette, themes } = data;

    try {
      await Promise.all([
        syncColorPalette(colorPalette),
        syncThemes(themes),
      ]);

      emit('FINISHED');
    } catch (err) {
      console.error(err);
      emit('SYNC_ERROR', err);
    }
  }

  const syncColorPalette = async (data: VariablesData['colorPalette']) => {
    if (!data.length) return;

    const response = await fetch(`${figmaConfig.apiUrl}/figma-sync/colors`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ colors: data }),
    });
    const { message } = await response.json();

    console.log(message);
  }

  const syncThemes = async (data: VariablesData['themes']) => {
    if (!Object.keys(data).length) return;

    const response = await fetch(`${figmaConfig.apiUrl}/figma-sync/themes`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ themes: data }),
    });
    const { message } = await response.json();

    console.log(message);
  }

  return {
    initialDataState,
    getAllVariables,
    syncAllVariables
  }
}
