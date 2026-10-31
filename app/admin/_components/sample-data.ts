import type { BadgeTone } from "@/components/ui/badge";

interface IStatusOption {
  readonly label: string;
  readonly tone: BadgeTone;
}

export type UserRole = "admin" | "teacher" | "student";

export type UserStatus = "active" | "invited" | "locked";

export const USER_ROLES: Readonly<Record<UserRole, IStatusOption>> = {
  admin: { label: "Quản trị", tone: "accent" },
  teacher: { label: "Giáo viên", tone: "neutral" },
  student: { label: "Học viên", tone: "neutral" },
};

export const USER_STATUSES: Readonly<Record<UserStatus, IStatusOption>> = {
  active: { label: "Đang hoạt động", tone: "success" },
  invited: { label: "Chờ kích hoạt", tone: "warning" },
  locked: { label: "Đã khoá", tone: "danger" },
};

export interface ISampleUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly joinedAt: string;
}

export const SAMPLE_USERS: readonly ISampleUser[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    role: "admin",
    status: "active",
    joinedAt: "2026-03-02",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@example.com",
    role: "teacher",
    status: "active",
    joinedAt: "2026-04-15",
  },
  {
    id: 3,
    name: "Lê Hoàng Châu",
    email: "chau.le@example.com",
    role: "teacher",
    status: "active",
    joinedAt: "2026-05-08",
  },
  {
    id: 4,
    name: "Phạm Quốc Dũng",
    email: "dung.pham@example.com",
    role: "student",
    status: "active",
    joinedAt: "2026-08-21",
  },
  {
    id: 5,
    name: "Võ Thu Hà",
    email: "ha.vo@example.com",
    role: "student",
    status: "active",
    joinedAt: "2026-09-03",
  },
  {
    id: 6,
    name: "Đặng Gia Huy",
    email: "huy.dang@example.com",
    role: "student",
    status: "invited",
    joinedAt: "2026-10-12",
  },
  {
    id: 7,
    name: "Bùi Ngọc Lan",
    email: "lan.bui@example.com",
    role: "student",
    status: "active",
    joinedAt: "2026-10-18",
  },
  {
    id: 8,
    name: "Hồ Văn Khoa",
    email: "khoa.ho@example.com",
    role: "student",
    status: "locked",
    joinedAt: "2026-07-27",
  },
];

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

export type ClassStatus = "ongoing" | "upcoming" | "ended";

export const CLASS_STATUSES: Readonly<Record<ClassStatus, IStatusOption>> = {
  ongoing: { label: "Đang diễn ra", tone: "success" },
  upcoming: { label: "Sắp bắt đầu", tone: "accent" },
  ended: { label: "Đã kết thúc", tone: "neutral" },
};

export interface ISampleClass {
  readonly id: number;
  readonly name: string;
  readonly code: string;
  readonly teacherName: string;
  readonly studentCount: number;
  readonly lessonCount: number;
  readonly status: ClassStatus;
  readonly startsAt: string;
}

export const SAMPLE_CLASSES: readonly ISampleClass[] = [
  {
    id: 1,
    name: "Cấu trúc dữ liệu và giải thuật – K22",
    code: "CTDL-K22",
    teacherName: "Trần Thị Bình",
    studentCount: 42,
    lessonCount: 8,
    status: "ongoing",
    startsAt: "2026-09-07",
  },
  {
    id: 2,
    name: "Nhập môn lập trình – Lớp tối",
    code: "NMLT-T2",
    teacherName: "Lê Hoàng Châu",
    studentCount: 28,
    lessonCount: 5,
    status: "ongoing",
    startsAt: "2026-09-14",
  },
  {
    id: 3,
    name: "Ôn thi Olympic Tin học",
    code: "OLP-2026",
    teacherName: "Trần Thị Bình",
    studentCount: 15,
    lessonCount: 12,
    status: "ongoing",
    startsAt: "2026-08-01",
  },
  {
    id: 4,
    name: "Thuật toán nâng cao – K23",
    code: "TTNC-K23",
    teacherName: "Lê Hoàng Châu",
    studentCount: 0,
    lessonCount: 0,
    status: "upcoming",
    startsAt: "2026-11-16",
  },
  {
    id: 5,
    name: "Cấu trúc dữ liệu và giải thuật – K21",
    code: "CTDL-K21",
    teacherName: "Trần Thị Bình",
    studentCount: 38,
    lessonCount: 10,
    status: "ended",
    startsAt: "2026-02-16",
  },
];

export const SAMPLE_TEACHERS = SAMPLE_USERS.filter(
  (user) => user.role === "teacher",
);
