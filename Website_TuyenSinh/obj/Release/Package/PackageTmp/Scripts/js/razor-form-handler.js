$(function () {
    const ENABLE_SCOPE_LOG = true;

    const nganh = [
        { value: "CNTT", text: "Công nghệ thông tin" },
        { value: "TMDT", text: "Thương mại điện tử" },
        { value: "HH", text: "Công nghệ kỹ thuật hóa học" },
    ];

    function togglePhuongThucBody($header) {
        console.log("RENDER TEST: " + $header);
        const $container = $header.closest(".phuongthuc-container");
        const $body = $container.find(".phuongthuc-body");
        const $icon = $header.find(".dropdown-icon");

        $header.toggleClass("expanded");

        $icon.toggleClass("rotated");
        $icon.css(
            "transform",
            $icon.hasClass("rotated") ? "rotate(180deg)" : "rotate(0deg)",
        );

        $body.slideToggle(200).toggleClass("active");
    }

    $(document)
        .off("click.pt-header", ".phuongthuc-header")
        .on("click.pt-header", ".phuongthuc-header", function () {
            togglePhuongThucBody($(this));
        });

    $(document)
        .off("click.pt-sub", ".phuongthuc-checkbox, .dropdown-icon")
        .on("click.pt-sub", ".phuongthuc-checkbox, .dropdown-icon", function (e) {
            e.stopPropagation();
            const $header = $(this).closest(".phuongthuc-header");
            togglePhuongThucBody($header);
        });

    // ADD
    $(document).on("click", ".btn-add", function () {
        const $button = $(this);
        const $container = $button.closest(".phuongthuc-container");
        const targetId = $button.data("target");
        const templateId = $button.data("template") || "nv-template";

        let $list = $();
        if (targetId) {
            $list = $container.find("#" + targetId).first();
            if ($list.length === 0) {
                $list = $("#" + targetId).first();
            }
        }

        if ($list.length === 0) {
            $list = $container.find(".nguyen-vong-list").first();
        }

        const count = $list.find(".nguyen-vong-item").length + 1;

        const $template = $("#" + templateId);
        if ($template.length === 0) {
            return;
        }

        const html = $template.html().replace(/__INDEX__/g, count);

        $list.append(html);

        updateNguyenVongLabels($list);
    });

    // ADD -> HỌC PHẦN
    $(".btn-add-hp").click(function () {
        const $button = $(this);
        const $hocPhanList = $(".hoc-phan-list-lienthong");

        if ($hocPhanList.length === 0) {
            return;
        }

        const count = $hocPhanList.find(".row.mb-2").length + 1;

        const $template = $("#hp-template");
        if ($template.length === 0) {
            return;
        }

        const html = $template.html().replace(/__INDEX__/g, count);

        $hocPhanList.append(html);

        updateHocPhanLabels($hocPhanList);
    });

    // DELETE
    $(document).on("click", ".btn-delete", function (e) {
        e.preventDefault();

        const $item = $(this).closest(".nguyen-vong-item");
        const $list = $item.closest(".nguyen-vong-list");

        $item.fadeOut(200, function () {
            $(this).remove();
            updateNguyenVongLabels($list);
        });
    });

    // DELETE -> HỌC PHẦN
    $(document).on("click", ".btn-delete-hp", function (e) {
        e.preventDefault();

        const $item = $(this).closest(".row.mb-2");
        const $list = $item.closest(".hoc-phan-list-lienthong");

        $item.fadeOut(200, function () {
            $(this).remove();
            updateHocPhanLabels($list);
        });
    });

    // UPDATE LABEL
    function updateNguyenVongLabels($list) {
        if (!$list || $list.length === 0) return;

        $list.find(".nguyen-vong-item").each(function (index) {
            const newIndex = index + 1;

            $(this).attr("data-nv-index", newIndex);

            $(this)
                .find(".nv-label")
                .html(`Nguyện vọng ${newIndex} <span class="text-danger">*</span>`);
        });
    }

    // UPDATE LABEL -> HỌC PHẦN
    function updateHocPhanLabels($list) {
        if (!$list || $list.length === 0) return;

        $list.find(".row.mb-2").each(function (index) {
            const newIndex = index + 1;

            $(this).find(".fs-13px span").text(`Môn học phần ${newIndex}`);
        });
    }

    $(document).on("input", ".custom-input", function () {
        handleScoreChange(this);
    });

    function handleScoreChange(input) {
        const maTieuChi = input.dataset.matieuchi;

        if (!tieuChiList || tieuChiList.length === 0) {
            return;
        }

        const tieuChi = tieuChiList.find((tc) => tc.MaTieuChi === maTieuChi);
        if (!tieuChi) {
            return;
        }

        const row = input.closest("tr");
        const inputs = row
            ? row.querySelectorAll(`.custom-input[data-matieuchi="${maTieuChi}"]`)
            : [];

        // Chuyển về dạng {field: value}
        const values = {};
        inputs.forEach((i) => {
            const field = i.dataset.field;
            const value = parseFloat(i.value);
            values[field] = isNaN(value) ? 0 : value;

            console.log("Field: " + field + ", Value: " + value);
        });

        const result = calculateDiemTieuChi(
            tieuChi.CongThucTinhDiemTongCong,
            values,
        );
        console.log("Result: " + result);

        if (row) {
            const scorePill = row.querySelector(".score-pill");
            if (scorePill) {
                scorePill.innerText = result.toFixed(2);
            }
        }
    }

    function calculateDiemTieuChi(congThucTinhDiem, values) {
        let fomula = congThucTinhDiem;

        for (let key in values) {
            const regex = new RegExp(key, "g");
            fomula = fomula.replace(regex, values[key]);
        }

        console.log("Công thức: " + fomula);

        return eval(fomula);
    }
});