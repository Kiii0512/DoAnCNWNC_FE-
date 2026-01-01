// Utility to clear localStorage - run this in browser console if you see "undefined" values
(function() {
  // Check if any localStorage values are the literal string "undefined"
  let needsClear = false;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    if (value === "undefined" || value === "null") {
      console.log(`Found bad value: ${key} = "${value}"`);
      needsClear = true;
    }
  }
  
  if (needsClear) {
    console.log("Clearing localStorage...");
    localStorage.clear();
    console.log("localStorage cleared. Please re-login.");
    alert("Đã xóa dữ liệu localStorage không hợp lệ. Vui lòng đăng nhập lại!");
  } else {
    console.log("No bad values found in localStorage.");
  }
})();

