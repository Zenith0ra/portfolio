import type { Metadata } from "next";
import { StaticPage } from "@/lib/static-page";

export const metadata: Metadata = {
  title: "作战笔记",
  description: "明日方舟个人作战笔记、肉鸽记录和剧情摘录。",
};

export default function NotesPage() {
  return (
    <StaticPage
      contentFile="pages/notes.html"
      stylesheet="/arknights/css/styles.css"
      script="/arknights/js/main.js"
    />
  );
}
