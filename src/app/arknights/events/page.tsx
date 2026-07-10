import type { Metadata } from "next";
import { StaticPage } from "@/lib/static-page";

export const metadata: Metadata = {
  title: "活动记录",
  description: "明日方舟活动记录、关卡心得和奖励兑换清单。",
};

export default function EventsPage() {
  return (
    <StaticPage
      contentFile="pages/events.html"
      stylesheet="/arknights/css/styles.css"
      script="/arknights/js/main.js"
    />
  );
}
