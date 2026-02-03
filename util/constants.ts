export const items = [
  {
    name: "Super Greens",
    code: "V1",
    cookTime: "1 min",
    kitchenName: "Greens",
    batchServings: { 1: 2.74, 2: 5.48, 3: 8.22 }
  },
  {
    name: "Honey Sesame Chicken",
    code: "CB3",
    cookTime: "2 mins 30 secs",
    kitchenName: "Sesame",
    batchServings: { 1: 4.53, 2: 9.06, 3: 13.59 }
  },
  {
    name: "Black Pepper Steak",
    code: "B3",
    cookTime: "1 min 30 secs",
    kitchenName: "Stek",
    batchServings: { 1: 4.35, 2: 8.7, 3: 13.05 }
  },
  {
    name: "Honey Walnut Shrimp",
    code: "F4",
    cookTime: "3 mins",
    kitchenName: "HWS",
    batchServings: { 1: 4.1, 2: 8.2, 3: 12.3 }
  },
  {
    name: "Beijing Beef",
    code: "B5",
    cookTime: "5 mins",
    kitchenName: "BJIN",
    batchServings: { 1: 3.57, 2: 7.14, 3: 10.71 }
  },
  {
    name: "Mushroom Chicken",
    code: "C2",
    cookTime: "1 min 15 secs",
    kitchenName: "MUSH",
    batchServings: { 1: 4.39, 2: 8.78, 3: 13.17 }
  },
  {
    name: "Broccoli Beef",
    code: "B1",
    cookTime: "45 secs",
    kitchenName: "Brocc",
    batchServings: { 1: 6.18, 2: 12.36, 3: 18.54 }
  },
  {
    name: "Orange Chicken",
    code: "C1",
    cookTime: "7 mins",
    kitchenName: "ORG",
    batchServings: { 1: 11.32, 2: 22.64, 3: 33.96 }
  },
  {
    name: "Kung Pao Chicken",
    code: "C3",
    cookTime: "1 min 15 secs",
    kitchenName: "KPC",
    batchServings: { 1: 4.9, 2: 9.8, 3: 14.7 }
  },
  {
    name: "String Bean Chicken",
    code: "CB1",
    cookTime: "45 secs",
    kitchenName: "SBC",
    batchServings: { 1: 3.57, 2: 7.14, 3: 10.71 }
  },
  {
    name: "Eggplant Tofu",
    code: "V2",
    cookTime: "",
    kitchenName: "Tofu",
    batchServings: { 1: 5, 2: 10, 3: 15 }
  },
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