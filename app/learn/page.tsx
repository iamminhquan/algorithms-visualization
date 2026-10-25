import {
  ArrowDownUp,
  Gauge,
  Layers,
  type LucideIcon,
  Network,
  Repeat2,
  Search,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Học tập",
};

/**
 * Một lộ trình học trên trang `/learn`. Chưa có nội dung bài học nên mọi lộ trình đều hiện
 * "Sắp ra mắt".
 */
interface ILearningTrack {
  readonly title: string;
  readonly description: string;
  readonly level: "Cơ bản" | "Trung bình" | "Nâng cao";
  readonly topics: readonly string[];
  readonly icon: LucideIcon;
}

const LEARNING_TRACKS: readonly ILearningTrack[] = [
  {
    title: "Nhập môn thuật toán",
    description: "Hiểu thuật toán là gì và cách đánh giá một thuật toán tốt.",
    level: "Cơ bản",
    topics: [
      "Đọc mã giả",
      "Độ phức tạp Big-O",
      "Trường hợp tốt nhất và xấu nhất",
    ],
    icon: Gauge,
  },
  {
    title: "Sắp xếp",
    description: "Từ các thuật toán O(n²) đơn giản đến chia để trị.",
    level: "Cơ bản",
    topics: ["Bubble Sort", "Selection Sort", "Merge Sort và Quick Sort"],
    icon: ArrowDownUp,
  },
  {
    title: "Tìm kiếm",
    description:
      "Tìm một giá trị nhanh hơn bằng cách tận dụng thứ tự của dữ liệu.",
    level: "Cơ bản",
    topics: [
      "Tìm kiếm tuyến tính",
      "Tìm kiếm nhị phân",
      "Chọn cách tìm phù hợp",
    ],
    icon: Search,
  },
  {
    title: "Cấu trúc dữ liệu",
    description:
      "Cách lưu dữ liệu quyết định thao tác nào nhanh, thao tác nào chậm.",
    level: "Trung bình",
    topics: ["Array và danh sách liên kết", "Stack và queue", "Bảng băm"],
    icon: Layers,
  },
  {
    title: "Cây và đồ thị",
    description: "Biểu diễn quan hệ giữa các phần tử và duyệt qua chúng.",
    level: "Nâng cao",
    topics: ["Cây nhị phân tìm kiếm", "BFS và DFS", "Đường đi ngắn nhất"],
    icon: Network,
  },
  {
    title: "Đệ quy và quy hoạch động",
    description: "Chia bài toán lớn thành bài toán con và tái sử dụng kết quả.",
    level: "Nâng cao",
    topics: ["Lời gọi đệ quy", "Ghi nhớ kết quả", "Bảng quy hoạch động"],
    icon: Repeat2,
  },
];

const LEARNING_STEPS = [
  {
    title: "Đọc ý tưởng",
    description:
      "Bài học ngắn giải thích thuật toán bằng lời và hình minh hoạ.",
  },
  {
    title: "Xem mô phỏng",
    description: "Chạy từng bước trên trình mô phỏng để thấy dữ liệu thay đổi.",
  },
  {
    title: "Tự viết code",
    description: "Cài đặt lại thuật toán và kiểm tra bằng các bộ dữ liệu mẫu.",
  },
] as const;

export default function LearnPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-20">
      <div className="mx-auto flex w-full max-w-310 flex-col gap-14">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Học tập
          </h1>
          <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
            Các lộ trình học đi từ khái niệm nền tảng đến thuật toán nâng cao,
            mỗi bài đều gắn với một mô phỏng để bạn vừa đọc vừa xem.
          </p>
        </header>

        <section
          aria-labelledby="learning-steps"
          className="flex flex-col gap-5"
        >
          <h2
            id="learning-steps"
            className="text-2xl font-semibold text-text-primary"
          >
            Mỗi bài học gồm
          </h2>
          <ol className="grid gap-5 sm:grid-cols-3">
            {LEARNING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border border-border-default bg-bg-surface p-5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent-text">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-5 text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="learning-tracks"
          className="flex flex-col gap-5"
        >
          <h2
            id="learning-tracks"
            className="text-2xl font-semibold text-text-primary"
          >
            Lộ trình học
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEARNING_TRACKS.map((track) => (
              <li key={track.title}>
                <LearningTrackCard track={track} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function LearningTrackCard({ track }: { track: ILearningTrack }) {
  const Icon = track.icon;
  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span className="rounded-full border border-border-default px-2.5 py-1 text-xs font-medium text-text-secondary">
          {track.level}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-text-primary">
          {track.title}
        </h3>
        <p className="text-sm leading-5 text-text-secondary">
          {track.description}
        </p>
      </div>
      <ul className="flex flex-col gap-2 text-sm text-text-secondary">
        {track.topics.map((topic) => (
          <li key={topic} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-text-muted"
            />
            {topic}
          </li>
        ))}
      </ul>
      <p className="mt-auto inline-flex self-start rounded-full border border-dashed border-border-strong px-2.5 py-1 text-xs font-medium text-text-muted">
        Sắp ra mắt
      </p>
    </article>
  );
}
