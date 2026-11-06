import type { BadgeTone } from "@/components/ui/badge";

interface IStatusOption {
  readonly label: string;
  readonly tone: BadgeTone;
}

export const LESSON_TRACKS = [
  "Nhập môn thuật toán",
  "Sắp xếp",
  "Tìm kiếm",
  "Cấu trúc dữ liệu",
  "Cây và đồ thị",
  "Đệ quy và quy hoạch động",
] as const;

export type LessonStatus = "published" | "draft";

export const LESSON_STATUSES: Readonly<Record<LessonStatus, IStatusOption>> = {
  published: { label: "Đã xuất bản", tone: "success" },
  draft: { label: "Bản nháp", tone: "neutral" },
};

export interface ISampleLesson {
  readonly id: number;
  readonly title: string;
  readonly track: (typeof LESSON_TRACKS)[number];
  readonly algorithmName?: string;
  readonly durationMinutes: number;
  readonly status: LessonStatus;
  readonly updatedAt: string;
}

export const SAMPLE_LESSONS: readonly ISampleLesson[] = [
  {
    id: 1,
    title: "Thuật toán là gì?",
    track: "Nhập môn thuật toán",
    durationMinutes: 10,
    status: "published",
    updatedAt: "2026-09-02",
  },
  {
    id: 2,
    title: "Đọc độ phức tạp Big-O",
    track: "Nhập môn thuật toán",
    durationMinutes: 15,
    status: "published",
    updatedAt: "2026-09-05",
  },
  {
    id: 3,
    title: "Sắp xếp nổi bọt từng bước",
    track: "Sắp xếp",
    algorithmName: "Bubble Sort",
    durationMinutes: 20,
    status: "published",
    updatedAt: "2026-09-20",
  },
  {
    id: 4,
    title: "Chọn phần tử nhỏ nhất với Selection Sort",
    track: "Sắp xếp",
    algorithmName: "Selection Sort",
    durationMinutes: 20,
    status: "draft",
    updatedAt: "2026-10-14",
  },
  {
    id: 5,
    title: "Tìm kiếm tuyến tính",
    track: "Tìm kiếm",
    algorithmName: "Linear Search",
    durationMinutes: 12,
    status: "published",
    updatedAt: "2026-10-01",
  },
  {
    id: 6,
    title: "Chia đôi để tìm với Binary Search",
    track: "Tìm kiếm",
    algorithmName: "Binary Search",
    durationMinutes: 25,
    status: "draft",
    updatedAt: "2026-10-26",
  },
];
