import type { Category, DashboardMetrics, Post, Profile, User } from "../types/postpilot";

export const mockUser: User = {
  id: "user-1",
  name: "PostPilot Admin",
  email: "admin@postpilot.local",
  role: "Admin",
};

export const mockProfiles: Profile[] = [
  {
    id: "profile-1",
    name: "Vintage Closet BKK",
    shopName: "Vintage Closet BKK",
    description: "Second-hand clothing drops, sizing notes, and weekly outfit sets.",
    connectedPlatforms: ["Facebook", "Instagram"],
    defaultTargets: ["Facebook Page", "Instagram Feed"],
    facebookPageLabel: "Vintage Closet BKK Page",
    instagramBusinessLabel: "@vintageclosetbkk",
  },
  {
    id: "profile-2",
    name: "Plush & Toy Corner",
    shopName: "Plush & Toy Corner",
    description: "Collectible plush toys, restock announcements, and preorder reminders.",
    connectedPlatforms: ["Facebook", "Instagram"],
    defaultTargets: ["Facebook Page", "Instagram Story"],
    facebookPageLabel: "Plush & Toy Corner",
    instagramBusinessLabel: "@plushtoycorner",
  },
  {
    id: "profile-3",
    name: "Handmade Studio",
    shopName: "Handmade Studio",
    description: "Small-batch handmade pieces with product stories and care notes.",
    connectedPlatforms: ["Instagram"],
    defaultTargets: ["Instagram Feed", "Instagram Story"],
    facebookPageLabel: "Not connected yet",
    instagramBusinessLabel: "@handmadestudio",
  },
];

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "เสื้อผ้ามือสอง",
    description: "เสื้อผ้าวินเทจและสินค้ามือสอง พร้อมรายละเอียดไซซ์และสภาพสินค้า.",
    color: "#E9EFEA",
    hashtags: ["#เสื้อผ้ามือสอง", "#vintagebkk"],
    mentions: ["@vintageclosetbkk"],
    captionTemplate: "New drop: [ชื่อสินค้า] ไซซ์ [ไซซ์] สภาพ [สภาพ] ราคา [ราคา] บาท",
  },
  {
    id: "cat-2",
    name: "ตุ๊กตา / ของสะสม",
    description: "ตุ๊กตา ของสะสม และสินค้าลิมิเต็ด พร้อมสถานะพร้อมส่งหรือพรีออเดอร์.",
    color: "#E8EDF3",
    hashtags: ["#ตุ๊กตาสะสม", "#toycollector"],
    mentions: ["@plushtoycorner"],
    captionTemplate: "[ชื่อตุ๊กตา] พร้อมส่งจำนวน [จำนวน] ชิ้น สนใจทักแชทเพื่อจองได้เลย",
  },
  {
    id: "cat-3",
    name: "สินค้า handmade",
    description: "สินค้าแฮนด์เมดล็อตเล็ก พร้อมเรื่องราว วัสดุ และวิธีดูแล.",
    color: "#F1E7DF",
    hashtags: ["#handmade", "#madebyhand"],
    mentions: ["@handmadestudio"],
    captionTemplate: "[ชื่อสินค้า] ทำมือทีละชิ้น ใช้เวลาเตรียม [ระยะเวลา] วัน",
  },
  {
    id: "cat-4",
    name: "โปรโมชั่น",
    description: "โพสต์ส่วนลด เซ็ตสินค้า และโปรส่งฟรีที่ต้องการข้อความชัดเจน.",
    color: "#F4EBDD",
    hashtags: ["#โปรโมชั่น", "#sale"],
    mentions: [],
    captionTemplate: "โปรวันนี้: [รายละเอียดโปร] ถึงวันที่ [วันหมดเขต] เท่านั้น",
  },
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalPosts: 42,
  queuedPosts: 6,
  postedPosts: 31,
  failedPosts: 2,
  queueStatus: "6 posts ready, next post today at 18:00",
  reach: 12840,
  impressions: 19420,
  engagement: 936,
};

export const mockQueuePosts: Post[] = [
  {
    id: "post-1",
    caption: "เสื้อเชิ้ตลินินสีครีม ใส่ง่าย แมตช์กับกางเกงยีนส์ได้เลย พร้อมส่งวันนี้.",
    categoryId: "cat-1",
    targets: ["Facebook Page", "Instagram Feed"],
    status: "Queued",
    scheduledFor: "2026-06-04 18:00",
  },
  {
    id: "post-2",
    caption: "น้องหมีพวงกุญแจล็อตใหม่ กลับมาเติมสต็อกจำนวนจำกัด สนใจทักจองได้เลย.",
    categoryId: "cat-2",
    targets: ["Facebook Page", "Instagram Story"],
    status: "Queued",
    scheduledFor: "2026-06-05 12:30",
  },
  {
    id: "post-3",
    caption: "กระเป๋าผ้าทำมือสีธรรมชาติ รอบนี้มี 8 ใบ ใช้ผ้าคอตตอนหนาและซับในเรียบร้อย.",
    categoryId: "cat-3",
    targets: ["Instagram Feed"],
    status: "Queued",
    scheduledFor: "2026-06-05 19:00",
  },
];

export const mockHistoryPosts: Post[] = [
  {
    id: "history-1",
    caption: "Weekend sale set: buy two selected pieces and get free shipping.",
    categoryId: "cat-4",
    targets: ["Facebook Page"],
    status: "Posted",
    publishedAt: "2026-06-03 12:20",
    externalPostId: "FB-POST-MOCK-1029",
  },
  {
    id: "history-2",
    caption: "เดรสลายดอกโทนอ่อน ไซซ์ M สภาพดี พร้อมส่งจากกรุงเทพ.",
    categoryId: "cat-1",
    targets: ["Facebook Page", "Instagram Feed"],
    status: "Posted",
    publishedAt: "2026-06-02 15:10",
    externalPostId: "IG-MOCK-8892",
  },
  {
    id: "history-3",
    caption: "Restock notice for the small bear keychain collection.",
    categoryId: "cat-2",
    targets: ["Instagram Story"],
    status: "Failed",
    publishedAt: "2026-06-02 09:30",
    externalPostId: "Pending",
    errorMessage: "Publishing connection needs review before retrying.",
  },
];

export const mockRecentPosts: Post[] = [
  ...mockQueuePosts.slice(0, 2),
  {
    id: "recent-1",
    caption: "Handmade linen pouch, natural shade, ready to pack as a small gift.",
    categoryId: "cat-3",
    targets: ["Instagram Feed"],
    status: "Posted",
    publishedAt: "2026-06-03 16:00",
    externalPostId: "IG-MOCK-8811",
  },
];

export const mockPosts: Post[] = [
  ...mockQueuePosts,
  ...mockHistoryPosts,
  {
    id: "draft-1",
    caption: "Draft caption for a soft launch product set.",
    categoryId: "cat-2",
    targets: ["Facebook Page"],
    status: "Draft",
  },
];
