import React from 'react'
import HESelect from 'components/HESelect'
import HESearchSelect from 'components/HESearchSelect'
import HEInput from 'components/HEInput'
import HERadio from 'components/HERadio'
// import { toastError } from 'components/HEToast'
import HEProjectPlat from 'components/HEProjectPlat'
import './index.less'
import { getWidgetList } from 'apis/WidgetAPI'
// import { getBusinessType } from 'apis/RuleAPI'
import { validateRoleLimit } from 'common/utils'
const {
  userInfo: { userDeptId: myUserDeptId }
} = god.PageData

function Row(props) {
  return (
    <div className="create-theme-modal__content__row">{props.children}</div>
  )
}

function Label(props) {
  return (
    <label className="create-theme-modal__content__row__label">
      {props.children}
    </label>
  )
}

const USE_REMOTE_URL = [
  { key: '是', value: true },
  { key: '否', value: false }
]
const DEFAULT_OPTION = [
  {
    key: '无',
    value: false
  }
]
class HERuleOperation extends React.Component {
  _selectRef = React.createRef()
  state = {
    componentPlat: 'h5',
    useRemoteUrl: false,
    remoteUrl: '',
    selectedRule: '', // 选中的规则
    ruleOptions: [], // 选择规则options
    businessList: [], // 规则的业务类型
    q: '',
    current: 1
  }

  async componentDidMount() {
    await this.getBusinessType()
    this.getRuleWidgetList(DEFAULT_OPTION)
  }
  getBusinessType = async () => {
    // let res = await getBusinessType()
    // const { data, code, msg } = res
    // if (code != 0) {
    //   toastError(msg)
    //   return
    // }
    // let types = []
    // Object.keys(data.businessList).forEach((key) => {
    //   types.push({
    //     value: key,
    //     key: data.businessList[key]
    //   })
    // })
    // this.setState({
    //   businessList: types
    // })
    this.setState({
      businessList: [
        { key: '无', value: 'clientView' },
        { key: '抽奖', value: 'draw' }
      ]
    })
  }
  getRuleWidgetList = async (ruleOptions = []) => {
    try {
      const { q, current } = this.state
      let params = {
        q,
        current,
        pageSize: 20,
        userDeptId: myUserDeptId,
        type: 'rule'
      }
      const { widgets } = await getWidgetList(params)
      const addOptions = []
      widgets.forEach(function (widget) {
        addOptions.push({
          value: {
            type: widget.type,
            version: widget.version
          },
          key: widget.name
        })
      })

      this.setState({
        ruleOptions: ruleOptions.concat(addOptions)
      })
      if (widgets.length === 0) {
        this._selectRef.showNoMore()
      }
      this._selectRef.hideLoading()
    } catch (error) {
      console.log('error', error)
    }
  }
  _handleSearchChange(value) {
    this.setState(
      { q: value, current: 1 },
      this.getRuleWidgetList.bind(this, DEFAULT_OPTION)
    )
  }
  _handleDropDown() {
    const { current, ruleOptions } = this.state
    this.setState({
      current: current + 1
    })
    this.getRuleWidgetList(ruleOptions)
  }

  render() {
    const {
      useRemoteUrl,
      selectedRule,
      remoteUrl,
      componentPlat,
      selectedBusiness, // 业务类型
      miniProgramId,
      showMiniProgramId,
      _handleProjectTypeChange,
      _handleMiniProgramIdChange,
      _handleUseRemoteSelect,
      _handleRuleChange,
      _handleUrlChange,
      isRuleProject,
      _handleBusinessChange
    } = this.props
    const { ruleOptions, businessList } = this.state
    // 如果是新建项目时，选择了使用规则，则单纯是一个规则项目，要求必须填写外部URL，没有进入编辑的入口，否则规则和h5的项目存在同一个表中会很混乱
    return (
      <React.Fragment>
        <HEProjectPlat
          _handleProjectTypeChange={_handleProjectTypeChange}
          _handleMiniProgramIdChange={_handleMiniProgramIdChange}
          componentPlat={componentPlat}
          miniProgramId={miniProgramId}
          showMiniProgramId={showMiniProgramId}
        />
        {validateRoleLimit('createRuleProject') && (
          <Row>
            <Label>{'应用规则'}：</Label>
            <HESearchSelect
              className="create-project-modal__content__row__select"
              onSelect={_handleRuleChange}
              onDropDown={this._handleDropDown.bind(this)}
              onSearchChange={this._handleSearchChange.bind(this)}
              options={ruleOptions}
              placeholder={'(非必选)选择模板需要的规则'}
              defaultValue={false}
              value={selectedRule}
              showSearch={true}
              ref={(node) => {
                this._selectRef = node
              }}
            />
          </Row>
        )}
        {selectedRule && (
          <React.Fragment>
            <Row>
              <Label>{'业务类型'}：</Label>
              <HESelect
                className="create-project-modal__content__row__select"
                onSelect={_handleBusinessChange}
                options={businessList}
                placeholder={'(非必选)业务类型'}
                defaultValue={'clientView'}
                value={selectedBusiness}
              />
            </Row>
            {!isRuleProject && (
              <Row>
                <span className="create-theme-modal__content__row__span">
                  {'该规则是否适用于外部链接'}：
                </span>
                <HERadio
                  onChange={_handleUseRemoteSelect}
                  options={USE_REMOTE_URL}
                  value={useRemoteUrl}
                />
              </Row>
            )}
            {useRemoteUrl && (
              <Row>
                <Label>{'外部链接'}：</Label>
                <HEInput
                  value={remoteUrl}
                  onChange={_handleUrlChange}
                  className="create-theme-modal__content__row__input"
                  type="text"
                  placeholder={'请填写外部链接'}
                />
              </Row>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

export default HERuleOperation
