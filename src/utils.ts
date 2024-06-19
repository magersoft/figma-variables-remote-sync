import { ErrorEvent, VariableItem, VariablesMode } from './types';
import { emit } from '@create-figma-plugin/utilities';
import rgbHex from 'rgb-hex';


export function parseVariables(variables: Variable[], modes: VariablesMode[], colorPalette: VariableItem[]) {
  const themes: any = {}

  for (const mode in modes) {
    const modeName = String(modes[mode].name).toLowerCase();
    const modeId = String(modes[mode].modeId);

    const filterVariablesByType = (types: VariableResolvedDataType[]) => {
      return variables.filter((variable) => types.includes(variable.resolvedType)).map((variable) => {
        const id = variable.id;
        const name = variable.name;
        const description = variable.description;
        const type = variable.resolvedType;
        const value = getValueByVariableId(variable.valuesByMode[modeId], type, colorPalette);

        return {
          id,
          name,
          description,
          type,
          value,
        }
      })
    }

    themes[modeName] = {
      colors: filterVariablesByType(['COLOR']),
      variables: filterVariablesByType(['STRING', 'BOOLEAN', 'FLOAT'])
    }
  }

  return themes;
}

export function mappingColorPalette(variable: Variable, modeId: string): VariableItem {
  const {
    id,
    name,
    description,
    resolvedType,
    valuesByMode
  } = variable;

  const value = valuesByMode[modeId];
  const isRGBValue = validatePrimitiveColor(value);

  if (!isRGBValue) {
    emit<ErrorEvent>('ERROR', 'ТЫ ЧО ДЕЛАЕШЬ? В ПАЛИТРЕ ТОЛЬКО ПРИМИТИВЫ ДОЛЖНЫ БЫТЬ!')
    return [] as never;
  }

  return {
    id,
    name,
    description,
    type: resolvedType,
    value: "#" + convertRgbaColorToHexColor(value as RGBA),
  }
}

const validatePrimitiveColor = (value: VariableValue): boolean => typeof value === 'object' && ("r" in value) && ("g" in value) && ("b" in value)

const getValueByVariableId = (value: VariableValue, type: VariableResolvedDataType, colorPalette: VariableItem[]) => {
  if (!value) return;

  if (type === 'COLOR') {
    if (typeof value === 'object' && ("type" in value) && ("id" in value)) {
      const { id, type } = value;

      if (type === "VARIABLE_ALIAS") {
        const variable = colorPalette.find((variable) => variable.id === id);

        if (!variable) {
          emit<ErrorEvent>('ERROR', `Так, дизайнер! Ты что-то поменял и все сломал! В палитре цветов нет такого цвета для переменной!`)
          return;
        }

        return variable.name;
      }
    }
  }

  if (type === 'STRING') {
    return value;
  }

  if (type === 'FLOAT') {
    return value;
  }

  if (type === 'BOOLEAN') {
    return value;
  }

  return value;
}


function convertRgbaColorToHexColor(rgbColor: RGBA) {
  const { r, g, b, a } = rgbColor;
  if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
    return null;
  }
  try {
    return rgbHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a !== 1 ? Number(a) : undefined).toUpperCase();
  }
  catch (e) {
    console.log(e)
    return null;
  }
}
