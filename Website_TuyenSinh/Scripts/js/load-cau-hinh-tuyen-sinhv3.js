$(function () {
    //Site test: Không lưu(option 1), Lưu dưới dạng mã hóa (option 2);
    var cheDoLuu = 2;

    var CAU_HINH_LUU = {
        tenKhoa: 'xettuyen_local_form_data',
        soNgayHetHan: 3,
        saltMaHoa: 'ASC_2026',
    };

    //State
    var flag_InitLanDau = false;
    var rawDanhMuc;
    var typeCauHinh;
    try {
        const parsed = JSON.parse($("#form-config-data").text() || "{}");
        rawDanhMuc = parsed.danhMuc || [];
        typeCauHinh = parsed.typeCauHinh;
    } catch (e) {
        $('#df-wrapper').html(
            '<div class="alert alert-danger">Lỗi tải cấu hình form.</div>',
        );
        return;
    }

    var tabs = buildTabs(rawDanhMuc || []);
    var savedValues = loadSnapshot(tabs);
    var curTabIdx = 0;
    var popupCtx = null;
    var tabDomCache = {};
    var $activePanel = null;

    //Init
    renderTieuDeNoiDungTab();
    bindGlobalEvents();
    showResumeDialogIfNeeded();

    function getSnapshotStorageKey() {
        var suffix = typeCauHinh == null ? "default" : String(typeCauHinh);
        return CAU_HINH_LUU.tenKhoa + "_" + suffix;
    }

    function showResumeDialogIfNeeded() {
        if (!hasSavedLocalData()) {
            renderTab(0);
            return;
        }

        var contentHtml =
            '<div class="df-resume-dialog">' +
            '<div class="df-resume-title">Phát hiện dữ liệu đăng ký đã lưu</div>' +
            '<div class="df-resume-desc">Bạn có muốn tiếp tục hồ sơ lần trước không?</div>' +
            "</div>";

        if (window.kendo && kendo.ui && kendo.ui.Dialog) {
            var $dlg = $("#df-resume-dialog");

            if (!$dlg.length) {
                $dlg = $('<div id="df-resume-dialog"></div>').appendTo("body");
            }

            var oldDlg = $dlg.data("kendoDialog");
            if (oldDlg) {
                oldDlg.destroy();
                $dlg.remove();
                $dlg = $('<div id="df-resume-dialog"></div>').appendTo("body");
            }

            $dlg.kendoDialog({
                width: "520px",
                title: "Khôi phục hồ sơ đăng ký",
                closable: false,
                modal: true,
                content: contentHtml,
                actions: [
                    {
                        text: "Tạo mới",
                        action: function () {
                            resetLocalSnapshotAndState();
                            renderTab(0);
                            return true;
                        },
                    },
                    {
                        text: "Tiếp tục hồ sơ",
                        primary: true,
                        action: function () {
                            renderTab(findResumeTabIndex());
                            return true;
                        },
                    },
                ],
            });

            $dlg.data("kendoDialog").open();
            return;
        }

        function findResumeTabIndex() {
            var resumeKey = window.__dfResumeTabKey;
            if (resumeKey) {
                var idxByKey = tabs.findIndex(function (t) {
                    return !t.isReviewTab && t.tabKey === resumeKey;
                });
                if (idxByKey >= 0) return idxByKey;
            }

            for (var i = 0; i < tabs.length; i++) {
                var t = tabs[i];
                if (t.isReviewTab || t.isCompleted) continue;

                var hasData = (t.fields || []).some(function (f) {
                    return hasMeaningfulValue(f, savedValues[f.maDanhMuc]);
                });

                if (hasData) return i;
            }

            for (var j = 0; j < tabs.length; j++) {
                if (!tabs[j].isReviewTab && !tabs[j].isCompleted) return j;
            }

            return 0;
        }

        function resetLocalSnapshotAndState() {
            try {
                localStorage.removeItem(getSnapshotStorageKey());
            } catch (e) { }

            savedValues = {};
            $.each(tabs, function (_, t) {
                t.isCompleted = false;
                t.isSeen = false;
            });

            curTabIdx = 0;
            tabDomCache = {};
            $activePanel = null;
        }

        if (
            window.confirm(
                "Phát hiện dữ liệu đã lưu. Bạn có muốn tiếp tục hồ sơ cũ không?",
            )
        ) {
            flag_InitLanDau = false;
            renderTab(findResumeTabIndex());
            //   $.each(tabsRef, function (index, tab) {
            //     syncSidebarStep(index);
            //   });
        } else {
            resetLocalSnapshotAndState();
            renderTab(0);
        }
    }

    function buildTabs(records) {
        var byTab = {};
        $.each(records, function (_, rec) {
            var tabKey = rec.text02 || 'ThongTinChung';
            if (!byTab[tabKey]) {
                byTab[tabKey] = {
                    tabKey: tabKey,
                    tabLabel: getTenTab(tabKey),
                    tabIndex: Object.keys(byTab).length,
                    isCompleted: false,
                    isSeen: false,
                    isDisable: true,
                    fields: [],
                    isReviewTab: false,
                };
            }
            byTab[tabKey].fields.push(mapField(rec));
        });

        var result = Object.keys(byTab).map(function (k) {
            return byTab[k];
        });
        $.each(result, function (_, tab) {
            tab.fields.sort(function (a, b) {
                return (a.stt || 0) - (b.stt || 0);
            });
        });

        //result.push({
        //    tabKey: "ThongTinXetTuyen",
        //    tabLabel: "Thông tin xét tuyển",
        //    tabIndex: result.length,
        //    isCompleted: false,
        //    isSeen: false,
        //    fields: [],
        //    isReviewTab: true,
        //});

        result.push({
            tabKey: 'HoanTatDangKy',
            tabLabel: 'Hoàn tất đăng ký',
            tabIndex: result.length + 1,
            isCompleted: false,
            isSeen: false,
            fields: [],
            isReviewTab: true,
        });
        return result;
    }

    function mapField(rec) {
        var col = parseInt(rec.text05 || 12, 10);
        if (!col || col < 1 || col > 12) col = 12;

        var fType = parseInt(rec.text07 || 1, 10);
        if (!fType || fType < 1 || fType > 14) fType = 1;

        var maxLen = parseInt(rec.text13 || 0, 10);
        if (isNaN(maxLen) || maxLen < 0) maxLen = 0;

        return {
            maDanhMuc: rec.maDanhMuc,
            tenDanhMuc: rec.tenDanhMuc,
            tab: rec.text02,
            colSpan: col,
            parentField: rec.text04 || '',
            isParent: rec.text06 === '1',
            fieldType: fType,
            controller: rec.text08 || '',
            actionName: rec.text09 || '',
            cascadeField: rec.text10 || '',
            isRequired: rec.text03 === '1',
            maxLength: maxLen,
            placeHolder: rec.text14 || '',
            readOnly: rec.text15 === '1',
            isVisible: rec.isVisible !== false,
            stt: (function () {
                var n = parseInt(rec.stt, 10);
                return isNaN(n) ? 999999 : n;
            })(),
        };
    }

    function getTenTab(tabKey) {
        switch (tabKey) {
            case "ThongTinThiSinh":
                return "Thông tin thí sinh";
            case "ThongTinDangKy":
                return "Thông tin đăng ký";
            case "QuaTrinhDaoTao":
                return "Quá trình đào tạo";
            case "ThongTinNguoiGioiThieu":
                return "Thông tin người giới thiệu";
            case "ThongTinKhac":
                return "Thông tin khác";
            case "ChungChiNgoaiNgu":
                return "Chứng chỉ ngoại ngữ";
            case "ThongTinXetTuyen":
                return "Thông tin xét tuyển";
            case "ThongTinKhaoSat":
                return "Thông tin khảo sát";
            case "HoanTatDangKy":
                return "Hoàn tất đăng ký";
            case "ThongTinDVCongTac":
                return "Thông tin đơn vị công tác";
            case "ThongTinCCHN":
                return "Thông tin chứng chỉ hành nghề";
            case "ThongTinChungChiNN":
                return "Thông tin chứng chỉ ngoại ngữ";
            default:
                return tabKey;
        }
    }

    function renderTieuDeNoiDungTab() {
        $('#df-loading').remove();
        $('#df-wrapper').empty();

        if (!tabs.length) {
            $('#df-wrapper').html(
                '<div class="alert alert-warning">Không có cấu hình biểu mẫu.</div>',
            );
            return;
        }

        var $card = $('<div class="df-card"></div>');
        $card.append(
            '<div class="df-card-header">' +
                '<div>' +
                '<div class="df-card-title" id="df-tab-title"></div>' +
                '<div class="df-card-sub">Vui lòng điền chính xác thông tin theo giấy tờ tùy thân.</div>' +
                '</div>' +
                '<span class="df-badge-done" id="df-done-badge" style="display:none">' +
                '<i class="bi bi-check-circle-fill"></i> Đã hoàn thành</span>' +
                '</div>' +
                '<div id="df-fields-container"></div>' +
                '<div class="df-nav-bar">' +
                '<button class="df-btn-back" id="df-btn-back"><i class="bi bi-arrow-left me-1"></i> Quay về</button>' +
                '<button class="df-btn-next" id="df-btn-next">Hoàn thành &amp; tiếp tục <i class="bi bi-arrow-right ms-1"></i></button>' +
                '</div>',
        );
        $('#df-wrapper').append($card);
    }

    function renderTab(idx) {
        var prevIdx = curTabIdx;
        curTabIdx = idx;
        var tab = tabs[idx];

        tabs[idx].isSeen = true;

        if (!tab) return;

        if ($activePanel) {
            tabDomCache[tabs[prevIdx].tabKey] = $activePanel.detach();
        }

        $('#df-tab-title').text(tab.tabLabel);
        $('#df-done-badge').toggle(!!tab.isCompleted);

        var $next = $('#df-btn-next');
        var isLast = idx === tabs.length - 1;
        $next.html(
            isLast
                ? 'Hoàn tất đăng ký <i class="bi bi-check-lg ms-1"></i>'
                : 'Hoàn thành &amp; tiếp tục <i class="bi bi-arrow-right ms-1"></i>',
        );

        // Clear cache của review tab để luôn rebuild với dữ liệu mới nhất
        if (tab.isReviewTab) {
            delete tabDomCache[tab.tabKey];
            console.log('[renderTab] Cleared review tab cache to refresh data');
        }

        if (!tabDomCache[tab.tabKey]) {
            tabDomCache[tab.tabKey] = buildTabPanel(tab);
        }

        $activePanel = tabDomCache[tab.tabKey];
        $('#df-fields-container').empty().append($activePanel);

        restoreValues(tab.fields);
        bindCascade(tab.fields);
        loadInitialActionOptions(tab.fields);
        syncSidebarStep(idx);
    }

    function ensureKendoPopupWindow() {
        var $popup = $('#df-popup-modal');
        if (!$popup.length || !(window.kendo && kendo.ui && kendo.ui.Window))
            return null;

        var popupWindow = $popup.data('kendoWindow');
        if (popupWindow) return popupWindow;

        $popup.kendoWindow({
            visible: false,
            modal: true,
            resizable: false,
            width: '920px',
            actions: ['Close'],
        });

        return $popup.data('kendoWindow');
    }

    function openPopupWindow(title) {
        var popupWindow = ensureKendoPopupWindow();
        if (popupWindow) {
            popupWindow.title(title || 'Tìm kiếm');
            popupWindow.center().open();
            return;
        }

        if (window.bootstrap && bootstrap.Modal) {
            new bootstrap.Modal('#df-popup-modal').show();
        }
    }

    function closePopupWindow() {
        var popupWindow = $('#df-popup-modal').data('kendoWindow');
        if (popupWindow) {
            popupWindow.close();
            return;
        }

        if (window.bootstrap && bootstrap.Modal) {
            var popupEl = document.getElementById('df-popup-modal');
            var modalInst = bootstrap.Modal.getInstance(popupEl);
            if (modalInst) modalInst.hide();
        }
    }

    function showMessage(message, title) {
        if (window.kendo && kendo.alert) {
            kendo.alert(esc(message));
            return;
        }
        window.alert(message);
    }

    function showConfirm(message, onConfirm) {
        if (window.kendo && kendo.confirm) {
            kendo.confirm(esc(message)).then(function () {
                if (typeof onConfirm === 'function') onConfirm();
            });
            return;
        }

        if (window.confirm(message) && typeof onConfirm === 'function') {
            onConfirm();
        }
    }

    function hasSavedLocalData() {
        if (cheDoLuu !== 2) return false;
        if (!savedValues || Object.keys(savedValues).length === 0) return false;
        try {
            var encrypted = localStorage.getItem(getSnapshotStorageKey());
            return !!encrypted;
        } catch (e) {
            return false;
        }
    }

    window.dfGoToTab = function (idx) {
        if (typeof idx !== 'number') return;
        if (idx < 0 || idx >= tabs.length) return;

        if (!tabs[idx].isSeen) return;

        renderTab(idx);
    };

    //Build nội dung của tab tương ứng
    function buildTabPanel(tab) {
        if (tab.tabKey === "ThongTinXetTuyen") {
            var $panel = $('<div class="df-tab-panel"></div>');

            $panel.html('<div class="text-center p-3">Đang tải dữ liệu...</div>');

            $.ajax({
                url: "/DangKyXetTuyen/RazorLogicChinhQuy",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tieuChiList: tieuChiList,
                }),
                cache: false,
                success: function (html) {
                    $panel.html(html);

                    if (window.kendo) {
                        kendo.init($panel);
                    }
                },
                error: function (xhr) {
                    $panel.html(
                        '<div class="alert alert-danger">' +
                        "Lỗi: " +
                        (xhr.responseText || "Không tải được dữ liệu") +
                        "</div>",
                    );
                },
            });

            return $panel;
        }
            return $panel;
        }

        if (tab.isReviewTab) {
            return buildReviewPanel(tab);
        }

        var $panel = $('<div class="df-tab-panel"></div>');
        var childRendered = {};

        var ordered = $.grep(tab.fields, function (x) {
            return (
                x.isVisible &&
                x.maDanhMuc !== 'ApplyHKTT' &&
                x.maDanhMuc !== 'ApDungNOHTTheoHKTT'
            );
        }).sort(function (a, b) {
            return (a.stt || 0) - (b.stt || 0);
        });

        var rootBuffer = [];

        function flushRoots() {
            if (!rootBuffer.length) return;
            $panel.append(renderFieldRows(rootBuffer, false));
            rootBuffer = [];
        }

        $.each(ordered, function (_, f) {
            if (childRendered[f.maDanhMuc]) return;

            if (f.isParent) {
                var children = $.grep(ordered, function (x) {
                    return (
                        x.isVisible &&
                        !x.isParent &&
                        x.parentField === f.maDanhMuc
                    );
                });

                if (!children.length) return;

                flushRoots();

                $.each(children, function (_, c) {
                    childRendered[c.maDanhMuc] = true;
                });

                var legendId = 'lg' + idSlug(f.maDanhMuc);
                var $wrapper = $('<div class="col-md-12"></div>');
                var $fs = $(
                    '<fieldset class="reset-this redo-fieldset group-box" id="fs' +
                        idSlug(f.maDanhMuc) +
                        '"></fieldset>',
                );
                $fs.append(
                    '<legend class="reset-this redo-legend float-none" id="' +
                        legendId +
                        '">' +
                        esc(f.tenDanhMuc) +
                        '</legend>',
                );
                $fs.append(renderFieldRows(children, true));
                $wrapper.append($fs);
                $panel.append($wrapper);
                return;
            }

            if (f.parentField) return;
            rootBuffer.push(f);
        });

        flushRoots();
        return $panel;
    }

    //Render các field theo dòng
    function renderFieldRows(fields, useLegacyGroup) {
        var $container = $(
            useLegacyGroup
                ? '<div class="form-group row"></div>'
                : '<div></div>',
        );
        var $row = null;
        var usedCols = 0;

        $.each(fields, function (_, f) {
            var span = f.colSpan || 12;
            if (!$row || usedCols + span > 12) {
                if ($row) $container.append($row);
                $row = $('<div class="row mb-1"></div>');
                usedCols = 0;
            }

            var $col = $(
                '<div class="col-md-' + span + '" id="' + colId(f) + '"></div>',
            );
            $col.append(buildField(f));
            $row.append($col);
            usedCols += span;
        });

        if ($row) $container.append($row);
        return $container;
    }

    //Custom lại field theo lại,
    function initKendo(f) {
        var id = '#' + inputId(f);
        var rawVal = savedValues[f.maDanhMuc];

        switch (f.fieldType) {
            case 4:
                if ($(id).data('kendoComboBox')) return;
                $(id).kendoComboBox({
                    dataTextField: 'text',
                    dataValueField: 'value',
                    dataSource: f.options || [],
                    filter: 'contains',
                    suggest: true,
                    placeholder: f.placeHolder || '-- Chọn --',
                    enable: !f.readOnly,
                });
                if (rawVal != null) {
                    $(id).data('kendoComboBox').value(rawVal);
                }
                break;

            case 5:
                if ($(id).data('kendoNumericTextBox')) return;
                $(id).kendoNumericTextBox({
                    format: 'n0',
                    min: 0,
                    max: f.maxLength || null,
                });
                if (rawVal != null && rawVal !== '') {
                    $(id).data('kendoNumericTextBox').value(Number(rawVal));
                }
                break;

            case 6:
                if ($(id).data('kendoDatePicker')) return;
                $(id).kendoDatePicker({
                    format: 'dd/MM/yyyy',
                });
                if (rawVal) {
                    $(id).data('kendoDatePicker').value(rawVal);
                }
                break;
            case 9:
                $("#file-" + inputId(f)).kendoUpload({
                    //     {
                    //     saveUrl: "/upload/save",
                    //     removeUrl: "/upload/remove",
                    //     autoUpload: true,
                    //   }
                    async: false,
                    autoUpload: false,
                    multiple: false,
                    validation: {
                        allowedExtensions: f.extensions || [".jpg", ".png", ".pdf"],
                        maxFileSize: f.maxSize || 4194304,
                    },
                });
                break;

            case 14:
                if ($(id).data('kendoMultiSelect')) return;
                $(id).kendoMultiSelect({
                    dataTextField: 'text',
                    dataValueField: 'value',
                    dataSource: f.options || [],
                    placeholder: f.placeHolder || '-- Chọn nhiều --',
                });
                if (rawVal) {
                    var arr = Array.isArray(rawVal)
                        ? rawVal
                        : String(rawVal)
                              .split(',')
                              .map(function (x) {
                                  return $.trim(x);
                              });
                    $(id).data('kendoMultiSelect').value(arr);
                }
                break;
        }
    }

    //Type1
    function buildField(f) {
        var $w = $(
            '<div class="df-field-wrap" data-field="' +
                f.maDanhMuc +
                '"></div>',
        );

        switch (f.fieldType) {
            case 1:
                $w.append(bTextBox(f));
                break;
            case 2:
                $w.append(bCheckBox(f));
                break;
            case 3:
                $w.append(bRadioBox(f));
                break;
            case 4:
                $w.append(bComboBox(f));
                break; // Kendo
            case 5:
                $w.append(bNumeric(f));
                break; // Kendo
            case 6:
                $w.append(bDatePicker(f));
                break; // Kendo
            case 7:
                $w.append(bLabel(f));
                break;
            case 8:
                $w.append(bImage(f));
                break;
            case 9:
                $w.append(bFileAttach(f));
                break;
            case 10:
                $w.append(bLink(f));
                break;
            case 11:
                $w.append(bConfig(f));
                break;
            case 12:
                $w.append(bPopup(f));
                break;
            case 13:
                $w.append(bActionDelete(f));
                break;
            case 14:
                $w.append(bMultiSelect(f));
                break;
            default:
                $w.append(bTextBox(f));
        }

        if (f.isRequired) {
            $w.append(
                '<div class="df-error" id="df-err-' +
                    inputId(f) +
                    '">Trường này là bắt buộc.</div>',
            );
        }

        setTimeout(() => initKendo(f), 0);

        return $w;
    }

    //Type2
    function bTextBox(f) {
        return (
            lbl(f) +
            '<input type="text" id="' +
            inputId(f) +
            '" name="' +
            inputName(f) +
            '" data-field-key="' +
            esc(f.maDanhMuc) +
            '" class="df-input" ' +
            ph(f) +
            ml(f) +
            ro(f) +
            ' />'
        );
    }

    //Type3
    function bCheckBox(f) {
        var cId = inputId(f);
        return `
            <div class="df-check-group" id="cg-${cId}">
                <label class="df-check-item" for="${cId}">
                    <input type="checkbox" id="${cId}" name="${inputName(f)}" data-field-key="${esc(f.maDanhMuc)}" value="false" />
                    ${esc(f.tenDanhMuc)}
                </label>
                <input type="hidden" id="${cId}_hidden" name="${inputName(f)}_hidden" data-field-key="${esc(f.maDanhMuc)}" />
            </div>
        `;
    }

    //Type4
    function bRadioBox(f) {
        //TODO: CHưa có API nên để tạm hardcode để test
        if (f.maDanhMuc === 'GioiTinh' && (!f.options || !f.options.length)) {
            f.options = [
                { value: 'Nam', text: 'Nam' },
                { value: 'Nữ', text: 'Nữ' },
            ];
        }

        var h =
            lbl(f) + '<div class="df-radio-group" id="rg-' + inputId(f) + '">';
        $.each(f.options || [], function (i, o) {
            var rId = inputId(f) + '_' + i;
            h +=
                '<label class="df-radio-item">' +
                '<input type="radio" id="' +
                rId +
                '" name="' +
                inputName(f) +
                '" data-field-key="' +
                esc(f.maDanhMuc) +
                '" value="' +
                esc(o.value) +
                '" />' +
                esc(o.text) +
                '</label>';
        });
        h += '</div>';
        return h;
    }

    //Type5

    function bComboBox(f) {
        return (
            lbl(f) +
            `<select class="w-100 df-combobox" id="${inputId(f)}" name="${inputName(f)}"></select>`
        );
    }

    //Type6
    function bNumeric(f) {
        return lbl(f) + `<input id="${inputId(f)}" name="${inputName(f)}" />`;
    }

    //Type7
    function bDatePicker(f) {
        return (
            lbl(f) +
            `<input class="w-100" id="${inputId(f)}" name="${inputName(f)}" />`
        );
    }

    //Type8
    function bLabel(f) {
        if (f.maDanhMuc == "Space") {
            return '<div class="col-md-' + f.colSpan + '" id="' + inputId(f) + '"></div>';
        } else {
            return `
            <div class="df-label-field">
                <span class="df-label mb-0">
                    ${esc(f.tenDanhMuc)} :
                    ${f.isRequired ? '<span style="color:red;">*</span>' : ''}
                </span>
                <span id="${inputId(f)}">${savedValues[f.maDanhMuc] || '-'}</span>
            </div>
        `;
        }
    }

    //Type9
    function bImage(f) {
        var id = inputId(f);
        return (
            lbl(f) +
            '<div class="df-img-wrap" id="img-wrap-' +
            id +
            '">' +
            '<img id="img-prev-' +
            id +
            '" src="" alt="" />' +
            '<div class="df-img-placeholder" id="img-ph-' +
            id +
            '"><i class="bi bi-camera"></i></div>' +
            '<div class="df-img-overlay"><i class="bi bi-pencil me-1"></i>Đổi ảnh</div>' +
            '</div>' +
            '<input type="file" id="file-' +
            id +
            '" name="' +
            inputName(f) +
            '" data-field-key="' +
            esc(f.maDanhMuc) +
            '" accept="image/*" data-type="image" data-preview="#img-prev-' +
            id +
            '" data-ph="#img-ph-' +
            id +
            '" />'
        );
    }

    //Type10
    //   function bFileAttach(f) {
    //     var id = inputId(f);
    //     return (
    //       lbl(f) +
    //       '<div class="df-file-zone" data-trigger="#file-' +
    //       id +
    //       '">' +
    //       '<i class="bi bi-cloud-upload fs-5 d-block mb-1"></i>' +
    //       "Nhấn để chọn tệp đính kèm" +
    //       '<div class="df-file-name" id="fname-' +
    //       id +
    //       '"></div>' +
    //       "</div>" +
    //       '<input type="file" id="file-' +
    //       id +
    //       '" name="' +
    //       inputName(f) +
    //       '" data-field-key="' +
    //       esc(f.maDanhMuc) +
    //       '" data-type="file" data-fname="#fname-' +
    //       id +
    //       '" />'
    //     );
    //   }

    function bFileAttach(f) {
        var id = inputId(f);

        return (
            lbl(f) + `<input id="file-${id}" name="${inputName(f)}" type="file" />`
        );
    }

    //Type11
    function bLink(f) {
        return (
            lbl(f) +
            '<a class="df-link-field" id="' +
            inputId(f) +
            '" data-controller="' +
            esc(f.controller || '') +
            '" data-action="' +
            esc(f.actionName || '') +
            '" href="#">' +
            '<i class="bi bi-link-45deg"></i>' +
            esc(f.tenDanhMuc) +
            '</a>'
        );
    }

    //Type12
    //TODO: Chưa custom lại nên để tạm
    function bConfig(f) {
        return (
            '<div class="df-config-box" id="' +
            inputId(f) +
            '">' +
            '<strong>' +
            esc(f.tenDanhMuc) +
            '</strong> <code>' +
            esc(f.maDanhMuc) +
            '</code> - type <code>' +
            f.fieldType +
            '</code>' +
            '</div>'
        );
    }

    //Type13
    function bPopup(f) {
        return (
            lbl(f) +
            '<div>' +
            '<button type="button" class="df-popup-trigger" data-field="' +
            inputId(f) +
            '" data-field-key="' +
            esc(f.maDanhMuc) +
            '" data-controller="' +
            esc(f.controller || '') +
            '" data-action="' +
            esc(f.actionName || '') +
            '" data-label="' +
            esc(f.tenDanhMuc) +
            '">' +
            '<i class="bi bi-search"></i> Chọn ' +
            esc(f.tenDanhMuc) +
            '</button>' +
            '<input type="hidden" id="' +
            inputId(f) +
            '" name="' +
            inputName(f) +
            '" data-field-key="' +
            esc(f.maDanhMuc) +
            '" />' +
            '<div class="df-popup-val" id="pval-' +
            inputId(f) +
            '">' +
            '<i class="bi bi-check-circle-fill text-success"></i>' +
            '<span id="pval-text-' +
            inputId(f) +
            '"></span>' +
            '</div>' +
            '</div>'
        );
    }

    function bActionDelete(f) {
        return (
            lbl(f) +
            '<button type="button" class="df-btn-delete" data-field="' +
            inputId(f) +
            '" data-field-key="' +
            esc(f.maDanhMuc) +
            '">' +
            '<i class="bi bi-trash3"></i> Xóa ' +
            esc(f.tenDanhMuc) +
            '</button>'
        );
    }

    function bMultiSelect(f) {
        return (
            lbl(f) +
            `<select id="${inputId(f)}" name="${inputName(f)}" multiple></select>`
        );
    }

    //Khôi phục lại giá trị đã lưu
    function restoreValues(fields) {
        $.each(fields, function (_, f) {
            var val = savedValues[f.maDanhMuc];
            if (val === undefined || val === null) return;
            switch (f.fieldType) {
                case 2:
                    var arr = Array.isArray(val) ? val : String(val).split(',');
                    $.each(arr, function (_, v) {
                        $(
                            'input[name="' +
                                inputName(f) +
                                '"][value="' +
                                v.trim() +
                                '"]',
                        ).prop('checked', true);
                    });
                    break;
                case 3:
                    $(
                        'input[name="' +
                            inputName(f) +
                            '"][value="' +
                            val +
                            '"]',
                    ).prop('checked', true);
                    break;
                case 12:
                    var pv =
                        typeof val === 'object'
                            ? val
                            : { value: val, text: val };
                    $(jqId(inputId(f))).val(pv.value);
                    if (pv.text) {
                        $('#pval-text-' + inputId(f)).text(pv.text);
                        $('#pval-' + inputId(f)).show();
                    }
                    break;
                case 8:
                    if (val.preview) {
                        $('#img-prev-' + inputId(f))
                            .attr('src', val.preview)
                            .show();
                        $('#img-ph-' + inputId(f)).hide();
                    }
                    break;
                case 9:
                    if (val.fileName)
                        $('#fname-' + inputId(f)).text(val.fileName);
                    break;
                case 14:
                    var ms = $(jqId(inputId(f))).data('kendoMultiSelect');
                    var msVal = Array.isArray(val)
                        ? val
                        : String(val)
                              .split(',')
                              .map(function (x) {
                                  return $.trim(x);
                              });
                    if (ms) ms.value(msVal);
                    else $(jqId(inputId(f))).val(msVal);
                    break;
                default:
                    $(jqId(inputId(f))).val(val);
            }
        });
    }

    //Lấy giá trị
    function bindCascade(fields) {
        $.each(fields, function (_, f) {
            if (!f.cascadeField) return;
            var parentId = inputIdByKey(f.cascadeField);
            $(document)
                .off('change.casc' + inputId(f), jqId(parentId))
                .on('change.casc' + inputId(f), jqId(parentId), function () {
                    loadOptionsAjax(f, $(this).val());
                });
        });
    }

    function loadInitialActionOptions(fields) {
        $.each(fields, function (_, f) {
            if (!hasActionSource(f) || f.cascadeField) return;
            loadOptionsAjax(f, '');
        });
    }

    function loadOptionsAjax(f, parentVal) {
        // Bật lại khi có API real
        // $.getJSON('/XetTuyenDaiHoc/GetOptions', {
        //     controller: f.controller,
        //     actionName: f.actionName,
        //     parentValue: parentVal
        // }, function (opts) {
        //     var data = Array.isArray(opts) ? opts : [];
        //     var normalized = $.map(data, normalizeOpt);
        //     var $el = $(jqId(inputId(f)));
        //     if (f.fieldType === 4) {
        //         $el.empty().append('<option value="">' + (f.placeHolder || '-- Chọn --') + '</option>');
        //         $.each(normalized, function (_, o) {
        //             $el.append('<option value="' + esc(o.value) + '">' + esc(o.text) + '</option>');
        //         });
        //     } else if (f.fieldType === 2) {
        //         var $cg = $('#cg-' + inputId(f)).empty();
        //         $.each(normalized, function (i, o) {
        //             var cId = inputId(f) + '_' + i;
        //             $cg.append('<label class="df-check-item"><input type="checkbox" id="' + cId + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" value="' + esc(o.value) + '" />' + esc(o.text) + '</label>');
        //         });
        //     } else if (f.fieldType === 3) {
        //         var $rg = $('#rg-' + inputId(f)).empty();
        //         $.each(normalized, function (i, o) {
        //             var rId = inputId(f) + '_' + i;
        //             $rg.append('<label class="df-radio-item"><input type="radio" id="' + rId + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" value="' + esc(o.value) + '" />' + esc(o.text) + '</label>');
        //         });
        //     } else if (f.fieldType === 14) {
        //         var $drop = $('#msd-' + inputId(f)).empty();
        //         $.each(normalized, function (_, o) {
        //             $drop.append('<div class="df-ms-opt" data-val="' + esc(o.value) + '" data-text="' + esc(o.text) + '"><i class="bi bi-square chk-icon"></i>' + esc(o.text) + '</div>');
        //         });
        //     }
        //     restoreValues([f]);
        // });
    }

    function bindPopupTriggers() {
        $(document)
            .off('click.popup', '.df-popup-trigger')
            .on('click.popup', '.df-popup-trigger', function () {
                var $btn = $(this);
                popupCtx = {
                    controller: $btn.data('controller'),
                    actionName: $btn.data('action'),
                    targetField: $btn.data('field'),
                    targetFieldKey:
                        $btn.data('field-key') || $btn.data('field'),
                    label: $btn.data('label'),
                    page: 1,
                };
                $('#df-popup-title').text('Chọn ' + popupCtx.label);
                $('#df-popup-keyword').val('');
                doPopupSearch('');
                openPopupWindow('Chọn ' + popupCtx.label);
            });
    }

    function doPopupSearch(keyword) {
        if (!popupCtx) return;
        $.getJSON(
            '/XetTuyenDaiHoc/GetPopupData',
            {
                controller: popupCtx.controller,
                actionName: popupCtx.actionName,
                keyword: keyword,
                page: popupCtx.page,
                pageSize: 20,
            },
            renderPopupResult,
        );
    }

    function renderPopupResult(res) {
        var $th = $('#df-popup-thead').empty();
        var $tb = $('#df-popup-tbody').empty();
        var $pg = $('#df-popup-paging').empty();

        if (!res.columns || !res.columns.length || res.error) {
            $tb.html(
                '<tr><td class="text-center text-muted py-3" colspan="99">' +
                    (res.error || 'Không có dữ liệu.') +
                    '</td></tr>',
            );
            return;
        }

        var $htr = $('<tr></tr>');
        $.each(res.columns, function (_, c) {
            $htr.append('<th class="small">' + esc(c) + '</th>');
        });
        $th.append($htr);

        $.each(res.rows, function (_, row) {
            var $tr = $('<tr style="cursor:pointer"></tr>');
            $.each(res.columns, function (_, c) {
                $tr.append(
                    '<td class="small">' +
                        esc(String(row[c] == null ? '' : row[c])) +
                        '</td>',
                );
            });
            $tr.on('click', function () {
                var valCol = res.columns[0];
                var textCol = res.columns.length > 1 ? res.columns[1] : valCol;
                var val = row[valCol];
                var text = row[textCol];
                $(jqId(popupCtx.targetField)).val(val);
                $('#pval-text-' + popupCtx.targetField).text(text);
                $('#pval-' + popupCtx.targetField).show();
                savedValues[popupCtx.targetFieldKey || popupCtx.targetField] = {
                    value: val,
                    text: text,
                };
                persistSnapshotIfEnabled();
                closePopupWindow();
            });
            $tb.append($tr);
        });

        var total = res.totalRows || 0;
        var ps = res.pageSize || 20;
        var pages = Math.ceil(total / ps);
        for (var p = 1; p <= pages; p++) {
            (function (pg) {
                $pg.append(
                    $(
                        '<button class="btn btn-sm ' +
                            (pg === popupCtx.page
                                ? 'btn-primary'
                                : 'btn-outline-secondary') +
                            '">' +
                            pg +
                            '</button>',
                    ).on('click', function () {
                        popupCtx.page = pg;
                        doPopupSearch($('#df-popup-keyword').val());
                    }),
                );
            })(p);
        }
    }

    function bindFilePickers() {
        $(document)
            .off('click.file-zone', '.df-file-zone')
            .on('click.file-zone', '.df-file-zone', function () {
                var target = $(this).data('trigger');
                if (target) $(target).trigger('click');
            });

        $(document)
            .off('click.img-wrap', '.df-img-wrap')
            .on('click.img-wrap', '.df-img-wrap', function () {
                var id = $(this).attr('id').replace('img-wrap-', '');
                $('#file-' + id).trigger('click');
            });

        $(document)
            .off('change.fp', 'input[data-type="file"]')
            .on('change.fp', 'input[data-type="file"]', function () {
                var f = this.files[0];
                if (!f) return;

                var fieldId =
                    $(this).data('field-key') || this.id.replace('file-', '');
                var nameHolder = $(this).data('fname');
                if (nameHolder) $(nameHolder).text(f.name);

                savedValues[fieldId] = { fileName: f.name };
                persistSnapshotIfEnabled();
            });

        $(document)
            .off('change.ip', 'input[data-type="image"]')
            .on('change.ip', 'input[data-type="image"]', function () {
                var f = this.files[0];
                if (!f) return;

                var fieldId =
                    $(this).data('field-key') || this.id.replace('file-', '');
                var reader = new FileReader();
                var $prev = $($(this).data('preview'));
                var $ph = $($(this).data('ph'));

                reader.onload = function (e) {
                    $prev.attr('src', e.target.result).show();
                    $ph.hide();
                    savedValues[fieldId] = {
                        fileName: f.name,
                        preview: e.target.result,
                    };
                    persistSnapshotIfEnabled();
                };
                reader.readAsDataURL(f);
            });
    }

    function bindNumericSpinners() {
        $(document)
            .off('click.ns', '.df-numeric-spin button')
            .on('click.ns', '.df-numeric-spin button', function () {
                var $inp = $(jqId($(this).data('target')));
                var v = parseFloat($inp.val()) || 0;
                var max = parseFloat($inp.attr('max')) || Infinity;
                if ($(this).data('dir') === 'up') v = Math.min(v + 1, max);
                else v = v - 1;
                $inp.val(v).trigger('change');
            });
    }

    function bindActionDelete() {
        $(document)
            .off('click.del', '.df-btn-delete')
            .on('click.del', '.df-btn-delete', function () {
                var fid = $(this).data('field');
                var fieldKey = $(this).data('field-key') || fid;
                showConfirm(
                    'Xác nhận xóa dữ liệu của trường "' + fid + '"?',
                    function () {
                        $(jqId(fid)).val('').trigger('change');
                        $('#pval-' + fid).hide();
                        delete savedValues[fieldKey];
                        persistSnapshotIfEnabled();
                    },
                );
            });
    }

    function bindFormValueAutoSave() {
        $(document)
            .off('change.autosave', '#df-fields-container :input')
            .on('change.autosave', '#df-fields-container :input', function () {
                var id = this.id;
                var key = $(this).data('field-key') || id;
                if (!id || id.indexOf('file-') === 0) return;
                savedValues[key] = $(this).val();
                persistSnapshotIfEnabled();
            });

        $(document)
            .off(
                'change.autosave-check',
                '#df-fields-container input[type="checkbox"], #df-fields-container input[type="radio"]',
            )
            .on(
                'change.autosave-check',
                '#df-fields-container input[type="checkbox"], #df-fields-container input[type="radio"]',
                function () {
                    var name = $(this).attr('name');
                    if (!name) return;
                    if ($(this).attr('type') === 'checkbox') {
                        savedValues[name] = $(
                            'input[name="' + name + '"]:checked',
                        )
                            .map(function () {
                                return $(this).val();
                            })
                            .get()
                            .join(',');
                    } else {
                        savedValues[name] =
                            $('input[name="' + name + '"]:checked').val() || '';
                    }
                    persistSnapshotIfEnabled();
                },
            );
    }

    function hasMeaningfulValue(f, rawVal) {
        if (rawVal == null) return false;
        if (f.fieldType === 12) {
            if (typeof rawVal === 'object')
                return !!String(rawVal.value || '').trim();
            return !!String(rawVal).trim();
        }
        if (f.fieldType === 8 || f.fieldType === 9) {
            if (typeof rawVal === 'object')
                return !!String(rawVal.fileName || '').trim();
            return !!String(rawVal).trim();
        }
        return !!String(rawVal).trim();
    }

    function evalTabCompleted(tab, useDomValue) {
        //f.isRequired &&
        var requiredFields = $.grep(tab.fields, function (f) {
            return f.isRequired && f.isVisible && !f.isParent;
        });

        if (!tab.isSeen) return false;
        if (!requiredFields.length) return true;

        for (var i = 0; i < requiredFields.length; i++) {
            var f = requiredFields[i];
            var val = useDomValue ? getVal(f) : savedValues[f.maDanhMuc];
            if (!hasMeaningfulValue(f, val)) return false;
        }
        return true;
    }

    function validateTab(idx) {
        var tab = tabs[idx];
        var valid = true;

        // Test validate
        $.each(tab.fields, function (_, f) {
            if (!f.isRequired || !f.isVisible || f.isParent) return;
            var val = getVal(f);
            var $err = $('#df-err-' + inputId(f));
            if (!val) {
                $err.addClass('show');
                $(jqId(inputId(f))).addClass('is-invalid');
                if (f.fieldType === 14)
                    $('#msb-' + inputId(f)).addClass('is-invalid');
                valid = false;
            } else {
                $err.removeClass('show');
                $(jqId(inputId(f))).removeClass('is-invalid');
                if (f.fieldType === 14)
                    $('#msb-' + inputId(f)).removeClass('is-invalid');
            }
        });

        return valid;
    }

    function getVal(f) {
        switch (f.fieldType) {
            case 2:
                return $('input[name="' + inputName(f) + '"]:checked')
                    .map(function () {
                        return $(this).val();
                    })
                    .get()
                    .join(',');
            case 3:
                return (
                    $('input[name="' + inputName(f) + '"]:checked').val() || ''
                );
            case 14:
                var multi = $(jqId(inputId(f))).data('kendoMultiSelect');
                if (multi) return (multi.value() || []).join(',');
                return $(jqId(inputId(f))).val() || '';
            case 8:
            case 9:
                var fileInput = document.getElementById('file-' + inputId(f));
                if (fileInput && fileInput.files && fileInput.files.length)
                    return fileInput.files[0].name;
                var mem = savedValues[f.maDanhMuc];
                return mem && mem.fileName ? mem.fileName : '';
            default:
                return $(jqId(inputId(f))).val() || '';
        }
    }

    // lấy label từ DOM
    function getInputLabel($input) {
        var label = '';

        var inputId = $input.attr('id');
        if (inputId) {
            var $label = $(`label[for="${inputId}"]`);
            if ($label.length) {
                label = $label.text().trim();
            }
        }

        // label cha gần nhất
        if (!label) {
            var $parent = $input.closest('label');
            if ($parent.length && $parent.text().trim()) {
                label = $parent.text().trim();
            }
        }

        // label trong cùng container
        if (!label) {
            var $container = $input.closest('.form-group, .mb-2, .mb-3, .row');
            var $labelInContainer = $container
                .find('label, .nv-label, .fs-13px')
                .first();
            if ($labelInContainer.length) {
                label = $labelInContainer.text().trim();
            }
        }

        if (!label && $input.attr('placeholder')) {
            label = $input.attr('placeholder');
        }

        if (!label) {
            label = $input.attr('name') || $input.attr('id') || 'Thông tin';
        }

        label = label.replace(/\*/g, '').trim();

        return label || 'Thông tin';
    }

    // xác định loại input
    function getInputType($input) {
        var type = $input.attr('type');
        var tagName = $input.prop('tagName').toLowerCase();

        if (tagName === 'select') return 'select';
        if (tagName === 'textarea') return 'textarea';
        if (type === 'checkbox') return 'checkbox';
        if (type === 'radio') return 'radio';
        if (type === 'file') return 'file';
        if ($input.hasClass('k-combobox') || $input.data('kendoComboBox'))
            return 'combobox';
        if (
            $input.hasClass('k-numerictextbox') ||
            $input.data('kendoNumericTextBox')
        )
            return 'numeric';
        if ($input.hasClass('k-datepicker') || $input.data('kendoDatePicker'))
            return 'date';

        return 'text';
    }

    // lấy giá trị từ input
    function getInputValue($input) {
        var type = getInputType($input);
        var value = '';

        switch (type) {
            case 'checkbox':
                if ($input.is(':checked')) {
                    value = $input.val() || 'true';
                }
                break;
            case 'radio':
                if ($input.is(':checked')) {
                    value = $input.val() || '';
                }
                break;
            case 'select':
                if ($input.prop('multiple')) {
                    value = $input.val() ? $input.val().join(', ') : '';
                } else {
                    value =
                        $input.find('option:selected').text() ||
                        $input.val() ||
                        '';
                }
                break;
            case 'combobox':
                var comboBox = $input.data('kendoComboBox');
                if (comboBox) {
                    value = comboBox.text() || comboBox.value() || '';
                } else {
                    value = $input.val() || '';
                }
                break;
            case 'numeric':
                var numeric = $input.data('kendoNumericTextBox');
                if (numeric) {
                    value =
                        numeric.value() !== null ? String(numeric.value()) : '';
                } else {
                    value = $input.val() || '';
                }
                break;
            case 'date':
                var datePicker = $input.data('kendoDatePicker');
                if (datePicker) {
                    value = datePicker.value()
                        ? datePicker.value().toLocaleDateString('vi-VN')
                        : '';
                } else {
                    value = $input.val() || '';
                }
                break;
            default:
                value = $input.val() || '';
        }

        return value.trim();
    }

    // dữ liệu từ một phương thức xét tuyển
    function collectMethodDataDynamic($container) {
        var methodData = {
            _metadata: {
                collectedAt: new Date().toISOString(),
                inputCount: 0,
            },
        };

        var $body = $container.find('.phuongthuc-body');
        if (!$body.length) {
            console.warn(
                '[collectMethodDataDynamic] No .phuongthuc-body found',
            );
            return methodData;
        }

        function shouldSkipField(label) {
            if (!label) return false;
            var lowerLabel = String(label).toLowerCase();
            return (
                lowerLabel.includes('applyhktt') ||
                lowerLabel.includes('áp dụng theo hộ khẩu') ||
                lowerLabel === 'applyhktt'
            );
        }

        // danh sách nguyện vọng
        // Tìm .nguyen-vong-item (mỗi item là một nguyện vọng)
        var $wishItems = $body.find('.nguyen-vong-item');

        if ($wishItems.length > 0) {
            var wishItems = [];

            $wishItems.each(function (idx) {
                var $item = $(this);
                var itemData = {};

                // giá trị ngành từ select.nv-select (Nguyện vọng)
                var $nganhSelect = $item.find('select.nv-select');
                if ($nganhSelect.length > 0) {
                    var nganhValue = $nganhSelect.val();
                    var nganhText = $nganhSelect.find('option:selected').text();
                    if (nganhValue) {
                        itemData['Ngành'] = nganhText || nganhValue;
                    }
                }

                // giá trị tổ hợp môn từ select.nv-combo-select
                var $comboSelect = $item.find('select.nv-combo-select');
                if ($comboSelect.length > 0) {
                    var comboValue = $comboSelect.val();
                    if (comboValue) {
                        itemData['Tổ hợp môn'] = comboValue;
                    }
                }

                // giá trị điểm từ span.score-pill
                var $scorePill = $item.find('.score-pill');
                if ($scorePill.length > 0) {
                    var scoreValue = $scorePill.text().trim();
                    if (
                        scoreValue &&
                        scoreValue !== '0.00 điểm' &&
                        scoreValue !== '0'
                    ) {
                        itemData['Điểm'] = scoreValue;
                    }
                }

                if (Object.keys(itemData).length > 0) {
                    wishItems.push(itemData);
                }
            });

            if (wishItems.length > 0) {
                methodData['Nguyện vọng'] = {
                    _type: 'list',
                    items: wishItems,
                };
                methodData._metadata.inputCount += wishItems.reduce(
                    (sum, item) => sum + Object.keys(item).length,
                    0,
                );
            }
        } else {
            console.log(
                '[collectMethodDataDynamic] No .nguyen-vong-item found in $body',
            );
        }

        // 2. Thu thập danh sách học phần
        var $eduLists = $body.find('.hoc-phan-list-lienthong');
        if ($eduLists.length > 0) {
            var eduItems = [];
            $eduLists.find('.row.mb-2, .row').each(function (idx) {
                var $row = $(this);
                var itemData = {};

                $row.find('input, select, textarea').each(function () {
                    var $input = $(this);
                    if ($input.attr('type') === 'hidden') return;

                    var label = getInputLabel($input);
                    var value = getInputValue($input);

                    if (value && label && !shouldSkipField(label)) {
                        itemData[label] = value;
                    }
                });

                if (Object.keys(itemData).length > 0) {
                    eduItems.push(itemData);
                }
            });

            if (eduItems.length > 0) {
                methodData['Học phần'] = {
                    _type: 'list',
                    items: eduItems,
                };
                methodData._metadata.inputCount += eduItems.reduce(
                    (sum, item) => sum + Object.keys(item).length,
                    0,
                );
            }
        }
        var tableData = {};

        // Tìm select trong body
        var $allSelects = $body
            .find('select')
            .not('.nguyen-vong-item select, .phuongthuc-checkbox');

        // Duyệt từng select
        $allSelects.each(function (idx) {
            var $select = $(this);
            var selectValue = $select.find('option:selected').text().trim();

            // Bỏ qua nếu là placeholder hoặc không có giá trị
            if (
                !selectValue ||
                selectValue === '' ||
                selectValue.includes('Chọn') ||
                selectValue === '--'
            ) {
                return;
            }

            // Tìm input gần nhất
            var $possibleInput = $select.siblings('input, .score-pill').first();

            if ($possibleInput.length === 0) {
                $possibleInput = $select
                    .parent()
                    .siblings()
                    .find('input, .score-pill')
                    .first();
            }

            if ($possibleInput.length === 0) {
                $possibleInput = $select
                    .closest('.row')
                    .find('input, .score-pill')
                    .not($select)
                    .first();
            }

            if ($possibleInput.length === 0) {
                $possibleInput = $select
                    .closest('.col-md-4, .col-md-3, .d-flex, div')
                    .siblings()
                    .find('input, .score-pill')
                    .first();
            }

            // Tìm input theo position
            if ($possibleInput.length === 0) {
                var allInputs = $body.find(
                    'input[type="text"], input[type="number"], .score-pill',
                );
                // Lấy input thứ idx hoặc idx+1
                $possibleInput =
                    $(allInputs.get(idx)) || $(allInputs.get(idx + 1));
            }

            // Lấy giá trị từ input
            var diemValue = '';
            if ($possibleInput.length > 0) {
                if ($possibleInput.hasClass('score-pill')) {
                    diemValue = $possibleInput.text().trim();
                } else {
                    diemValue = $possibleInput.val();
                }
            }

            // Nếu có điểm, lưu vào tableData
            if (
                diemValue &&
                diemValue !== '' &&
                diemValue !== '0' &&
                diemValue !== '0.00'
            ) {
                var monName = selectValue;

                // tên môn từ selectValue
                var monNames = [
                    'Toán',
                    'Văn',
                    'Lý',
                    'Hóa',
                    'Sinh',
                    'Sử',
                    'Địa',
                    'Anh',
                    'Tiếng Anh',
                    'GDCD',
                    'Kinh tế',
                    'Pháp luật',
                ];
                for (var m = 0; m < monNames.length; m++) {
                    if (selectValue.includes(monNames[m])) {
                        monName = monNames[m];
                        break;
                    }
                }

                // Lưu vào tableData
                tableData[monName] = `Điểm: ${diemValue}`;
                methodData._metadata.inputCount++;
                console.log(
                    '[collectMethodDataDynamic] ✓ Collected:',
                    monName,
                    '=',
                    diemValue,
                );
            }
        });

        var $tables = $body.find('table');

        $tables.each(function () {
            var $table = $(this);

            var headers = [];
            $table.find('thead th').each(function () {
                var headerText = $(this).text().trim();
                if (headerText) {
                    headers.push(headerText);
                }
            });

            // Nếu không có header, tạo header mặc định
            if (headers.length === 0) {
                var firstRow = $table.find('tbody tr').first();
                var colCount = firstRow.find('td').length;
                for (var i = 0; i < colCount; i++) {
                    headers.push(i === 0 ? 'Môn' : `Cột ${i + 1}`);
                }
            }

            // Duyệt từng dòng trong tbody
            $table.find('tbody tr').each(function (rowIdx) {
                var $row = $(this);
                var $cells = $row.find('td');
                var rowData = {};
                var monName = '';
                var hasValidData = false;

                $cells.each(function (colIdx) {
                    var $cell = $(this);
                    var header = headers[colIdx] || `Cột ${colIdx + 1}`;
                    var value = '';

                    // Tìm tất cả input/select trong cell
                    var $inputs = $cell.find('input, select, textarea');

                    if ($inputs.length > 0) {
                        var multipleValues = [];
                        $inputs.each(function () {
                            var subValue = getInputValue($(this));
                            if (
                                subValue &&
                                subValue !== '' &&
                                subValue !== '0' &&
                                subValue !== '0.00'
                            ) {
                                multipleValues.push(subValue);
                            }
                        });
                        if (multipleValues.length > 0) {
                            value = multipleValues.join(', ');
                            hasValidData = true;
                        }
                    } else {
                        // score-pill
                        var $scorePill = $cell.find('.score-pill');
                        if ($scorePill.length) {
                            value = $scorePill.text().trim();
                            if (
                                value &&
                                value !== '0.00 điểm' &&
                                value !== '0.00'
                            ) {
                                hasValidData = true;
                            }
                        } else {
                            // text cell
                            value = $cell.text().trim();
                            if (
                                value &&
                                value !== '-' &&
                                value !== '' &&
                                value !== '0' &&
                                value !== '0.00'
                            ) {
                                hasValidData = true;
                            }
                        }
                    }

                    if (
                        colIdx === 0 &&
                        value &&
                        !value.includes('Nguyện vọng') &&
                        !value.includes('Tổ hợp')
                    ) {
                        monName = value;
                    } else if (
                        value &&
                        value !== '' &&
                        value !== '0' &&
                        value !== '0.00' &&
                        value !== '-'
                    ) {
                        rowData[header] = value;
                    }
                });

                if (
                    (monName || hasValidData) &&
                    Object.keys(rowData).length > 0
                ) {
                    var allScores = [];
                    for (var key in rowData) {
                        allScores.push(`${key}: ${rowData[key]}`);
                    }

                    var recordKey = monName;
                    if (!recordKey || recordKey.trim() === '') {
                        // không có tên môn, tìm key từ rowData
                        var keys = Object.keys(rowData);
                        if (keys.length > 0 && keys[0] !== 'Môn') {
                            recordKey = keys[0];
                        } else {
                            recordKey = `Mục ${rowIdx + 1}`;
                        }
                    }

                    tableData[recordKey] = allScores.join(' | ');
                    methodData._metadata.inputCount++;
                }
            });
        });

        // Thêm dữ liệu bảng vào methodData
        if (Object.keys(tableData).length > 0) {
            methodData['Bảng điểm'] = {
                _type: 'group',
                fields: tableData,
            };
        }

        var $allInputs = $body
            .find('input, select, textarea')
            .not(
                $body.find(
                    'table input, table select, table textarea, .nguyen-vong-item input, .nguyen-vong-item select, .doi-tuong-checkbox',
                ),
            );
        var generalFields = {};

        // Danh sách các select đã được collect vào tableData
        var collectedSelectValues = [];
        for (var tkey in tableData) {
            if (tableData[tkey].includes('Điểm:')) {
                collectedSelectValues.push(tkey);
            }
        }

        $allInputs.each(function () {
            var $input = $(this);

            if ($input.attr('type') === 'hidden') return;
            if ($input.hasClass('phuongthuc-checkbox')) return;
            if ($input.hasClass('doi-tuong-checkbox')) return;

            var label = getInputLabel($input);
            var value = getInputValue($input);

            if ($input.is('select')) {
                var selectText = $input.find('option:selected').text().trim();
                for (var cs = 0; cs < collectedSelectValues.length; cs++) {
                    if (
                        selectText.includes(collectedSelectValues[cs]) ||
                        collectedSelectValues[cs].includes(selectText)
                    ) {
                        return;
                    }
                }
            }

            if (
                value &&
                value !== '' &&
                value !== '0' &&
                value !== '0.00' &&
                !shouldSkipField(label)
            ) {
                if (label === 'Thông tin') {
                    label = $input.attr('name') || $input.attr('id') || label;
                }
                generalFields[label] = value;
                methodData._metadata.inputCount++;
            }
        });

        if (Object.keys(tableData).length > 0) {
            methodData['Bảng điểm'] = {
                _type: 'group',
                fields: tableData,
            };
        }

        if (Object.keys(generalFields).length > 0) {
            methodData['Thông tin'] = {
                _type: 'group',
                fields: generalFields,
            };
        }

        // Đối tượng tuyển thẳng
        var doiTuongChecked = [];
        $body.find('.doi-tuong-checkbox:checked').each(function () {
            var $checkbox = $(this);
            var $li = $checkbox.closest('li');
            var text = '';

            if ($li.length) {
                text = $li.find('.doi-tuong-span').text() || $li.text();
            } else {
                text = $checkbox
                    .closest('.d-flex')
                    .find('.doi-tuong-span')
                    .text();
            }

            text = text.trim();
            if (text) {
                doiTuongChecked.push(text);
            }
        });

        if (doiTuongChecked.length > 0) {
            methodData['Đối tượng tuyên thẳng'] = {
                _type: 'list',
                items: doiTuongChecked.map(function (text) {
                    return { name: text };
                }),
            };
            methodData._metadata.inputCount += doiTuongChecked.length;
        }

        return methodData;
    }

    // lấy file inputs
    function collectFileInputs($container) {
        var files = {};

        $container.find('input[type="file"]').each(function () {
            var $input = $(this);
            var fileInput = this;
            var label = getInputLabel($input);

            if (fileInput.files && fileInput.files.length > 0) {
                var file = fileInput.files[0];
                files[label] = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                };
            }
        });

        return files;
    }

    // dữ liệu từ form xét tuyển
    function collectXetTuyenFormDynamic() {
        var data = {};

        // dữ liệu từ localStorage nếu có
        var existingData = null;
        try {
            var saved = localStorage.getItem('XetTuyenForm');
            if (saved) {
                existingData = JSON.parse(saved);
                console.log(
                    '[collectXetTuyenFormDynamic] Loaded existing data from localStorage',
                );
                console.log(
                    '[collectXetTuyenFormDynamic] Existing methods:',
                    existingData.checkedTabs,
                );
            }
        } catch (e) {
            console.warn(
                '[collectXetTuyenFormDynamic] Could not parse existing data:',
                e,
            );
        }

        // merge với dữ liệu cũ nếu có
        var formData = {
            checkedTabs: existingData ? existingData.checkedTabs || [] : [],
            tabsData: existingData ? existingData.tabsData || {} : {},
            _collectedAt: new Date().toISOString(),
        };

        var containers = $('.phuongthuc-container');

        containers.each(function () {
            var $container = $(this);
            var $checkbox = $container.find('.phuongthuc-checkbox');
            var $header = $container.find('.phuongthuc-header');
            var methodName = $header.find('span:first').text().trim();
            var isChecked = $checkbox.is(':checked');

            if (isChecked) {
                // Thêm vào checkedTabs
                if (formData.checkedTabs.indexOf(methodName) === -1) {
                    formData.checkedTabs.push(methodName);
                }

                // dữ liệu động từ container
                var methodData = collectMethodDataDynamic($container);

                // Thu thập file inputs
                var files = collectFileInputs($container);
                if (Object.keys(files).length > 0) {
                    methodData._files = files;
                }

                if (
                    Object.keys(methodData).length > 1 ||
                    Object.keys(methodData._files || {}).length > 0
                ) {
                    formData.tabsData[methodName] = methodData;
                } else {
                    formData.tabsData[methodName] = { _empty: true };
                }
            } else {
                // Xóa nếu unchecked
                var idx = formData.checkedTabs.indexOf(methodName);
                if (idx > -1) {
                    formData.checkedTabs.splice(idx, 1);
                    delete formData.tabsData[methodName];
                }
            }
        });

        if (formData.checkedTabs.length > 0) {
            data['XetTuyenForm'] = JSON.stringify(formData);
        } else {
            data['XetTuyenForm'] = '';
        }

        return data;
    }

    function collectTab(idx) {
        var tab = tabs[idx];
        var d = {};

        if (tab.tabKey === 'ThongTinXetTuyen') {
            return collectXetTuyenFormDynamic();
        }

        $.each(tab.fields, function (_, f) {
            if (
                f.isParent ||
                f.fieldType === 7 ||
                f.fieldType === 11 ||
                f.fieldType === 13
            )
                return;
            d[f.maDanhMuc] = getVal(f);
        });
        return d;
    }

    // Hàm render dữ liệu xét tuyển động - DẠNG BẢNG
    // Hàm render dữ liệu xét tuyển động - DESIGN THEO ẢNH
    function renderMethodDataDynamic(
        methodName,
        methodData,
        $methodsContainer,
    ) {
        var $methodSection = $(
            '<div class="df-review-method-item" style="background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"></div>',
        );

        var $methodHeader = $(
            '<div class="df-review-method-header" style="margin-bottom: 24px;"></div>',
        );
        $methodHeader.append(
            `<span class="df-method-name" style="font-weight: 600; font-size: 16px; color: #2c3e50;">${esc(methodName)}</span>`,
        );
        $methodSection.append($methodHeader);

        var hasData = false;

        function shouldSkipField(label) {
            if (!label) return false;
            var lowerLabel = String(label).toLowerCase();
            return (
                lowerLabel.includes('applyhktt') ||
                lowerLabel.includes('áp dụng theo hộ khẩu') ||
                lowerLabel === 'applyhktt'
            );
        }

        // nguyện vọng
        var nguyen_vong = methodData['Nguyện vọng'];
        if (
            nguyen_vong &&
            nguyen_vong._type === 'list' &&
            nguyen_vong.items &&
            nguyen_vong.items.length > 0
        ) {
            var $wishSection = $(
                '<div class="df-wish-section" style="margin-bottom: 28px;"></div>',
            );
            $wishSection.append(
                `<div class="df-section-title-ttxt">Nguyện Vọng</div>`,
            );

            var $wishContainer = $(
                '<div style="display: flex; flex-wrap: wrap; gap: 12px;"></div>',
            );

            $.each(nguyen_vong.items, function (idx, item) {
                // Lấy tên ngành từ field "Ngành"
                var wishName = item['Ngành'] || '';
                var toHopMon = item['Tổ hợp môn'] || '';
                var diem = item['Điểm'] || '';

                if (wishName) {
                    var wishCard = `
                        <div style="background: #fff; border: 1px solid #d0dcff; border-radius: 8px; padding: 12px; min-width: 280px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                                <span style="background: #3366cc; color: #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${idx + 1}</span>
                                <span style="color: #2c3e50; font-size: 14px; font-weight: 600;">${esc(wishName)}</span>
                            </div>
                    `;

                    if (toHopMon) {
                        wishCard += `
                            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
                                <span style="color: #999;">Tổ hợp:</span> ${esc(toHopMon)}
                            </div>
                        `;
                    }

                    if (diem && diem !== '0.00 điểm') {
                        wishCard += `
                            <div style="font-size: 13px; font-weight: 600; color: #28a745;">
                                Tổng: ${esc(diem)}
                            </div>
                        `;
                    }

                    wishCard += `</div>`;
                    $wishContainer.append(wishCard);
                    hasData = true;
                }
            });

            $wishSection.append($wishContainer);

            $methodSection.append($wishSection);
        }

        // table điểm
        var bangDiem = methodData['Bảng điểm'];
        if (bangDiem && bangDiem._type === 'group' && bangDiem.fields) {
            // Trước tiên, check xem có dòng dữ liệu hợp lệ không
            var hasValidRows = false;
            for (var mon in bangDiem.fields) {
                var value = bangDiem.fields[mon];

                if (!value || value.trim() === '') continue;

                var diemValue = value;
                if (value.includes('|')) {
                    var parts = value.split('|');
                    diemValue = parts[0].trim();
                }

                if (diemValue.includes(':')) {
                    var diemParts = diemValue.split(':');
                    diemValue = diemParts[1].trim();
                }

                // Check nếu điểm là số
                if (diemValue && !isNaN(parseFloat(diemValue))) {
                    hasValidRows = true;
                    break;
                }
            }

            // Chỉ render bảng nếu có dòng dữ liệu hợp lệ
            if (!hasValidRows) {
                console.log(
                    '[renderMethodDataDynamic] No valid score rows, skipping table',
                );
            } else {
                var $tableSection = $(
                    '<div class="df-table-section" style="margin-bottom: 28px;"></div>',
                );

                $tableSection.append(
                    `<div class="df-section-title-ttxt">Thông Tin Đăng Ký</div>`,
                );

                var $scoreTable = $(
                    '<table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e8ecf1; border-radius: 8px; overflow: hidden;"></table>',
                );

                // mHeader môn và Điểm
                $scoreTable.append(`
                    <thead>
                        <tr style="background: #f0f4ff;">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 1px solid #d0dcff;">Môn</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600; color: #666; border-bottom: 1px solid #d0dcff;">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                `);

                // Duyệt từng môn
                for (var mon in bangDiem.fields) {
                    var value = bangDiem.fields[mon];

                    if (!value || value.trim() === '') continue;

                    var diemValue = value;
                    if (value.includes('|')) {
                        var parts = value.split('|');
                        diemValue = parts[0].trim(); // Lấy phần đầu tiên
                    }

                    if (diemValue.includes(':')) {
                        var diemParts = diemValue.split(':');
                        diemValue = diemParts[1].trim();
                    }

                    if (!diemValue || isNaN(parseFloat(diemValue))) {
                        console.log(
                            '[renderMethodDataDynamic] Skipping non-numeric score:',
                            diemValue,
                        );
                        continue;
                    }

                    // Tạo dòng
                    $scoreTable.append(`
                        <tr style="border-bottom: 1px solid #e8ecf1;">
                            <td style="padding: 10px 12px; font-weight: 500; color: #2c3e50;">${esc(mon)}</td>
                            <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: #28a745;">${esc(diemValue)}</td>
                        </tr>
                    `);
                    hasData = true;
                }

                $scoreTable.append('</tbody></table>');
                $tableSection.append($scoreTable);
                $methodSection.append($tableSection);
            }
        }

        var thong_tin = methodData['Thông tin'];
        if (thong_tin && thong_tin._type === 'group' && thong_tin.fields) {
            var $infoSection = $(
                '<div class="df-info-section" style="margin-bottom: 28px;"></div>',
            );
            $infoSection.append(
                `<div class="df-section-title-ttxt">Thông Tin Đăng Ký</div>`,
            );
            var scoreFields = {};
            var regularFields = {};

            if (
                typeof thong_tin.fields === 'object' &&
                !Array.isArray(thong_tin.fields)
            ) {
                for (var label in thong_tin.fields) {
                    if (!label.startsWith('_') && !shouldSkipField(label)) {
                        if (label === 'Ngành' || label === 'Tổ hợp môn') {
                            continue;
                        }

                        var value = thong_tin.fields[label];
                        if (value && value !== '' && value !== '-') {
                            var isScore =
                                !isNaN(parseFloat(value)) &&
                                value.trim() !== '';
                            if (isScore) {
                                scoreFields[label] = value;
                            } else {
                                regularFields[label] = value;
                            }
                        }
                    }
                }
            }

            if (Object.keys(regularFields).length > 0) {
                var $regularGrid = $(
                    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 16px;"></div>',
                );

                for (var rLabel in regularFields) {
                    var rValue = regularFields[rLabel];
                    $regularGrid.append(`
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 14px; border: 1px solid #e8ecf1;">
                            <div style="font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">${esc(rLabel)}</div>
                            <div style="font-size: 14px; font-weight: 500; color: #2c3e50;">${esc(rValue)}</div>
                        </div>
                    `);
                    hasData = true;
                }

                $infoSection.append($regularGrid);
            }

            // Render score fields dạng table
            if (Object.keys(scoreFields).length > 0) {
                var $scoreTable = $(
                    '<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 12px;">',
                );

                // Thêm header
                var $thead = $('<thead>');
                $thead.append(`
                    <tr style="background: #f0f4ff; border-bottom: 2px solid #d0dcff;">
                        <th style="padding: 10px; text-align: left; font-weight: 600; color: #666;">Môn</th>
                        <th style="padding: 10px; text-align: center; font-weight: 600; color: #666;">Điểm</th>
                    </tr>
                `);
                $scoreTable.append($thead);

                // Thêm body
                var $tbody = $('<tbody>');
                for (var sLabel in scoreFields) {
                    var sValue = scoreFields[sLabel];
                    $tbody.append(`
                        <tr style="border-bottom: 1px solid #e8ecf1;">
                            <td style="padding: 10px; color: #2c3e50;">${esc(sLabel)}</td>
                            <td style="padding: 10px; text-align: center; border-radius: 4px; font-weight: 600; color: var(--color-text-primary);">${esc(sValue)}</td>
                        </tr>
                    `);
                    hasData = true;
                }
                $scoreTable.append($tbody);
                $scoreTable.append('</table>');

                $infoSection.append($scoreTable);
            }

            if (hasData) {
                $methodSection.append($infoSection);
            }
        }

        // đối tượng tuyển thẳng
        var doiTuong = methodData['Đối tượng tuyên thẳng'];
        if (
            doiTuong &&
            doiTuong._type === 'list' &&
            doiTuong.items &&
            doiTuong.items.length > 0
        ) {
            var $doiTuongSection = $(
                '<div class="df-doi-tuong-section" style="margin-bottom: 28px;"></div>',
            );
            $doiTuongSection.append(
                `<div class="df-section-title" style="font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: #999; text-transform: uppercase; margin-bottom: 12px;">Đối Tượng Tuyên Thẳng</div>`,
            );

            var $doiTuongList = $(
                '<div style="display: flex; flex-direction: column; gap: 8px;"></div>',
            );

            $.each(doiTuong.items, function (idx, item) {
                $doiTuongList.append(`
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #2c3e50;">
                        <span style="color: #28a745; font-weight: 600;">✓</span>
                        <span>${esc(item.name)}</span>
                    </div>
                `);
                hasData = true;
            });

            $doiTuongSection.append($doiTuongList);
            $methodSection.append($doiTuongSection);
        }

        // học phần
        var hoc_phan = methodData['Học phần'];
        if (
            hoc_phan &&
            hoc_phan._type === 'list' &&
            hoc_phan.items &&
            hoc_phan.items.length > 0
        ) {
            var $eduSection = $(
                '<div class="df-edu-section" style="margin-top: 28px;"></div>',
            );
            $eduSection.append(
                `<div class="df-section-title" style="font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: #999; text-transform: uppercase; margin-bottom: 12px;">Học Phần Liên Thông</div>`,
            );

            var $eduContainer = $(
                '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;"></div>',
            );

            $.each(hoc_phan.items, function (idx, item) {
                var eduName = '';
                for (var key in item) {
                    if (!key.startsWith('_') && !shouldSkipField(key)) {
                        eduName = item[key];
                        break;
                    }
                }

                if (eduName) {
                    $eduContainer.append(`
                        <div style="background: #f0f4ff; border-radius: 8px; padding: 12px; border: 1px solid #d0dcff;">
                            <span style="color: #2c3e50; font-size: 14px;">${esc(eduName)}</span>
                        </div>
                    `);
                    hasData = true;
                }
            });

            $eduSection.append($eduContainer);
            $methodSection.append($eduSection);
        }

        if (methodData._files && Object.keys(methodData._files).length > 0) {
            var $fileSection = $(
                '<div class="df-file-section" style="margin-top: 28px;"></div>',
            );
            $fileSection.append(
                '<div class="df-section-title" style="font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: #999; text-transform: uppercase; margin-bottom: 12px;">📎 Tệp Đính Kèm</div>',
            );

            var $filesGrid = $(
                '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;"></div>',
            );

            $.each(methodData._files, function (label, file) {
                if (!shouldSkipField(label)) {
                    $filesGrid.append(`
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; border: 1px solid #e8ecf1;">
                            <div style="font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">${esc(label)}</div>
                            <div style="font-size: 13px; font-weight: 500; color: #2c3e50;">
                                📄 ${esc(file.name)}
                                <div style="font-size: 11px; color: #999; margin-top: 4px;">${(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                    `);
                    hasData = true;
                }
            });

            if (hasData) {
                $fileSection.append($filesGrid);
                $methodSection.append($fileSection);
            }
        }

        if (hasData) {
            $methodsContainer.append($methodSection);
        } else {
            var $emptyMsg = $(
                '<div style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; color: #999; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"></div>',
            );
            $emptyMsg.html('<em>Không có dữ liệu nhập</em>');
            $methodsContainer.append($emptyMsg);
        }
    }
    function buildReviewPanel(reviewTab) {
        var $panel = $('<div class="df-review-panel"></div>');

        var $mainContainer = $('<div class="df-review-content"></div>');

        function getFieldValue(field) {
            var savedValue = savedValues[field.maDanhMuc];

            if (
                (field.fieldType === 8 || field.fieldType === 9) &&
                savedValue
            ) {
                if (typeof savedValue === 'object' && savedValue.fileName) {
                    return savedValue.fileName;
                }
                return savedValue;
            }

            return savedValue || '';
        }

        var sectionNum = 1;
        $.each(tabs, function (tabIdx, tab) {
            if (tab.isReviewTab) return;

            // Xử lý tab xét tuyển
            if (tab.tabKey === 'ThongTinXetTuyen') {
                var xetTuyenData = savedValues['XetTuyenForm'];

                // Nếu chưa có dữ liệu, collect ngay
                if (!xetTuyenData || xetTuyenData === '') {
                    var collectedData = collectXetTuyenFormDynamic();
                    xetTuyenData = collectedData['XetTuyenForm'];
                    if (xetTuyenData) {
                        savedValues['XetTuyenForm'] = xetTuyenData;
                    }
                }

                if (!xetTuyenData || xetTuyenData === '') {
                    return;
                }

                try {
                    var formData = JSON.parse(xetTuyenData);
                    var checkedTabs = formData.checkedTabs || [];
                    var tabsData = formData.tabsData || {};

                    if (checkedTabs.length === 0) {
                        return;
                    }

                    var $mainSection = $(
                        '<div class="df-review-section"></div>',
                    );
                    var $mainHeader = $(
                        '<div class="df-review-section-header"></div>',
                    );
                    $mainHeader.append(
                        `<span class="df-section-number">${sectionNum}</span>
                         <span class="df-section-title">Thông tin xét tuyển</span>`,
                    );
                    $mainSection.append($mainHeader);

                    var $methodsContainer = $(
                        '<div class="df-review-methods-container"></div>',
                    );

                    $.each(checkedTabs, function (index, methodName) {
                        console.log(
                            '[buildReviewPanel] Rendering method:',
                            methodName,
                        );
                        var methodData = tabsData[methodName] || {};
                        renderMethodDataDynamic(
                            methodName,
                            methodData,
                            $methodsContainer,
                        );
                    });

                    if ($methodsContainer.children().length > 0) {
                        $mainSection.append($methodsContainer);
                        $mainContainer.append($mainSection);
                        sectionNum++;
                    }
                } catch (e) {
                    console.error(
                        '[buildReviewPanel] Error parsing xet tuyen data',
                        e,
                    );
                }

                return;
            }

            var $section = $('<div class="df-review-section"></div>');

            // Section header
            var $sectionHeader = $(
                '<div class="df-review-section-header"></div>',
            );
            $sectionHeader.append(
                `<span class="df-section-number">
                    ${sectionNum}
                </span>
                <span class="df-section-title">
                    ${esc(tab.tabLabel)}
                </span>`,
            );
            $section.append($sectionHeader);

            var $grid = $('<div class="df-review-items-grid"></div>');
            var hasContent = false;
            var groupedFields = {};
            var childFieldIds = {};

            $.each(tab.fields, function (_, field) {
                if (field.maDanhMuc === 'ApplyHKTT') return;
                if (field.maDanhMuc === 'ApDungNOHTTheoHKTT') return;
                if (field.parentField === 'ApplyHKTT') return;
                if (field.parentField === 'ApDungNOHTTheoHKTT') return;
                if (field.isParent && field.isVisible) {
                    var childFields = $.grep(tab.fields, function (f) {
                        return (
                            !f.isParent &&
                            f.parentField === field.maDanhMuc &&
                            f.isVisible &&
                            f.maDanhMuc !== 'ApplyHKTT' &&
                            f.maDanhMuc !== 'ApDungNOHTTheoHKTT' &&
                            f.fieldType !== 7 &&
                            f.fieldType !== 11 &&
                            f.fieldType !== 13
                        );
                    });

                    if (childFields.length > 0) {
                        groupedFields[field.maDanhMuc] = {
                            title: field.tenDanhMuc,
                            fields: childFields,
                        };

                        $.each(childFields, function (_, f) {
                            childFieldIds[f.maDanhMuc] = true;
                        });
                    }
                }
            });

            $.each(tab.fields, function (_, field) {
                if (field.maDanhMuc === 'ApplyHKTT') return;
                if (field.maDanhMuc === 'ApDungNOHTTheoHKTT') return;
                if (
                    field.fieldType === 7 ||
                    field.fieldType === 11 ||
                    field.fieldType === 13 ||
                    !field.isVisible ||
                    field.isParent
                ) {
                    return;
                }

                if (childFieldIds[field.maDanhMuc]) {
                    return;
                }

                var fieldValue = getFieldValue(field);
                if (!fieldValue) {
                    fieldValue = '-';
                }

                var $item = $('<div class="df-review-item"></div>');
                $item.append(
                    '<div class="df-review-label">' +
                        esc(field.tenDanhMuc) +
                        '</div>',
                );
                $item.append(
                    `<div class="df-review-value">
                        ${esc(fieldValue)}
                    </div>`,
                );
                $grid.append($item);
                hasContent = true;
            });

            $.each(groupedFields, function (key, group) {
                if (key === 'ApplyHKTT') return;
                if (key === 'ApDungNOHTTheoHKTT') return;
                var $groupBox = $('<div class="df-review-group-box"></div>');

                $groupBox.append(
                    `<div class="df-review-group-title">
                        ${esc(group.title)}
                    </div>`,
                );

                var $groupItems = $(
                    '<div class="df-review-group-items"></div>',
                );
                $.each(group.fields, function (_, field) {
                    if (field.maDanhMuc === 'ApplyHKTT') return;
                    if (field.maDanhMuc === 'ApDungNOHTTheoHKTT') return;
                    var fieldValue = getFieldValue(field);
                    if (!fieldValue) {
                        fieldValue = '-';
                    }

                    var $item = $('<div class="df-review-item"></div>');
                    $item.append(
                        `<div class="df-review-label">
                            ${esc(field.tenDanhMuc)}
                        </div>`,
                    );
                    $item.append(
                        `<div class="df-review-value">
                            ${esc(fieldValue)}
                        </div>`,
                    );
                    $groupItems.append($item);
                });

                $groupBox.append($groupItems);
                $grid.append($groupBox);
                hasContent = true;
            });

            if (hasContent) {
                $section.append($grid);
                $mainContainer.append($section);
                sectionNum++;
            }
        });

        $panel.append($mainContainer);
        // captcha
        var $finalSection = $('<div class="df-review-section"></div>');
        var $finalHeader = $('<div class="df-review-section-header"></div>');
        $finalHeader.append(
            `<span class="df-section-number">
                ${sectionNum}.
            </span>
            <span class="df-section-title">
                ${esc(reviewTab.tabLabel)}
            </span>`,
        );
        $finalSection.append($finalHeader);
        $mainContainer.append($finalSection);

        var $footer = $(`<div class="df-review-footer"></div>`);

        var $subFooter = $(`<div class="df-review-sub-footer"></div>`);

        var $captchaSection = $('<div class="df-captcha-section"></div>');
        $captchaSection.append(
            `
                <div class="df-captcha-header">
                    <div class="df-confirm-checkbox">
                        <input type="checkbox" id="df-confirm-review" />
                        <div class="df-captcha-heading">Tôi cam đoan những thông tin trên đúng sự thật</div>
                    </div>
                     <div class="df-captcha-description">
                        Vui lòng lòng kiểm tra kỹ mọi thông tin trước khi xác nhận. Thông tin không chính xác có thể ảnh hưởng đến kết quả xét tuyển.
                    </div>
                  </div>`,
        );
        $captchaSection.append(
            `<div class="df-captcha-content">
                   
                    <div class="df-captcha-input-wrapper">
                        <div class="df-captcha-input-box">
                            <input type="text" id="df-captcha-input" class="df-captcha-field" placeholder="Nhập mã" />
                            <div class="capcha-code">
                              <div class="df-captcha-code" id="df-captcha-code">AB07</div>
                              <div class="df-captcha-refresh" id="df-captcha-refresh">
                                  <i class="fa fa-refresh" aria-hidden="true"></i>
                              </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <span class="df-captcha-note">Lưu ý: Mã bảo vệ chỉ nhập 1 lần. Nếu sai, vui lòng nhấn nút làm mới để tạo mã khác. Hệ thống không cho phép sửa ký tự sai.</span>
            `,
        );
        $subFooter.append($captchaSection);
        $footer.append($subFooter);
        $panel.append($footer);

        return $panel;
    }

    function bindNav() {
        $('#df-btn-back')
            .off('click')
            .on('click', function () {
                if (curTabIdx > 0) renderTab(curTabIdx - 1);
                else window.history.back();
            });

        $('#df-btn-next')
            .off('click')
            .on('click', function () {
                if (!validateTab(curTabIdx)) {
                    var $first = $('.is-invalid').first();
                    if ($first.length)
                        $('html,body').animate(
                            { scrollTop: $first.offset().top - 90 },
                            280,
                        );
                    return;
                }

                var data = collectTab(curTabIdx);
                $.extend(savedValues, data);

                tabs[curTabIdx].isSeen = true;
                tabs[curTabIdx].isCompleted = evalTabCompleted(
                    tabs[curTabIdx],
                    true,
                );
                persistSnapshotIfEnabled();

                if (curTabIdx < tabs.length - 1) {
                    renderTab(curTabIdx + 1);
                } else {
                    if (
                        tabs.every(function (t) {
                            return t.isCompleted;
                        })
                    ) {
                        //syncSidebarStep(curTabIdx);
                        showMessage('Đăng ký thành công!', 'Thành công');
                    } else {
                        showMessage(
                            'Vui lòng nhập đầy đủ thông tin!!',
                            'Thiếu thông tin',
                        );
                        $.each(tabs, function (index, tab) {
                            if (!tab.isCompleted) {
                                window.dfGoToTab(index);
                                if (!validateTab(index)) {
                                    var $first = $('.is-invalid').first();
                                    if ($first.length)
                                        $('html,body').animate(
                                            {
                                                scrollTop:
                                                    $first.offset().top - 90,
                                            },
                                            280,
                                        );
                                    return;
                                }
                                return false;
                            }
                        });
                    }
                }
            });
    }

    function bindGlobalEvents() {
        bindNav();
        bindPopupTriggers();
        bindFilePickers();
        bindNumericSpinners();
        bindActionDelete();
        bindFormValueAutoSave();

        $(document)
            .off('click.dfStep', '#df-sidebar-steps .step-item')
            .on('click.dfStep', '#df-sidebar-steps .step-item', function () {
                var idx = Number($(this).data('idx'));
                if (!Number.isNaN(idx) && window.dfGoToTab)
                    window.dfGoToTab(idx);
            });

        $('#df-popup-search-btn')
            .off('click')
            .on('click', function () {
                if (!popupCtx) return;
                popupCtx.page = 1;
                doPopupSearch($('#df-popup-keyword').val());
            });

        $('#df-popup-keyword')
            .off('keypress')
            .on('keypress', function (e) {
                if (e.which === 13) $('#df-popup-search-btn').trigger('click');
            });
    }

    function syncSidebarStep(idx) {
        $.each(tabs, function (i, t) {
            t.isCompleted = evalTabCompleted(t, i === idx);
        });

        $('#df-done-badge').toggle(!!tabs[idx].isCompleted);

        if (typeof window.dfUpdateSidebar === 'function') {
            window.dfUpdateSidebar(idx, tabs, flag_InitLanDau);
        }

        flag_InitLanDau = false;
    }

    function persistSnapshotIfEnabled() {
        if (cheDoLuu !== 2) return;
        try {
            var completed = tabs
                .filter(function (t) {
                    return t.isCompleted;
                })
                .map(function (t) {
                    return t.tabKey;
                });
            var payload = {
                version: 1,
                createdAt: Date.now(),
                expireAt: Date.now() + CAU_HINH_LUU.soNgayHetHan * 24 * 60 * 60 * 1000,
                data: {
                    savedValues: savedValues,
                    tabsCompleted: completed,
                    currentTabKey: tabs[curTabIdx] ? tabs[curTabIdx].tabKey : null,
                    typeCauHinh: typeCauHinh == null ? null : String(typeCauHinh),
                },
            };
            var raw = JSON.stringify(payload);
            var encrypted = maHoaNoiDung(raw, CAU_HINH_LUU.saltMaHoa);
            localStorage.setItem(getSnapshotStorageKey(), encrypted);
            syncSidebarStep(curTabIdx);
        } catch (e) {}
    }

    function loadSnapshot(tabsRef) {
        if (cheDoLuu !== 2) return {};
        try {
            var encrypted = localStorage.getItem(getSnapshotStorageKey());
            if (!encrypted) return {};
            var raw = giaiMaNoiDung(encrypted, CAU_HINH_LUU.saltMaHoa);
            var snap = JSON.parse(raw);

            if (!snap || !snap.expireAt || Date.now() > snap.expireAt) {
                localStorage.removeItem(getSnapshotStorageKey());
                return {};
            }

            if (snap && snap.data && Array.isArray(snap.data.tabsCompleted)) {
                $.each(snap.data.tabsCompleted, function (_, key) {
                    var found = tabsRef.find(function (t) {
                        return t.tabKey === key;
                    });
                    if (found) {
                        found.isCompleted = true;
                        found.isSeen = true;
                    }
                });
            }

            return snap && snap.data && snap.data.savedValues
                ? snap.data.savedValues
                : {};
        } catch (e) {
            localStorage.removeItem(getSnapshotStorageKey());
            return {};
        }
    }

    function maHoaNoiDung(raw, muoi) {
        return btoa(
            unescape(encodeURIComponent(String(muoi || '') + '|' + raw)),
        );
    }

    function giaiMaNoiDung(encoded, muoi) {
        var decoded = decodeURIComponent(escape(atob(encoded)));
        var prefix = String(muoi || '') + '|';
        if (decoded.indexOf(prefix) === 0)
            return decoded.substring(prefix.length);
        return decoded;
    }

    function esc(s) {
        return s == null
            ? ''
            : String(s)
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;');
    }

    function lbl(f) {
        return (
            '<label class="df-label" id="' +
            labelId(f) +
            '" for="' +
            inputId(f) +
            '">' +
            esc(f.tenDanhMuc) +
            (f.isRequired ? '<span style="color:red;"> *</span>' : '') +
            '</label>'
        );
    }

    function inputName(f) {
        return String(f && f.maDanhMuc ? f.maDanhMuc : '');
    }
    function inputId(f) {
        return inputIdByKey(inputName(f));
    }
    function inputIdByKey(key) {
        return String(key || '').replace(/[^A-Za-z0-9_-]/g, '_');
    }
    function idSlug(key) {
        return String(key || '')
            .replace(/[^A-Za-z0-9]+/g, '')
            .toLowerCase();
    }
    function colId(f) {
        return 'div' + String(inputName(f)).toLowerCase();
    }
    function labelId(f) {
        return 'lbl' + String(inputName(f)).toLowerCase();
    }
    function jqId(id) {
        return (
            '#' +
            String(id).replace(/([ #;?%&,.+*~':"!^$\[\]()=>|\/\\@@])/g, '\\$1')
        );
    }
    function hasActionSource(f) {
        return !!(f && f.actionName);
    }
    function normalizeOpt(o) {
        if (!o) return { value: '', text: '' };
        var value = o.value;
        if (value === undefined || value === null) value = o.id;
        if (value === undefined || value === null) value = o.ID;
        if (value === undefined || value === null) value = o.ma;

        var text = o.text;
        if (!text) text = o.ten;
        if (!text) text = o.Ten;
        if (!text) text = o.name;

        return {
            value: value == null ? '' : String(value),
            text: text == null ? '' : String(text),
        };
    }

    function ph(f) {
        return f.placeHolder ? ' placeholder="' + esc(f.placeHolder) + '"' : '';
    }
    function ml(f) {
        return f.maxLength ? ' maxlength="' + f.maxLength + '"' : '';
    }
    function ro(f) {
        return f.readOnly ? ' readonly' : '';
    }

    $(document).on('DOMNodeInserted', function (e) {
        var $target = $(e.target);

        // Khi RazorLogicChinhQuy được load, init collection
        if ($target.find('.phuongthuc-container').length > 0) {
            console.log(
                '[Auto-Init] Xét tuyển form detected, initializing collectors...',
            );

            // Đợi form render xong
            setTimeout(function () {
                initXetTuyenCollectors();
            }, 500);
        }
    });

    function initXetTuyenCollectors() {
        // checkbox changes
        $(document)
            .off('change.xettuyen')
            .on('change.xettuyen', '.phuongthuc-checkbox', function () {
                var $container = $(this).closest('.phuongthuc-container');

                setTimeout(function () {
                    collectAndSaveXetTuyenData();
                }, 200);
            });

        // Lắng nghe input changes trong form xét tuyển
        $(document)
            .off('change.xettuyen-input')
            .on(
                'change.xettuyen-input',
                '.phuongthuc-body input, .phuongthuc-body select, .phuongthuc-body textarea',
                function () {
                    if (window.xetTuyenCollectTimer) {
                        clearTimeout(window.xetTuyenCollectTimer);
                    }
                    window.xetTuyenCollectTimer = setTimeout(function () {
                        collectAndSaveXetTuyenData();
                    }, 800);
                },
            );
    }

    function collectAndSaveXetTuyenData() {
        try {
            // dữ liệu từ localStorage
            var existingData = null;
            try {
                var saved = localStorage.getItem('XetTuyenForm');
                if (saved) {
                    existingData = JSON.parse(saved);
                }
            } catch (e) {}

            var formData = {
                checkedTabs: existingData ? existingData.checkedTabs || [] : [],
                tabsData: existingData ? existingData.tabsData || {} : {},
                _collectedAt: new Date().toISOString(),
            };

            var containers = $('.phuongthuc-container');

            containers.each(function () {
                var $container = $(this);
                var $checkbox = $container.find('.phuongthuc-checkbox');
                var $header = $container.find('.phuongthuc-header');
                var methodName = $header.find('span:first').text().trim();
                var isChecked = $checkbox.is(':checked');

                if (isChecked) {
                    // Thêm vào checkedTabs
                    if (formData.checkedTabs.indexOf(methodName) === -1) {
                        formData.checkedTabs.push(methodName);
                    }

                    var methodData = collectMethodDataDynamic($container);

                    // file inputs
                    var files = collectFileInputs($container);
                    if (Object.keys(files).length > 0) {
                        methodData._files = files;
                    }

                    formData.tabsData[methodName] = methodData;
                } else {
                    // Xóa khỏi danh sách nếu unchecked
                    var idx = formData.checkedTabs.indexOf(methodName);
                    if (idx > -1) {
                        formData.checkedTabs.splice(idx, 1);
                        delete formData.tabsData[methodName];
                    }
                }
            });

            // Lưu vào localStorage
            if (formData.checkedTabs.length > 0) {
                localStorage.setItem('XetTuyenForm', JSON.stringify(formData));
            }
        } catch (e) {
            console.error('[collectAndSaveXetTuyenData] Error:', e);
        }
    }
});
