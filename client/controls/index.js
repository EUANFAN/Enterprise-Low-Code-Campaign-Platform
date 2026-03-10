import { HEFilePickerShow } from 'components/HEFilePicker'
import HEPageStateBox from 'components/HEPageStateBox'
import VariablePicker from 'components/HEVariablePicker'
import SetEditor from 'components/SetEditor'
import MoveWidgetOperation from 'components/HEMoveWidgetOperation'
import ControlWrap from './ControlWrap'
import { getWidgetVariable, getWidget, getListenerConfig } from 'common/utils'
import { afterUpdateHook, beforeUpdateHook } from 'common/attributeHook'
import { getDataContainerData } from 'common/handlePageDataByVariable'
import { getOptionByApi } from 'common/handlePageDataByVariable'
import { getWidgetConfigByType } from 'widgets'
import {
  TriggerConfigs,
  getTriggerConfigByType,
  loadTriggerConfig,
  getUsedTriggerVersion
} from 'triggers'
import clazzTrigger from 'store/clazz/Trigger'
import stageStore from 'store/stage'

let getControls = async (type) => {
  const Federation = await import('h5_federation/Federation')
  Federation.useComponents({
    ControlWrap,
    HEPageStateBox,
    MoveWidgetOperation,
    HEFilePickerShow,
    VariablePicker,
    SetEditor
  })
  Federation.useMethods({
    afterUpdateHook,
    beforeUpdateHook,
    getWidgetVariable,
    getDataContainerData,
    getOptionByApi,
    getWidget,
    getListenerConfig,
    getWidgetConfigByType,
    getTriggerConfigByType,
    loadTriggerConfig,
    getUsedTriggerVersion
  })
  Federation.useConfigs({ TriggerConfigs })
  Federation.useStore({ clazzTrigger, stageStore })
  return type ? Federation.Controls[type] : Federation.Controls
}

export default getControls
