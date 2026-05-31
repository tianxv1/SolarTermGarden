// 节气花园 - 图片加载管理模块

// 图片缓存对象
const imageCache = {};

// 加载失败的图片缓存（避免重复尝试加载）
const failedImages = new Set();

// 图片加载函数
function loadImage(src, callback) {
  // 如果图片已经加载成功，直接返回
  if (imageCache[src]) {
    callback(imageCache[src]);
    return;
  }
  
  // 如果图片已经加载失败过，不再尝试加载
  if (failedImages.has(src)) {
    callback(null);
    return;
  }
  
  const img = wx.createImage();
  img.onload = () => {
    imageCache[src] = img;
    callback(img);
  };
  img.onerror = () => {
    console.log(`图片加载失败: ${src}`);
    // 记录失败状态，避免重复加载
    failedImages.add(src);
    callback(null);
  };
  img.src = src;
}

// 批量加载图片
function loadImages(imageList, callback) {
  let loaded = 0;
  const total = imageList.length;
  
  imageList.forEach(src => {
    loadImage(src, () => {
      loaded++;
      if (loaded === total) {
        callback();
      }
    });
  });
}

// 获取图片缓存
function getImage(src) {
  return imageCache[src];
}

// 清除图片缓存
function clearImageCache() {
  Object.keys(imageCache).forEach(key => {
    delete imageCache[key];
  });
  // 同时清空失败图片记录
  failedImages.clear();
}

// 预加载常用图片
function preloadCommonImages() {
  const commonImages = [
    'images/background.png',
    'images/plant_peach.png',
    'images/plant_watermelon.png',
    'images/plant_chrysanthemum.png',
    'images/plant_spinach.png',
    'images/plant_lotus.png',
    'images/plant_seedling.png',
    'images/default-avatar.png',
    'images/pet_cat.png',
    'images/pet_dog.png',
    'images/pet_owl.png',
    'images/btn_plant.png',
    'images/btn_water.png',
    'images/btn_fertilize.png',
    'images/btn_handbook.png',
    'images/btn_battle.png',
    'images/petal.png',
    'images/footprint.png',
    'images/crow.png',
    'images/icon_heart.png',
    'images/plants/peach.png',
    'images/plants/watermelon.png',
    'images/plants/chrysanthemum.png',
    'images/plants/spinach.png',
    'images/plants/lotus.png',
    'images/plants/osmanthus.png',
    'images/diseases/aphid.png',
    'images/diseases/spidermite.png',
    'images/diseases/powdery.png',
    'images/diseases/rootrot.png'
  ];
  
  loadImages(commonImages, () => {
    console.log('常用图片预加载完成');
  });
}

module.exports = {
  loadImage,
  loadImages,
  getImage,
  clearImageCache,
  preloadCommonImages
};
