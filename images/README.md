# 节气花园 - 图片素材说明

## 所需图片素材

请将以下图片素材放置在项目的 `images/` 目录下：

### 1. 植物图标
- `plant_peach.png` - 桃花（成熟状态）
- `plant_watermelon.png` - 西瓜（成熟状态）
- `plant_chrysanthemum.png` - 菊花（成熟状态）
- `plant_spinach.png` - 菠菜（成熟状态）
- `plant_lotus.png` - 荷花（成熟状态）
- `plant_seedling.png` - 幼苗（所有植物的幼苗阶段）

### 2. 宠物图标
- `pet_cat.png` - 猫咪
- `pet_dog.png` - 狗狗
- `pet_owl.png` - 猫头鹰
- `icon_heart.png` - 爱心（亲密度图标）

### 3. UI按钮
- `btn_plant.png` - 种植按钮
- `btn_water.png` - 浇水按钮
- `btn_fertilize.png` - 施肥按钮
- `btn_handbook.png` - 图鉴按钮
- `btn_battle.png` - 挑战赛按钮

### 4. 装饰元素
- `petal.png` - 花瓣（背景飘落动画）
- `footprint.png` - 脚印（宠物走动后留下）
- `crow.png` - 乌鸦（乌鸦袭击警示）

### 5. 音效文件
请将以下音效文件放置在 `assets/audio/` 目录下：
- `click.mp3` - 点击按钮音效
- `water.mp3` - 浇水音效
- `coin.mp3` - 收获作物音效
- `crow.mp3` - 乌鸦袭击音效
- `magic.mp3` - 施肥音效
- `bgm.mp3` - 背景音乐
- `cat.mp3` - 猫咪叫声
- `dog.mp3` - 狗狗叫声
- `owl.mp3` - 猫头鹰叫声

## 图片尺寸建议
- 植物图标：64x64 像素
- 宠物图标：64x64 像素
- 按钮图标：32x32 像素
- 装饰元素：
  - 花瓣：20x20 像素
  - 脚印：16x16 像素
  - 乌鸦：32x32 像素

## 注意事项
1. 所有图片建议使用透明背景的PNG格式
2. 图片命名必须与上述文件名完全一致
3. 音效文件建议使用MP3格式，文件大小控制在100KB以内
4. 如果某些图片缺失，游戏会自动使用emoji作为备选

## 加载机制
- 游戏会在启动时预加载所有常用图片
- 图片会被缓存到内存中，避免重复加载
- 图片加载失败时会使用备选方案（emoji或Canvas绘制）