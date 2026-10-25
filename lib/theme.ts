export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Script chạy đồng bộ trong `<head>` trước lần vẽ đầu tiên, đặt `data-theme` trên `<html>` theo lựa
 * chọn đã lưu, chưa lưu thì theo hệ điều hành (và đổi theo khi hệ điều hành đổi). Nhờ vậy trang
 * không nháy sáng rồi mới tối khi tải lại.
 */
export const THEME_SCRIPT = `(function(){try{var r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");function a(){var t=localStorage.getItem("${THEME_STORAGE_KEY}");r.dataset.theme=t==="light"||t==="dark"?t:m.matches?"dark":"light"}a();m.addEventListener("change",a)}catch(e){}})()`;
