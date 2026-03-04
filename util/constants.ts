export const items = [
  {
    name: "Super Greens",
    code: "V1",
    cookTime: "1 min",
    kitchenName: "Greens",
    chineseName: "杂菜",
    batchServings: { 1: 2.74, 2: 5.48, 3: 8.22 }
  },
  {
    name: "Honey Sesame Chicken",
    code: "CB3",
    cookTime: "2 mins 30 secs",
    kitchenName: "Sesame",
    chineseName: "芝麻鸡",
    batchServings: { 1: 4.53, 2: 9.06, 3: 13.59 }
  },
  {
    name: "Black Pepper Steak",
    code: "B3",
    cookTime: "1 min 30 secs",
    kitchenName: "Stek",
    chineseName: "牛扒",
    batchServings: { 1: 4.35, 2: 8.7, 3: 13.05 }
  },
  {
    name: "Honey Walnut Shrimp",
    code: "F4",
    cookTime: "3 mins",
    kitchenName: "HWS",
    chineseName: "虾",
    batchServings: { 1: 4.1, 2: 8.2, 3: 12.3 }
  },
  {
    name: "New Item",
    code: "NEW",
    cookTime: "6 mins",
    kitchenName: "NW",
    chineseName: "新品",
    batchServings: { 1: 4.1, 2: 8.2, 3: 12.3 }
  },
  {
    name: "Beijing Beef",
    code: "B5",
    cookTime: "5 mins",
    kitchenName: "BJIN",
    chineseName: "北京牛",
    batchServings: { 1: 3.57, 2: 7.14, 3: 10.71 }
  },
  {
    name: "Mushroom Chicken",
    code: "C2",
    cookTime: "1 min 15 secs",
    kitchenName: "MUSH",
    chineseName: "蘑菇鸡",
    batchServings: { 1: 4.39, 2: 8.78, 3: 13.17 }
  },
  {
    name: "Broccoli Beef",
    code: "B1",
    cookTime: "45 secs",
    kitchenName: "Brocc",
    chineseName: "西兰牛",
    batchServings: { 1: 6.18, 2: 12.36, 3: 18.54 }
  },
  {
    name: "Orange Chicken",
    code: "C1",
    cookTime: "7 mins",
    kitchenName: "ORG",
    chineseName: "橙鸡",
    batchServings: { 1: 11.32, 2: 22.64, 3: 33.96 }
  },
  {
    name: "Kung Pao Chicken",
    code: "C3",
    cookTime: "1 min 15 secs",
    kitchenName: "KPC",
    chineseName: "宫保",
    batchServings: { 1: 4.9, 2: 9.8, 3: 14.7 }
  },
  {
    name: "String Bean Chicken",
    code: "CB1",
    cookTime: "45 secs",
    kitchenName: "SBC",
    chineseName: "豆仔鸡",
    batchServings: { 1: 3.57, 2: 7.14, 3: 10.71 }
  },
  {
    name: "Eggplant Tofu",
    code: "V2",
    cookTime: "",
    kitchenName: "Tofu",
    chineseName: "豆腐",
    batchServings: { 1: 5, 2: 10, 3: 15 }
  },
  // {
  //   name: "Veggie Spring Rolls",
  //   code: "E1",
  //   cookTime: "",
  //   kitchenName: "",
  //   chineseName: "春卷",
  //   batchServings: { 1: 5, 2: 10, 3: 15 }
  // },
  // {
  //   name: "Chicken Egg Rolls",
  //   code: "E2",
  //   cookTime: "",
  //   kitchenName: "",
  //   chineseName: "鸡卷",
  //   batchServings: { 1: 5, 2: 10, 3: 15 }
  // },
  // {
  //   name: "Cheese Rangoons",
  //   code: "E3",
  //   cookTime: "",
  //   kitchenName: "",
  //   chineseName: "芝士角",
  //   batchServings: { 1: 5, 2: 10, 3: 15 }
  // },
  // {
  //   name: "Teriyaki Chicken",
  //   code: "C4",
  //   cookTime: "10 mins",
  //   batchServings: { 1: 6.5, 2: 13, 3: 19.5 }
  // }
];

export type ItemViewType = typeof items[0];

export function getFormattedDate() {
  const date = new Date();
  // 'en-CA' produces YYYY-MM-DD; we just strip the dashes
  return new Intl.DateTimeFormat("en-CA").format(date).replace(/-/g, "");
}