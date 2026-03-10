import { observable } from 'mobx'
import uid from 'uid'
import history from 'common/record'
import Page from '../clazz/Page'
import Layer from '../clazz/Layer'
import Widget from '../clazz/Widget'
import { afterUpdateHook } from 'common/attributeHook'
import { getNewWidgetName } from 'common/utils'

class Stage {
  // 当前组件栈
  @observable component

  //  舞台切换索引，主页面0，其它页面1
  @observable type
  constructor(component, type) {
    this.component = component || {}
    this.type = type
    this.list =
      this.component.pages ||
      this.component.widgets ||
      this.component.layers ||
      []
  }

  /**
   * 创建子节点
   *
   * @param  {Objecrt} data 数据
   * @return {Object}       子节点
   */
  createChild(data) {
    let me = this
    let settings = Object.assign(data, {
      pageWidth: me.component.width,
      pageHeight: me.component.height,
      width: data.width ? data.width : me.component.width
    })

    let Child
    if (me.type === 'project') {
      Child = Page
    } else if (me.type === 'page' || me.type === 'layer') {
      Child = Widget
    }
    let child = new Child(settings)
    return child
  }

  addChildren(list = [], map) {
    let me = this
    let deleteId = (widget) => {
      delete widget.id
      if (widget.hasLayers && widget.layers.length) {
        widget.layers.forEach((layer) => {
          delete layer.id
          layer.widgets.forEach((widget) => {
            deleteId(widget)
          })
        })
      }
    }
    if (this.type == 'page' || this.type == 'layer') {
      let normalChilds = list.filter((widget) => widget.layout == 'normal')
      let flowChilds = list.filter((widget) => widget.layout == 'flow')
      normalChilds.forEach((widget) => {
        let originId = widget.id
        deleteId(widget)
        let current = me.addChild(widget)

        map && (map[originId] = current)
      })

      flowChilds.forEach((widget) => {
        let originId = widget.id
        deleteId(widget)
        let current = me.addChild(widget)

        map && (map[originId] = current)
      })
    }
    history.record()
  }

  /**
   * 增加组件，可以指定id
   */
  addChild(settings = {}, opts) {
    let me = this
    let result
    let component = me.component
    opts = Object.assign({}, opts)
    if (!opts.id) {
      delete settings.id
    }
    if (this.type == 'project' || this.type == 'widget') {
      let Clazz
      let name
      if (this.type == 'project') {
        Clazz = Page
        name = '页面'
      } else {
        Clazz = Layer
        name = '面板'
        settings.height = component.height
        settings.width = component.width
        settings.parentPath = component.path
      }
      let clazz = new Clazz(settings)
      clazz.name = name + '-' + (this.list.length + 1)
      this.list.push(clazz)
      result = clazz
    } else if (this.type == 'page' || this.type == 'layer') {
      // 重置子组件id
      let children = settings.children || []
      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        child.id = uid(10)
      }
      settings.originName = settings.originName
        ? settings.originName
        : settings.name
      settings.name = getNewWidgetName(
        this.list,
        settings.type,
        settings.originName
      )
      let widget = new Widget(
        Object.assign(settings, {
          pageWidth: this.component.width,
          pageHeight: this.component.height,
          parentPath: this.component.path
        })
      )
      this.list.push(widget)
      afterUpdateHook(widget, 'height', null, 'height')
      result = widget
    }
    history.record()
    return result
  }

  /**
   * 根据Id选择组件
   *
   * @param  {Array} ids ids
   */
  selectChildren(ids, hold) {
    ids = [].concat(ids)
    this.list.map(function (item) {
      if (ids.indexOf(item.id) > -1) {
        if (hold && item.isSelected) {
          item.isSelected = false
        } else {
          item.isSelected = true
        }
      } else {
        if (!hold) {
          item.isSelected = false
        }
      }
    })
  }

  /**
   * 取消选择组件
   */
  unselectChildren() {
    this.list.map(function (item) {
      item.isSelected = false
    })
  }

  /**
   * 获取选中的组件
   */
  getSelectedChildren() {
    return this.list.filter(function (item) {
      return item.isSelected
    })
  }

  /**
   * 查询组件
   *
   * @param  {string} id 组件id
   * @return {Child}    组件
   */
  findChildById(id) {
    return this.list.find((item) => {
      return item.id == id
    })
  }

  /**
   * 删除子节点
   *
   * @param  {string} id 组件id
   */
  async removeChild(id) {
    let me = this
    let child = me.findChildById(id)
    let index = me.list.indexOf(child)

    if (index == -1) {
      return
    }
    me.list.splice(index, 1)
    // removeChildren 删除使用forEach一下就执行完毕，afterUpdateHook计算需要等待
    await afterUpdateHook(child, 'height', null, 'height')
    history.record()
  }

  /**
   * 根据Id删除组件
   *
   * @param  {Array} ids ids
   */
  removeChildren(ids = []) {
    let me = this
    ids.forEach(function (id) {
      me.removeChild(id)
      sessionStorage.removeItem(id) // 初始载入组件有可能会添加一个sessionStorage，为了控制载入的高度，这里做个清除
    })
    history.record()
  }

  /**
   * 排序
   *
   * @param  {Array}  pageList 新的组件列表 「误」
   * @param  {Array}  order 新的组件id数组
   * 此处的order应为Array<Page.id> 即 pages.map(i => i.id)
   */
  sortChildren(order) {
    let me = this
    let result = {}
    let list = me.list.slice()
    list.forEach(function (item, index) {
      order.forEach(function (sortItem) {
        if (item.id == sortItem) {
          result[index] = item
        }
      })
    })

    let sorted = order.map((sortItem) => {
      let current
      list.forEach(function (item) {
        if (sortItem == item.id) {
          current = item
        }
      })
      return current
    })

    let i = 0
    for (let index of Object.keys(result)) {
      list[index] = sorted[i]
      i++
    }

    if (me.type == 'project') {
      me.component.pages = list
    } else if (me.type == 'page' || me.type == 'layer') {
      me.component.widgets = list
    } else if (me.type == 'widget') {
      me.component.layers = list
    }

    me.list = list

    history.record()
  }
  changeMovePosition(sourceId, targetId) {
    let list = this.list
    let source = {},
      target = {}
    for (let i = 0; i < list.length; i++) {
      if (sourceId === list[i].id) {
        source.index = i
        source.widget = list[i]
      } else if (targetId === list[i].id) {
        target.index = i
        target.widget = list[i]
      }
    }
    list.splice(source.index, 1, target.widget)
    list.splice(target.index, 1, source.widget)
  }
}

export default Stage
