import {
  Button,
  Banner,
  IconCheckCircle32,
  IconWarning32,
  Container,
  Text,
  Modal,
  render,
  VerticalSpace,
  Toggle,
  SelectableItem,
  LoadingIndicator
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { Fragment, h, JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import figmaConfig from './config/figma.config';
import '!./styles/styles.css'

import {
  ClosePluginEvent,
  CollectVariablesEvent,
  ErrorEvent,
  SyncErrorEvent,
  SyncVariablesEvent,
  VariablesData
} from './types'
import { useVariables } from './features';

function Plugin() {
  const { initialDataState } = useVariables();
  const [data, setData] = useState<VariablesData>(initialDataState);
  const [selectedCollections, setSelectedCollections] = useState<boolean[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<boolean[]>([]);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [syncError, setSyncError] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    emit('INIT')
  }, []);


  on<CollectVariablesEvent>('COLLECT_VARIABLES', (data) => {
    setData(data);

    setSelectedCollections(Array.from({ length: Object.keys(data).length }, () => true));
    setSelectedThemes(Array.from({ length: Object.keys(data.themes).length }, () => true));

    setInitialLoading(false);
  });

  on('FINISHED', () => {
    setLoading(false);
    setFinished(true);
  });

  on<ErrorEvent>('ERROR', (message) => {
    setError(true);
    setErrorMessage(message || '')
  });

  on<SyncErrorEvent>('SYNC_ERROR', () => {
    setLoading(false);
    setSyncError(true);
  });

  const handleSyncVariablesButtonClick = () => {
    setFinished(false);
    setSyncError(false);
    setLoading(true)

    const colorPalette = selectedCollections[0] ? data.colorPalette : {};

    const themes = Object.keys(data.themes).reduce((acc, theme, idx) => {
      if (selectedThemes[idx]) {
        (acc as any)[theme] = data.themes[theme];
      }
      return acc;
    }, {})

    emit<SyncVariablesEvent>('SYNC_VARIABLES', { ...data, colorPalette, themes })
  }

  const handleCloseErrorModal = () => {
    setError(false);
    emit<ClosePluginEvent>('CLOSE_PLUGIN');
  }

  const handleSelectCollection = (idx: number, event: JSX.TargetedMouseEvent<HTMLInputElement> | JSX.TargetedEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.checked;
    setSelectedCollections((prevState) => prevState.map((value, index) => index === idx ? newValue : value));
  }

  const handleSelectTheme = (idx: number, event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.checked;
    setSelectedThemes((prevState) => prevState.map((value, index) => index === idx ? newValue : value));

    setSelectedCollections(Array.from({ length: Object.keys(data).length }, () => selectedThemes.map((value, index) => index === idx ? newValue : value).some((i) => i)));
  }

  return (
    <Container space="medium">
      <VerticalSpace space="small" />
      <Text>Что вы хотите синхронизировать?</Text>
      <VerticalSpace space="medium" />

      { initialLoading && <LoadingIndicator /> }
      <Container space="medium" className="flex flex-col">
        { data && Object.keys(data).map((collection, idx) => (
          Array.isArray((data as any)[collection])
            ?
              <Toggle value={selectedCollections[idx]} onChange={(event) => handleSelectCollection(idx, event)}>
                <Text>{ collection }</Text>
              </Toggle>
            :
              <Container space="medium" className="flex flex-col py-4">
                { Object.keys((data as any)[collection]).map((theme, idx) => (
                    <SelectableItem value={selectedThemes[idx]} onChange={(event) => handleSelectTheme(idx, event)}>
                      { theme }
                    </SelectableItem>
                )) }
              </Container>
        )) }
      </Container>

      <VerticalSpace space="large" />
      <Button fullWidth disabled={selectedCollections.every((i) => !i)} loading={initialLoading || loading} onClick={handleSyncVariablesButtonClick}>
        Синхронизировать
      </Button>

      <VerticalSpace space="large" />

      { finished &&
        <Banner icon={<IconCheckCircle32 />} variant="success">
          Переменные успешно синхронизированы
        </Banner>
      }

      { syncError &&
        <Banner icon={<IconWarning32 />} variant="warning">
          Произошла ошибка при синхронизации переменных
        </Banner>
      }

      <Modal open={error}>
        <div class="p-4" style="width: 300px">
          <p class="mb-2 text-2xl text-center">Дииииизаааайнееер!</p>
          <p class="mb-4 text-xl text-center">Мужчина волк - одинокий!</p>

          <div class="w-full flex justify-center items-center">
            <img src="https://s3-alpha.figma.com/profile/11f29824-4818-4cbd-80dc-52335eaf69d5" alt="bratochek"/>
          </div>

          { errorMessage
            ? <p class="mt-4 text-xl">{errorMessage}</p>
            : <Fragment>
              <p className="mt-5">Ну и что ты поправил и почему все разъебало?</p>
              <p>Проверь, что у тебя есть коллекции переменных с названиями "{figmaConfig.colorPaletteName}" и
                "{figmaConfig.tokensName}"</p>
              <p>Если их нет или ты что-то переименовал, то иди к разработчику плагина, и поясни кто ты такой вообще и
                зачем это сделал!</p>
            </Fragment>

          }

          <Button fullWidth secondary class="mt-4" onClick={handleCloseErrorModal}>
            Закрыть плагин и пойти плакать
          </Button>
        </div>
      </Modal>
    </Container>
  )
}

export default render(Plugin)
