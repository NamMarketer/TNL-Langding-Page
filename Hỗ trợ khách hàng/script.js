script.js

document.addEventListener('DOMContentLoaded', function () {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const accordionItem = this.parentElement;
            const accordionContent = this.nextElementSibling;
            const isActive = accordionItem.classList.contains('active');

            // Đóng tất cả các mục khác (nếu bạn muốn chỉ mở một mục tại một thời điểm)
            // Bỏ comment phần này nếu muốn tính năng này
            /*
            document.querySelectorAll('.accordion-item.active').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                    item.querySelector('.accordion-content').style.padding = "0 20px"; // Reset padding
                     item.querySelector('.accordion-header').classList.remove('active'); // Cập nhật trạng thái header
                }
            });
            */

            // Mở/đóng mục hiện tại
            if (isActive) {
                accordionItem.classList.remove('active');
                this.classList.remove('active'); // Xóa class active khỏi header
                accordionContent.style.maxHeight = null;
                accordionContent.style.padding = "0 20px"; // Reset padding khi đóng

            } else {
                accordionItem.classList.add('active');
                 this.classList.add('active'); // Thêm class active vào header
                // Đặt padding trước khi tính scrollHeight
                accordionContent.style.padding = "20px";
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";

            }
        });
    });
});