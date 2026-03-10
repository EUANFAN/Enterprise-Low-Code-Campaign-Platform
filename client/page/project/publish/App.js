import React from 'react'
import QRCode from 'qrcode.react'
import flatten from 'lodash/flatten'
import HEPaper from 'components/HEPaper'
import HEInput from 'components/HEInput'
import HEFrame from 'components/HEFrame'
import { HENavbar } from 'components/HENavbar'
import HEButton, { HEButtonSizes } from 'components/HEButton'
import { HECard, HECardContent } from 'components/HECard'
import { toastSuccess, toastError } from 'components/HEToast'
import { connectToast } from 'context/feedback'
import ClipboardUtils from 'utils/ClipboardUtils'
import DownloadUtils from 'utils/DownloadUtils'
import { ActionKeys, ThemeGroupTypes } from 'common/constants'
import { getOnlineUrl } from 'common/utils'
import ReviewGroupQRCode from 'static/imgs/qrcode.png'
import MiniLogo from 'static/imgs/minilogo.png'
import QueryString from 'common/queryString'

import './App.less'

const Links = {
  NORMAL: 'normalLink',
  SHORT: 'shortlink',
  JSONURL: 'jsonlink',
  // 小程序id
  MINIPROGRAMID: 'miniprogramId',
  // 小程序基础路径
  MINIPROGRAMURL: 'miniprogramUrl'
}

const DOWNLOAD_INFO_MAP = {
  [ThemeGroupTypes.NORMAL]: [{ name: '正常', scale: 2 }],
  [ThemeGroupTypes.MODAL]: [
    { name: '534 * 712', scale: 2 },
    { name: '884 * 1178', scale: [884 / 267, 1178 / 356] }
  ],
  [ThemeGroupTypes.BRAND_BANNER]: [
    { name: '710 * 200', scale: 2 },
    { name: '678 * 190', scale: [678 / 355, 190 / 100] }
  ]
}

let __screenshotCounter = 0

class App extends React.Component {
  _iframes = {}
  state = {
    LinkInfoList: [],
    // 小程序项目专用，顶部tab栏的选中判定
    activeTab: 'miniProgram',
    miniProgramLink: [
      { name: '小程序ID', key: Links.MINIPROGRAMID, open: false },
      { name: '小程序基础路径', key: Links.MINIPROGRAMURL, open: false },
      { name: 'JSON链接', key: Links.JSONURL, open: true }
    ],
    h5Link: [
      { name: '长链接', key: Links.NORMAL, open: true },
      { name: '短链接', key: Links.SHORT, open: true }
    ],
    qualityCheckResult: null,
    onlineUrl: ''
  }

  _handleDownloadAll = async () => {
    const { pages, themeGroupType = ThemeGroupTypes.NORMAL, name } = this.props
    const themeGroupTypeKey = themeGroupType || ThemeGroupTypes.NORMAL
    const downloadInfo = DOWNLOAD_INFO_MAP[themeGroupTypeKey]

    try {
      const screenshotInfoList = flatten(
        pages.map((_, index) =>
          downloadInfo.map((info) => ({ ...info, index }))
        )
      )
      const urlWithIndexList = await Promise.all(
        screenshotInfoList.map(({ index, scale }) => {
          return this._screenshotPage(index, scale).then(([url]) => ({
            index,
            url
          }))
        })
      )
      await Promise.all(
        urlWithIndexList.map(
          async ({ index, url }) =>
            (await DownloadUtils.downloadLink(url, pages[index].name)) || name // 一个一个下，避免浏览器限流问题
        )
      )
      toastSuccess('下载完成')
    } catch (err) {
      toastError('下载失败')
    }
  }

  _screenshotPage = (index, scale) => {
    let screenshotId = __screenshotCounter++
    return new Promise((resolve) => {
      const screenshotHandler = (event) => {
        const { action, payload } = event.data
        if (payload.screenshotId !== screenshotId) {
          return
        }
        switch (action) {
          case ActionKeys.SCREENSHOT_RESULT:
            god.removeEventListener('message', screenshotHandler)
            resolve(payload.images)
            break
          default:
            break
        }
      }
      god.addEventListener('message', screenshotHandler)
      this._iframes[index] &&
        this._iframes[index].contentWindow.postMessage(
          { action: ActionKeys.SCREENSHOT, payload: { scale, screenshotId } },
          '*' // TODO Move this to config
        )
    })
  }

  _handleDownload = async (index, scale) => {
    const { pages, name } = this.props
    try {
      const dataUrls = await this._screenshotPage(index, scale)
      await Promise.all(
        dataUrls.map((url) =>
          DownloadUtils.downloadLink(url, pages[index].name || name)
        )
      )
      toastSuccess('下载完成')
    } catch (err) {
      toastError('下载失败')
    }
  }

  _handleTextCopy = async (key) => {
    try {
      const { onlineUrl } = this.state
      const text = key == 'normalLink' ? onlineUrl : this.props[key]
      await ClipboardUtils.copyTextToClipboard(text)
      toastSuccess('已复制到剪贴板')
    } catch (err) {
      toastError(err.message)
    }
  }
  _handleEditCenter = () => {
    const {
      projectId,
      config: { EDIT_PATH },
      project
    } = this.props
    let path = `/editor/${projectId}`
    if (EDIT_PATH && typeof EDIT_PATH == 'function') {
      path = EDIT_PATH(project._id, project)
    }
    god.location.replace(path)
  }

  _handleOpenNewTab = (key) => {
    const { onlineUrl } = this.state
    const url = key == 'normalLink' ? onlineUrl : this.props[key]
    god.open(url)
  }
  UNSAFE_componentWillMount = async () => {
    const { normalLink, project } = this.props
    let { currentUrl } = await getOnlineUrl(normalLink, project)
    let LinkInfoList = []
    if (this.props.componentPlat === 'miniProgram')
      LinkInfoList = this.state.miniProgramLink
    else LinkInfoList = this.state.h5Link
    this.setState({
      onlineUrl: currentUrl,
      LinkInfoList
    })
  }

  render() {
    const {
      themeGroupType = ThemeGroupTypes.NORMAL,
      name,
      pages,
      componentPlat, // 判断项目类型
      minicodeUrl
    } = this.props
    const { onlineUrl, LinkInfoList } = this.state
    const themeGroupTypeKey = themeGroupType || ThemeGroupTypes.NORMAL
    let { env } = QueryString.parse(location.search)

    return (
      <div className="publish-page">
        <HENavbar
          backFunc={() => {
            location.href = '/projects/my'
          }}
        />
        <div className="publish-page__content">
          {/* 小程序部分展示tab*/}
          {componentPlat === 'miniProgram' && (
            <div style={{ width: '100%', 'background-color': '#fff' }}>
              <div className="publish-page__tab">
                <div
                  onClick={() => {
                    this.setState({
                      activeTab: 'miniProgram',
                      LinkInfoList: this.state.miniProgramLink
                    })
                  }}
                  className={
                    this.state.activeTab === 'miniProgram' ? 'active' : ''
                  }
                >
                  小程序
                </div>
                <div
                  onClick={() => {
                    this.setState({
                      activeTab: 'h5',
                      LinkInfoList: this.state.h5Link
                    })
                  }}
                  className={this.state.activeTab === 'h5' ? 'active' : ''}
                >
                  H5
                </div>
              </div>
            </div>
          )}
          <HEPaper horizontal={true} className="publish-page__content__header">
            {/* 二维码部分*/}
            <div className="publish-page__content__header__qrcode-container">
              {/* 若为小程序，要区分tab展示*/}
              {minicodeUrl && this.state.activeTab === 'miniProgram' ? (
                <QRCode
                  value={minicodeUrl}
                  size={100}
                  imageSettings={{
                    src: MiniLogo,
                    x: null,
                    y: null,
                    height: 20,
                    width: 20
                  }}
                />
              ) : (
                <QRCode value={onlineUrl} size={100} />
              )}
            </div>
            {/* 输入框按钮部分*/}
            <div className="publish-page__content__header__inputs">
              {LinkInfoList.map((info) => (
                <div
                  key={info.key}
                  className="publish-page__content__header__inputs__row"
                >
                  <label className="label">
                    {info.name}
                    {env === 'online_test' && info.key !== Links.MINIPROGRAMID
                      ? '(测试)'
                      : ''}
                    ：
                  </label>
                  <HEInput
                    className="publish-page__content__header__inputs__row__input"
                    value={
                      info.key == 'normalLink'
                        ? onlineUrl
                        : this.props[info.key]
                        ? this.props[info.key]
                        : info.key
                    }
                  />
                  <HEButton
                    className="publish-page__content__header__inputs__row__button"
                    sizeType={HEButtonSizes.SMALL}
                    onClick={() => this._handleTextCopy(info.key)}
                  >
                    {'复制'}
                  </HEButton>
                  <HEButton
                    className="publish-page__content__header__inputs__row__button"
                    sizeType={HEButtonSizes.SMALL}
                    onClick={() => this._handleEditCenter()}
                  >
                    {'继续编辑'}
                  </HEButton>
                  {info.open && (
                    <HEButton
                      className="publish-page__content__header__inputs__row__button"
                      sizeType={HEButtonSizes.SMALL}
                      onClick={() => this._handleOpenNewTab(info.key)}
                    >
                      {'新页面打开'}
                    </HEButton>
                  )}
                </div>
              ))}
            </div>
          </HEPaper>
          {/* 中部页面展示区*/}
          <div className="publish-page__content__page-cards">
            {pages.map((page, pageIndex) => {
              return (
                <HECard
                  key={page.url}
                  disableFloat={false}
                  className="publish-page__content__page-cards__page"
                >
                  <HECardContent className="publish-page__content__page-cards__page__content">
                    <HEFrame className="publish-page__content__page-cards__page__content__poster-frame">
                      <iframe
                        ref={(el) => {
                          this._iframes[pageIndex] = el
                        }}
                        className="publish-page__content__page-cards__page__content__poster-frame__frame"
                        src={page.url}
                      />
                    </HEFrame>
                    <div className="publish-page__content__page-cards__page__content__descriptions">
                      <h1 className="publish-page__content__page-cards__page__content__descriptions__title">
                        {page.name}
                      </h1>
                      <h1 className="publish-page__content__page-cards__page__content__descriptions__subtitle">
                        {name}
                      </h1>
                      <div className="publish-page__content__page-cards__page__content__descriptions__actions">
                        {DOWNLOAD_INFO_MAP[themeGroupTypeKey].map((info) => (
                          <p
                            key={info.name}
                            className="publish-page__content__page-cards__page__content__descriptions__actions__row"
                          >
                            <span>{'图片尺寸'}：</span> {info.name}
                            {/* TODO: 暂时去掉下载入口 */}
                            {false && <HEButton
                              sizeType={HEButtonSizes.SMALL}
                              outline={true}
                              onClick={() =>
                                this._handleDownload(pageIndex, info.scale)
                              }
                            >
                              {'下载'}
                            </HEButton>}
                          </p>
                        ))}
                      </div>
                    </div>
                  </HECardContent>
                </HECard>
              )
            })}
          </div>
          {/* 底部二维码*/}
          <div className="publish-page__content__footer">
            <p>
              {'知音楼问题反馈群'}
              {'\n'}
              {'欢迎交流'}
            </p>
            <HEFrame className="publish-page__content__footer__qrcode-frame">
              <img src={ReviewGroupQRCode} />
            </HEFrame>
          </div>
        </div>
      </div>
    )
  }
}

export default connectToast(App)
