import React from 'react'
import { Route, HashRouter, Switch, withRouter } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

export default class WithRouter extends React.Component {
  render() {
    const { ANIMATION_MAP, xEditorStore, project, pages } = this.props

    // client/page/project/preview/Project.js:16
    // 判断是否有页面过渡
    const hasPageTransition =
      ANIMATION_MAP.POP !== '' && ANIMATION_MAP.PUSH !== ''

    const Routes = withRouter(({ location }) => (
      <TransitionGroup
        className={'router-wrapper'}
        childFactory={(child) =>
          React.cloneElement(child, {
            classNames: ANIMATION_MAP[xEditorStore.action]
          })
        }
      >
        <CSSTransition
          key={location.pathname}
          timeout={hasPageTransition ? 500 : 0}
          onExit={() => {
            document.body.scrollTop = 0
            document.documentElement.scrollTop = 0
          }}
          onExited={() => {
            if (xEditorStore.action == 'POP') {
              this.props.onBack()
            }
          }}
        >
          <Switch location={location}>
            <Route
              exact
              path="/"
              render={() => {
                xEditorStore.lastPageIndex = 0
                return pages[0]
              }}
            />
            <Route
              path="/:id"
              render={(props) => {
                const pageIndex = project.pages.findIndex((page) => {
                  return page.id === props.match.params.id
                })
                if (pageIndex != -1) {
                  xEditorStore.lastPageIndex = pageIndex
                  return pages[pageIndex]
                } else {
                  return pages[0]
                }
              }}
            />
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    ))
    return (
      <HashRouter>
        <Routes />
      </HashRouter>
    )
  }
}
