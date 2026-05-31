const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 初始化数据
const initData = {
  plants: [
    {
      name: "桃花",
      type: "flower",
      icon: "/images/plants/peach.png",
      suitableSolarTerms: ["立春", "雨水"],
      growTime: 72,
      price: 20,
      sellPrice: 80,
      description: "桃花是春天的使者，花语是爱情的俘虏。桃花原产于中国，已有3000多年的栽培历史。",
      plantingGuide: [
        "选种：选择饱满、无病虫害的种子",
        "播种：春季3-4月播种，土壤要疏松肥沃",
        "浇水：保持土壤湿润，但不要积水",
        "施肥：生长期每月施一次有机肥",
        "修剪：花后及时修剪，促进新枝生长"
      ],
      pestControl: "注意防治蚜虫和红蜘蛛，可用肥皂水喷洒",
      farmingAdvice: "立春播种，雨水移栽，春分修剪，谷雨施肥"
    },
    {
      name: "西瓜",
      type: "fruit",
      icon: "/images/plants/watermelon.png",
      suitableSolarTerms: ["立夏", "小满"],
      growTime: 96,
      price: 30,
      sellPrice: 120,
      description: "西瓜是夏日消暑佳品，含有丰富的水分和维生素。原产于非洲，后传入中国。",
      plantingGuide: [
        "选种：选择抗病性强的品种",
        "播种：夏季5-6月播种，需要充足阳光",
        "浇水：保持充足水分，果实膨大期需水量大",
        "施肥：基肥要足，追肥要及时",
        "整枝：保留主蔓和2-3条侧蔓，摘除多余侧枝"
      ],
      pestControl: "注意防治白粉病和蚜虫，可用多菌灵喷洒",
      farmingAdvice: "立夏播种，小满移栽，芒种整枝，夏至收获"
    },
    {
      name: "菊花",
      type: "flower",
      icon: "/images/plants/chrysanthemum.png",
      suitableSolarTerms: ["白露", "秋分"],
      growTime: 60,
      price: 25,
      sellPrice: 100,
      description: "秋天的代表花卉，象征着高洁和长寿。菊花品种繁多，色彩丰富。",
      plantingGuide: [
        "选种：选择适合当地气候的品种",
        "播种：秋季9-10月播种",
        "浇水：控制浇水量，避免积水",
        "施肥：生长期每两周施一次稀薄液肥",
        "摘心：适时摘心促进分枝"
      ],
      pestControl: "注意防治蚜虫和叶斑病，可用多菌灵喷洒",
      farmingAdvice: "白露播种，秋分移栽，寒露施肥，霜降观赏"
    },
    {
      name: "菠菜",
      type: "vegetable",
      icon: "/images/plants/spinach.png",
      suitableSolarTerms: ["雨水", "惊蛰"],
      growTime: 48,
      price: 15,
      sellPrice: 50,
      description: "菠菜营养丰富，含有丰富的铁质和维生素。耐寒性强，是春季常见蔬菜。",
      plantingGuide: [
        "选种：选择耐寒性强的品种",
        "播种：早春或秋季播种",
        "浇水：保持土壤湿润",
        "施肥：基肥充足，追肥2-3次",
        "采收：叶片长大后及时采收"
      ],
      pestControl: "注意防治霜霉病和蚜虫",
      farmingAdvice: "雨水播种，惊蛰出苗，春分间苗，清明采收"
    },
    {
      name: "桂花",
      type: "flower",
      icon: "/images/plants/osmanthus.png",
      suitableSolarTerms: ["秋分", "寒露"],
      growTime: 84,
      price: 40,
      sellPrice: 150,
      description: "桂花香气浓郁，是中国传统名花。桂花可制作桂花茶、桂花糕等美食。",
      plantingGuide: [
        "选种：选择花香浓郁的品种",
        "播种：秋季播种或春季移栽",
        "浇水：保持土壤湿润，忌积水",
        "施肥：春季施氮肥，秋季施磷钾肥",
        "修剪：花后修剪整形"
      ],
      pestControl: "注意防治红蜘蛛和介壳虫",
      farmingAdvice: "秋分播种，寒露移栽，立冬施肥，冬至养护"
    }
  ],
  diseases: [
    {
      name: "蚜虫",
      icon: "/images/diseases/aphid.png",
      symptom: "叶片卷曲，背面有绿色小虫",
      correctCure: "喷肥皂水",
      wrongCure1: "多浇水",
      wrongCure2: "晒太阳",
      knowledge: "蚜虫可用湿布擦掉或喷洒肥皂水，也可以用大蒜水驱赶。预防方法是保持通风，及时清除杂草。",
      affectedPlants: ["flower", "fruit", "vegetable"]
    },
    {
      name: "红蜘蛛",
      icon: "/images/diseases/spidermite.png",
      symptom: "叶片发黄，背面有细丝",
      correctCure: "增加湿度喷水",
      wrongCure1: "多施肥",
      wrongCure2: "暴晒",
      knowledge: "红蜘蛛喜干燥，增加湿度可抑制。可用湿布擦拭叶片，严重时使用杀螨剂。",
      affectedPlants: ["flower", "fruit"]
    },
    {
      name: "白粉病",
      icon: "/images/diseases/powdery.png",
      symptom: "叶片有白色粉末",
      correctCure: "改善通风，摘除病叶",
      wrongCure1: "多浇水",
      wrongCure2: "施氮肥",
      knowledge: "白粉病可用多菌灵喷洒，注意改善通风条件。预防方法是避免叶片长期潮湿。",
      affectedPlants: ["flower", "vegetable"]
    },
    {
      name: "烂根",
      icon: "/images/diseases/rootrot.png",
      symptom: "植株萎蔫，根部发黑",
      correctCure: "停止浇水，换土",
      wrongCure1: "继续浇水",
      wrongCure2: "施肥",
      knowledge: "烂根通常由浇水过多引起，需修剪烂根并更换土壤。预防方法是控制浇水量，确保排水良好。",
      affectedPlants: ["flower", "fruit", "vegetable"]
    }
  ],
  solarTerms: [
    { name: "立春", month: 2, day: 4, advice: "立春时节，适合播种春菜，准备春耕", farmingActivities: ["播种", "整地", "施肥"] },
    { name: "雨水", month: 2, day: 19, advice: "雨水增多，注意排水防涝，可种植菠菜", farmingActivities: ["移栽", "浇水", "防涝"] },
    { name: "惊蛰", month: 3, day: 5, advice: "春雷响动，害虫开始活动，注意防治", farmingActivities: ["播种", "防虫", "施肥"] },
    { name: "春分", month: 3, day: 21, advice: "昼夜平分，适合种植番茄、黄瓜等蔬菜", farmingActivities: ["播种", "移栽", "修剪"] },
    { name: "清明", month: 4, day: 5, advice: "清明时节，适合种植瓜类作物", farmingActivities: ["播种", "踏青", "祭扫"] },
    { name: "谷雨", month: 4, day: 20, advice: "雨生百谷，适合移栽秧苗，种植棉花", farmingActivities: ["移栽", "播种", "灌溉"] },
    { name: "立夏", month: 5, day: 5, advice: "夏季开始，适合种植耐热作物", farmingActivities: ["播种", "遮阴", "浇水"] },
    { name: "小满", month: 5, day: 21, advice: "麦粒渐满，注意防治病虫害", farmingActivities: ["防虫", "施肥", "灌溉"] },
    { name: "芒种", month: 6, day: 6, advice: "麦类等有芒作物成熟，及时收获", farmingActivities: ["收获", "播种", "整地"] },
    { name: "夏至", month: 6, day: 21, advice: "白昼最长，注意防暑降温", farmingActivities: ["浇水", "遮阴", "防旱"] },
    { name: "小暑", month: 7, day: 7, advice: "天气渐热，加强田间管理", farmingActivities: ["灌溉", "除草", "防虫"] },
    { name: "大暑", month: 7, day: 22, advice: "一年中最热，注意作物防晒", farmingActivities: ["浇水", "遮阴", "通风"] },
    { name: "立秋", month: 8, day: 7, advice: "秋季开始，准备秋收", farmingActivities: ["收获", "播种", "整地"] },
    { name: "处暑", month: 8, day: 23, advice: "暑气渐消，适合种植秋菜", farmingActivities: ["播种", "施肥", "灌溉"] },
    { name: "白露", month: 9, day: 7, advice: "天气转凉，注意保温", farmingActivities: ["播种", "保温", "防霜"] },
    { name: "秋分", month: 9, day: 23, advice: "昼夜平分，秋收大忙季节", farmingActivities: ["收获", "晾晒", "储存"] },
    { name: "寒露", month: 10, day: 8, advice: "气温下降，注意防寒", farmingActivities: ["收获", "保温", "防寒"] },
    { name: "霜降", month: 10, day: 23, advice: "初霜出现，及时收获作物", farmingActivities: ["收获", "防冻", "整地"] },
    { name: "立冬", month: 11, day: 7, advice: "冬季开始，做好越冬准备", farmingActivities: ["收获", "储存", "保温"] },
    { name: "小雪", month: 11, day: 22, advice: "开始降雪，保护越冬作物", farmingActivities: ["保温", "防寒", "修整"] },
    { name: "大雪", month: 12, day: 7, advice: "降雪增多，注意温室管理", farmingActivities: ["温室管理", "保温", "除雪"] },
    { name: "冬至", month: 12, day: 22, advice: "白昼最短，注意温室采光", farmingActivities: ["补光", "保温", "施肥"] },
    { name: "小寒", month: 1, day: 6, advice: "天气寒冷，加强保温措施", farmingActivities: ["保温", "防寒", "修整"] },
    { name: "大寒", month: 1, day: 20, advice: "一年中最冷，做好春耕准备", farmingActivities: ["准备", "修整", "计划"] }
  ]
}

exports.main = async (event, context) => {
  const db = cloud.database()
  const { type } = event
  
  try {
    // 如果需要清空并重新初始化
    if (type === 'reset') {
      // 清空现有数据
      const collections = ['plants', 'diseases', 'solarTerms']
      for (const coll of collections) {
        const res = await db.collection(coll).get()
        for (const doc of res.data) {
          await db.collection(coll).doc(doc._id).remove()
        }
      }
    }

    // 导入植物数据
    let plantCount = 0
    for (const plant of initData.plants) {
      // 检查是否已存在
      const exist = await db.collection('plants').where({ name: plant.name }).get()
      if (exist.data.length === 0) {
        await db.collection('plants').add({ data: plant })
        plantCount++
      }
    }

    // 导入病虫害数据
    let diseaseCount = 0
    for (const disease of initData.diseases) {
      const exist = await db.collection('diseases').where({ name: disease.name }).get()
      if (exist.data.length === 0) {
        await db.collection('diseases').add({ data: disease })
        diseaseCount++
      }
    }

    // 导入节气数据
    let termCount = 0
    for (const term of initData.solarTerms) {
      const exist = await db.collection('solarTerms').where({ name: term.name }).get()
      if (exist.data.length === 0) {
        await db.collection('solarTerms').add({ data: term })
        termCount++
      }
    }

    return {
      success: true,
      message: '数据初始化成功',
      data: {
        plants: plantCount,
        diseases: diseaseCount,
        solarTerms: termCount
      }
    }

  } catch (error) {
    console.error('初始化失败', error)
    return {
      success: false,
      message: '初始化失败：' + error.message,
      error: error
    }
  }
}
