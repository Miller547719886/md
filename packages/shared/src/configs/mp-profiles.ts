/**
 * 微信公众号预设配置
 */

export interface MpProfile {
  /** 公众号 ID */
  id: string
  /** 公众号名称 */
  name: string
  /** 公众号 Logo URL */
  logo: string
  /** 公众号描述 */
  desc: string
}

/**
 * 预设的公众号配置列表
 */
export const presetMpProfiles: MpProfile[] = [
  {
    id: `MzkxNTY5NDczNQ==`,
    name: `生涯重塑`,
    logo: `http://mmbiz.qpic.cn/sz_mmbiz_png/VCeVZBUIkj4gDWbP82CPzL10k4ImxylltWXTUGqBibiarpIoJicJFicNKLgylgfoU81XDs01hkMO0wia4k5XVs2mUicQ/0?wx_fmt=png`,
    desc: `发布华中师范大学心理学院王忠军教授课题组最新动态，分享和传播国内外工作与生涯重塑、生涯心理咨询与辅导、自我与组织职业生涯管理、工作压力管理与职业心理健康、管理心理学与人力资源管理领域的研究进展、科学知识和实践方法。`,
  },
  {
    id: `MzIxNjA5ODQ0OQ==`,
    name: `Doocs`,
    logo: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png`,
    desc: `GitHub 开源组织 @Doocs 旗下唯一公众号，专注分享技术领域相关知识及行业最新资讯。`,
  },
]

/**
 * 获取默认的公众号配置
 */
export function getDefaultMpProfile(): MpProfile {
  return presetMpProfiles[0] // 默认返回生涯重塑公众号
}
