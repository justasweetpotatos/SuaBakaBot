const dict = require(`./src/assets/noituTiengVietDictionaryCache.json`);
let cache = {}; //require(`./src/events/noichu/noituTiengVietDictionaryCache.json`);

let counter = 0;

for (const key in dict) {
  if (Object.hasOwnProperty.call(dict, key)) {
    const element = dict[key];
    if (!(key.split(" ").length < 1)) {
      if (cache[key.split(" ")[0].toLowerCase()]) {
        if (!cache[key.split(" ")[0].toLowerCase()][key]) {
          cache[key.split(" ")[0].toLowerCase()][key] = { source: element.sounce };
        }
      } else {
        cache[key.split(" ")[0].toLowerCase()] = {};
      }
    }
  }
  counter += 1;
}

const fs = require("fs");

// // // Đường dẫn đến tệp JSON
// // const filePath = "data.json";

// // // Đọc dữ liệu từ tệp JSON
// // let data = {};
// // try {
// //   data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
// // } catch (error) {
// //   console.error("Không thể đọc tệp JSON:", error);
// // }

// // // Thêm hoặc cập nhật dữ liệu
// // data.newKey = "newValue";

// // Ghi dữ liệu mới vào tệp JSON

const filePath = `./src/assets/noituTiengVietDictionaryCache.json`;
try {
  fs.writeFileSync(filePath, JSON.stringify(cache, null, 2));
  console.log("Dữ liệu đã được ghi vào tệp JSON thành công.");
} catch (error) {
  console.error("Không thể ghi vào tệp JSON:", error);
}
