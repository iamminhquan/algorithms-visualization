const USAGE_STEPS = [
  "Chọn một danh mục, rồi mở thuật toán hoặc cấu trúc dữ liệu bạn muốn tìm hiểu.",
  "Bấm phát để xem thuật toán tự chạy, hoặc đi từng bước để dừng lại ở thao tác nào cũng được.",
  "Đổi dữ liệu đầu vào và tốc độ để thử các trường hợp biên và hình dung rõ hơn.",
  "Đọc mã giả cùng độ phức tạp ở cuối trang, rồi tự cài đặt lại bằng ngôn ngữ bạn quen dùng.",
] as const;

export function HomeExplainer() {
  return (
    <section
      id="about"
      aria-label="Giới thiệu trình mô phỏng thuật toán"
      className="flex w-full scroll-mt-24 max-w-240 flex-col gap-10"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          Trình mô phỏng thuật toán là gì?
        </h2>
        <p className="text-base leading-7 text-text-secondary">
          Trình mô phỏng biến những bước trừu tượng thành hình ảnh chuyển động.
          Thay vì đọc mã giả rồi tự tưởng tượng dữ liệu thay đổi ra sao, bạn
          nhìn thấy ngay: các cột đổi chỗ khi thuật toán sắp xếp chạy, các nút
          sáng lên khi duyệt đồ thị, các con trỏ nối lại khi cây tự cân bằng.
          Khi đã thấy từng thao tác diễn ra, bạn dễ nhớ cách thuật toán hoạt
          động và hiểu vì sao nó có độ phức tạp như vậy.
        </p>
        <p className="text-base leading-7 text-text-secondary">
          Mọi mô phỏng đều chạy ngay trên trình duyệt của bạn. Bạn có thể xem
          thuật toán chạy một mạch từ đầu đến cuối, giảm tốc độ cho dễ theo dõi,
          hoặc đi qua từng thao tác một. Mỗi trang còn có phần mô tả từng bước,
          độ phức tạp và mã giả để bạn chuyển dần từ xem sang tự viết.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          Cách sử dụng
        </h2>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-base leading-7 text-text-secondary marker:font-medium marker:text-accent-text">
          {USAGE_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
