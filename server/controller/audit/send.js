const app = global.app
const message = app.utils.message

// 知音楼消息审核处理.
module.exports.get = async function (ctx) {
  await message.sendNoticeMessage({
    userId: 'w_shenchao',
    info: 'dfdsafads',
    themeId: '626b467614616ab76f932050',
    ruleId: '',
    workcode: 'W000717'
  })
  ctx.data({ ok: 'dsfads' })
}

module.exports.auth = true
