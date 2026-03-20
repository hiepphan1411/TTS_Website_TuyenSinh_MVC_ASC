$(function () {
    var STORAGE_KEY = 'xettuyen_local_form_data';
    var flag_InitLanDau = true;
    var rawDanhMuc;
    try {
        rawDanhMuc = JSON.parse($('#form-config-data').text() || '[]');
    } catch (e) {
        $('#df-wrapper').html('<div class="alert alert-danger">Lỗi tải cấu hình form.</div>');
        return;
    }

    var tabs = buildTabs(rawDanhMuc || []);
    //var savedValues = loadLocalSnapshot();
    var savedValues = {};
    var curTabIdx = 0;
    var popupCtx = null;
    var tabDomCache = {};
    var $activePanel = null;

    renderShell();
    bindGlobalEvents();
    renderTab(0);

    function buildTabs(records) {
        var byTab = {};
        $.each(records, function (_, rec) {
            var tabKey = rec.text02 || 'ThongTinChung';
            if (!byTab[tabKey]) {
                byTab[tabKey] = {
                    tabKey: tabKey,
                    tabLabel: getTabLabel(tabKey),
                    tabIndex: Object.keys(byTab).length,
                    isCompleted: false,
                    isSeen: false,
                    fields: []
                };
            }
            byTab[tabKey].fields.push(mapField(rec));
        });

        var result = Object.keys(byTab).map(function (k) { return byTab[k]; });
        $.each(result, function (_, tab) {
            tab.fields.sort(function (a, b) { return (a.stt || 0) - (b.stt || 0); });
        });
        return result;
    }

    function mapField(rec) {
        var col = parseInt(rec.text05 || rec.text03 || 12, 10);
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
            })()
        };
    }



    function getTabLabel(tabKey) {
        switch (tabKey) {
            case 'ThongTinThiSinh': return 'Thông tin thí sinh';
            case 'ThongTinDangKy': return 'Thông tin đăng ký';
            case 'QuaTrinhDaoTao': return 'Quá trình đào tạo';
            case 'ThongTinNguoiGioiThieu': return 'Thông tin người giới thiệu';
            case 'ThongTinKhac': return 'Thông tin khác';
            case 'ChungChiNgoaiNgu': return 'Chứng chỉ ngoại ngữ';
            case 'ThongTinXetTuyen': return 'Thông tin xét tuyển';
            case 'ThongTinKhaoSat': return 'Thông tin khảo sát';
            case 'HoanTatDangKy': return 'Hoàn tất đăng ký';
            case 'ThongTinChungChiNN': return 'Thông tin chứng chỉ ngoại ngữ';
            default: return tabKey;
        }
    }

    function renderShell() {
        $('#df-loading').remove();
        $('#df-wrapper').empty();

        if (!tabs.length) {
            $('#df-wrapper').html('<div class="alert alert-warning">Không có cấu hình biểu mẫu.</div>');
            return;
        }

        var $card = $('<div class="df-card"></div>');
        $card.append(
            '<div class="df-card-header">' +
            '<div>' +
            '<div class="df-card-title" id="df-tab-title"></div>' +
            '<div class="df-card-sub">Vui lòng điền chính xác thông tin theo giấy tờ tùy thân.</div>' +
            '</div > ' +
            '<span class="df-badge-done" id="df-done-badge" style="display:none">' +
            '<i class="bi bi-check-circle-fill"></i> Đã hoàn thành' + '</span > ' + '</div > ' + '<div id="df-fields-container"></div>' +
            '<div class="df-nav-bar">' +
            '<button class="df-btn-back" id="df-btn-back"><i class="bi bi-arrow-left me-1"></i> Quay về</button>' +
            '<button class="df-btn-next" id="df-btn-next">Hoàn thành &amp; tiếp tục <i class="bi bi-arrow-right ms-1"></i></button>' +
            '</div > '
        );
        $('#df-wrapper').append($card);
    }

    function renderTab(idx) {
        var prevIdx = curTabIdx;
        curTabIdx = idx;
        var tab = tabs[idx];

        if (!tab) return;

        if ($activePanel) {
            tabDomCache[tabs[prevIdx].tabKey] = $activePanel.detach();
        }

        $('#df-tab-title').text(tab.tabLabel);
        $('#df-done-badge').toggle(!!tab.isCompleted);

        var $next = $('#df-btn-next');
        var isLast = idx === tabs.length - 1;
        $next.html(isLast
            ? 'Hoàn tất đăng ký <i class="bi bi-check-lg ms-1"></i>'
            : 'Hoàn thành &amp; tiếp tục <i class="bi bi-arrow-right ms-1"></i>');

        if (!tabDomCache[tab.tabKey]) {
            tabDomCache[tab.tabKey] = buildTabPanel(tab);
        }

        $activePanel = tabDomCache[tab.tabKey];
        $('#df-fields-container').empty().append($activePanel);

        restoreValues(tab.fields);
        bindCascade(tab.fields);
        loadInitialActionOptions(tab.fields);
        bindMultiselect(tab.fields);
        syncSidebarStep(idx);
    }

    window.dfGoToTab = function (idx) {
        if (typeof idx !== 'number') return;
        if (idx < 0 || idx >= tabs.length) return;
        tabs[idx].isSeen = true;
        renderTab(idx);
    };

    function buildTabPanel(tab) {
        var $panel = $('<div class="df-tab-panel"></div>');
        var childRendered = {};

        var ordered = $.grep(tab.fields, function (x) { return x.isVisible; })
            .sort(function (a, b) { return (a.stt || 0) - (b.stt || 0); });

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
                    return x.isVisible && !x.isParent && x.parentField === f.maDanhMuc;
                });

                if (!children.length) return;

                flushRoots();

                $.each(children, function (_, c) { childRendered[c.maDanhMuc] = true; });

                var legendId = 'lg' + idSlug(f.maDanhMuc);
                var $wrapper = $('<div class="col-md-12"></div>');
                var $fs = $('<fieldset class="reset-this redo-fieldset group-box" id="fs' + idSlug(f.maDanhMuc) + '"></fieldset>');
                $fs.append('<legend class="reset-this redo-legend float-none" id="' + legendId + '">' + esc(f.tenDanhMuc) + '</legend>');
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

    function renderFieldRows(fields, useLegacyGroup) {
        var $container = $(useLegacyGroup ? '<div class="form-group row "></div>' : '<div></div>');
        var $row = null;
        var usedCols = 0;

        $.each(fields, function (_, f) {
            var span = f.colSpan || 12;
            if (!$row || usedCols + span > 12) {
                if ($row) $container.append($row);
                $row = $('<div class="row mb-1"></div>');
                usedCols = 0;
            }

            var $col = $('<div class="col-md-' + span + '" id="' + colId(f) + '"></div>');
            $col.append(buildField(f));
            $row.append($col);
            usedCols += span;
        });

        if ($row) $container.append($row);
        return $container;
    }

    function buildField(f) {
        var $w = $('<div class="df-field-wrap" data-field="' + f.maDanhMuc + '"></div>');

        switch (f.fieldType) {
            case 1: $w.append(bTextBox(f)); break;
            case 2: $w.append(bCheckBox(f)); break;
            case 3: $w.append(bRadioBox(f)); break;
            case 4: $w.append(bComboBox(f)); break;
            case 5: $w.append(bNumeric(f)); break;
            case 6: $w.append(bDatePicker(f)); break;
            case 7: $w.append(bLabel(f)); break;
            case 8: $w.append(bImage(f)); break;
            case 9: $w.append(bFileAttach(f)); break;
            case 10: $w.append(bLink(f)); break;
            case 11: $w.append(bConfig(f)); break;
            case 12: $w.append(bPopup(f)); break;
            case 13: $w.append(bActionDelete(f)); break;
            case 14: $w.append(bMultiSelect(f)); break;
            default: $w.append(bTextBox(f));
        }
        if (f.isRequired) {
            $w.append('<div class="df-error" id="df-err-' + inputId(f) + '">Trường này là bắt buộc.</div>');
        }
        return $w;
    }

    //T1
    function bTextBox(f) {
        return lbl(f) +
            '<input type="text" id="' + inputId(f) + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" class="df-input" ' +
            ph(f) + ml(f) + ro(f) + ' />';
    }

    //T2
    function bCheckBox(f, o) {
        const cId = inputId(f);

        let h = `<div class="df-check-group" id="cg-${cId}">`;

        h += `
                    <label class="df-check-item" for="${cId}">
                        <input 
                            type="checkbox" 
                            id="${cId}" 
                            name="${inputName(f)}" 
                            data-field-key="${esc(f.maDanhMuc)}" 
                            value="false"
                        />
                        ${esc(f.tenDanhMuc)}
                    </label>

                    <input 
                        type="hidden" 
                        id="${cId}_hidden" 
                        name="${inputName(f)}_hidden" 
                        data-field-key="${esc(f.maDanhMuc)}"
                    />
                `;

        h += `</div>`;

        return h;
    }

    //T3
    function bRadioBox(f) {
        //Chưa có API get nên để tạm
        if (f.maDanhMuc === 'GioiTinh' && (!f.options || !f.options.length)) {
            f.options = [
                { value: 'Nam', text: 'Nam' },
                { value: 'Nữ', text: 'Nữ' }
            ];
        }

        var h = lbl(f) + '<div class="df-radio-group" id="rg-' + inputId(f) + '">';
        $.each(f.options || [], function (i, o) {
            var rId = inputId(f) + '_' + i;
            h += '<label class="df-radio-item">' +
                '<input type="radio" id="' + rId + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" value="' + esc(o.value) + '" />' +
                esc(o.text) + '</label > ';
        });
        h += '</div > ';
        return h;
    }

    //T4
    function bComboBox(f) {
        var h = lbl(f) +
            '<select id="' + inputId(f) + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" class="df-select" ' + (f.readOnly ? ' disabled' : '') + '>' +
            '<option value="">' + (f.placeHolder || '-- Chọn --') + '</option>';
        $.each(f.options || [], function (_, o) {
            h += '<option value="' + esc(o.value) + '">' + esc(o.text) + '</option>';
        });
        h += '</select>';
        return h;
    }

    //T5
    function bNumeric(f) {
        return lbl(f) +
            '<div class="df-numeric-wrap">' +
            '<input type="number" id="' + inputId(f) + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" class="df-input"' + ph(f) +
            (f.maxLength ? ' max="' + f.maxLength + '"' : '') + ro(f) + ' />' +
            '<div class="df-numeric-spin">' +
            '<button type="button" data-target="' + inputId(f) + '" data-dir="up">▲</button>' +
            '<button type="button" data-target="' + inputId(f) + '" data-dir="down">▼</button>' +
            '</div>' +
            '</div>';
    }

    //T6
    function bDatePicker(f) {
        return lbl(f) +
            '<div class="df-date-wrap">' +
            '<input type="date" id="' + inputId(f) + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" class="df-input"' + ro(f) + ' />' +
            '<span class="df-date-icon"><i class="bi bi-calendar3"></i></span>' +
            '</div>';
    }

    //T7
    function bLabel(f) {
        return `
                    <div class="df-label-field">
                        <span class="df-label mb-0">
                            ${esc(f.tenDanhMuc)} :
                            ${f.isRequired ? '<span style="color: red;">*</span>' : ''}
                        </span>
                        <span id="${inputId(f)}">
                            ${savedValues[f.maDanhMuc] || '—'}
                        </span>
                    </div>
                `;
    }

    //T8
    function bImage(f) {
        var id = inputId(f);
        return lbl(f) +
            '<div class="df-img-wrap" id="img-wrap-' + id + '">' +
            '<img id="img-prev-' + id + '" src="" alt="" />' +
            '<div class="df-img-placeholder" id="img-ph-' + id + '"><i class="bi bi-camera"></i></div>' +
            '<div class="df-img-overlay"><i class="bi bi-pencil me-1"></i>Đổi ảnh</div>' +
            '</div>' +
            '<input type="file" id="file-' + id + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" accept="image/*" data-type="image" data-preview="#img-prev-' + id + '" data-ph="#img-ph-' + id + '" />';
    }

    //T9
    function bFileAttach(f) {
        var id = inputId(f);
        return lbl(f) +
            '<div class="df-file-zone" data-trigger="#file-' + id + '">' +
            '<i class="bi bi-cloud-upload fs-5 d-block mb-1"></i>' +
            'Nhấn để chọn tệp đính kèm' +
            '<div class="df-file-name" id="fname-' + id + '"></div>' +
            '</div>' +
            '<input type="file" id="file-' + id + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" data-type="file" data-fname="#fname-' + id + '" />';
    }

    //T10
    function bLink(f) {
        return lbl(f) +
            '<a class="df-link-field" id="' + inputId(f) + '" data-controller="' + esc(f.controller || '') + '" data-action="' + esc(f.actionName || '') + '" href="#">' +
            '<i class="bi bi-link-45deg"></i>' + esc(f.tenDanhMuc) +
            '</a>';
    }

    //T11
    //TODO: Custom lại
    function bConfig(f) {
        return '<div class="df-config-box" id="' + inputId(f) + '">' +
            '<strong>' + esc(f.tenDanhMuc) + '</strong> <code>' + esc(f.maDanhMuc) + '</code> - type <code>' + f.fieldType + '</code>' +
            '</div>';
    }

    //T12
    function bPopup(f) {
        return lbl(f) +
            '<div>' +
            '<button type="button" class="df-popup-trigger" data-field="' + inputId(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" data-controller="' + esc(f.controller || '') + '" data-action="' + esc(f.actionName || '') + '" data-label="' + esc(f.tenDanhMuc) + '">' +
            '<i class="bi bi-search"></i> Chọn ' + esc(f.tenDanhMuc) +
            '</button>' +
            '<input type="hidden" id="' + inputId(f) + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" />' +
            '<div class="df-popup-val" id="pval-' + inputId(f) + '">' +
            '<i class="bi bi-check-circle-fill text-success"></i>' +
            '<span id="pval-text-' + inputId(f) + '"></span>' +
            '</div>' +
            '</div>';
    }

    //T13
    function bActionDelete(f) {
        return lbl(f) +
            '<button type="button" class="df-btn-delete" data-field="' + inputId(f) + '" data-field-key="' + esc(f.maDanhMuc) + '">' +
            '<i class="bi bi-trash3"></i> Xóa ' + esc(f.tenDanhMuc) +
            '</button>';
    }

    //T14
    function bMultiSelect(f) {
        var h = lbl(f) +
            '<div class="df-ms-container" id="msc-' + inputId(f) + '">' +
            '<div class="df-ms-box" id="msb-' + inputId(f) + '">' +
            '<input type="text" class="df-ms-input" placeholder="Tìm kiếm..." />' +
            '</div>' +
            '<div class="df-ms-dropdown" id="msd-' + inputId(f) + '">';
        $.each(f.options || [], function (_, o) {
            h += '<div class="df-ms-opt" data-val="' + esc(o.value) + '" data-text="' + esc(o.text) + '">' +
                '<i class="bi bi-square chk-icon"></i>' + esc(o.text) + '</div>';
        });
        h += '</div><input type="hidden" id="' + inputId(f) + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" /></div>';
        return h;
    }


    function restoreValues(fields) {
        $.each(fields, function (_, f) {
            var val = savedValues[f.maDanhMuc];
            if (val === undefined || val === null) return;
            switch (f.fieldType) {
                case 2:
                    var arr = Array.isArray(val) ? val : String(val).split(',');
                    $.each(arr, function (_, v) {
                        $('input[name="' + inputName(f) + '" ][value="' + v.trim() + '" ]').prop('checked', true);
                    });
                    break;
                case 3:
                    $('input[name="' + inputName(f) + '" ][value="' + val + '" ]').prop('checked', true);
                    break;
                case 12:
                    var pv = typeof val === 'object' ? val : { value: val, text: val };
                    $(jqId(inputId(f))).val(pv.value);
                    if (pv.text) {
                        $('#pval-text-' + inputId(f)).text(pv.text);
                        $('#pval-' + inputId(f)).show();
                    }
                    break;
                case 8:
                    if (val.preview) {
                        $('#img-prev-' + inputId(f)).attr('src', val.preview).show();
                        $('#img-ph-' + inputId(f)).hide();
                    }
                    break;
                case 9:
                    if (val.fileName) {
                        $('#fname-' + inputId(f)).text(val.fileName);
                    }
                    break;
                default:
                    $(jqId(inputId(f))).val(val);
            }
        });
    }
    function bindCascade(fields) {
        $.each(fields, function (_, f) {
            if (!f.cascadeField) return;
            var parentId = inputIdByKey(f.cascadeField);
            $(document).off('change.casc' + inputId(f), jqId(parentId))
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
        //Test
        //$.getJSON('/XetTuyenDaiHoc/GetOptions', {
        //    controller: f.controller,
        //    actionName: f.actionName,
        //    parentValue: parentVal
        //}, function (opts) {
        //    var data = Array.isArray(opts) ? opts : [];
        //    var normalized = $.map(data, normalizeOpt);
        //    var $el = $(jqId(inputId(f)));
        //    if (f.fieldType === 4) {
        //        $el.empty().append('<option value="">' + (f.placeHolder || '-- Chọn --') + '</option>');
        //        $.each(normalized, function (_, o) {
        //            $el.append('<option value="' + esc(o.value) + '">' + esc(o.text) + '</option>');
        //        });
        //    } else if (f.fieldType === 2) {
        //        var $cg = $('#cg-' + inputId(f)).empty();
        //        $.each(normalized, function (i, o) {
        //            var cId = inputId(f) + '_' + i;
        //            $cg.append('<label class="df-check-item"><input type="checkbox" id="' + cId + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" value="' + esc(o.value) + '" />' + esc(o.text) + '</label>');
        //        });
        //    } else if (f.fieldType === 3) {
        //        var $rg = $('#rg-' + inputId(f)).empty();
        //        $.each(normalized, function (i, o) {
        //            var rId = inputId(f) + '_' + i;
        //            $rg.append('<label class="df-radio-item"><input type="radio" id="' + rId + '" name="' + inputName(f) + '" data-field-key="' + esc(f.maDanhMuc) + '" value="' + esc(o.value) + '" />' + esc(o.text) + '</label>');
        //        });
        //    } else if (f.fieldType === 14) {
        //        var $drop = $('#msd-' + inputId(f)).empty();
        //        $.each(normalized, function (_, o) {
        //            $drop.append('<div class="df-ms-opt" data-val="' + esc(o.value) + '" data-text="' + esc(o.text) + '"><i class="bi bi-square chk-icon"></i>' + esc(o.text) + '</div>');
        //        });
        //    }
        //    restoreValues([f]);
        //    });
    }

    function bindMultiselect(fields) {
        $.each(fields, function (_, f) {
            if (f.fieldType !== 14) return;

            var fid = inputId(f);
            var fieldKey = f.maDanhMuc;
            var $box = $('#msb-' + fid);
            var $drop = $('#msd-' + fid);
            var $hid = $(jqId(fid));
            var $inp = $box.find('.df-ms-input');
            var sel = {};

            var initVal = savedValues[fieldKey];
            if (initVal) {
                $.each(String(initVal).split(','), function (_, v) {
                    var key = $.trim(v);
                    if (!key) return;
                    var $opt = $drop.find('[data-val="' + key + '"]');
                    if (!$opt.length) return;
                    var text = $opt.data('text');
                    sel[key] = text;
                    $opt.addClass('selected').find('.chk-icon').removeClass('bi-square').addClass('bi-check-square');
                    $box.prepend('<span class="df-ms-tag" data-tag="' + esc(key) + '">' + esc(text) + '<span class="rm" data-val="' + esc(key) + '">&times;</span></span>');
                });
                $hid.val(Object.keys(sel).join(','));
            }

            $inp.off('focus keyup').on('focus keyup', function () {
                var kw = $(this).val().toLowerCase();
                $drop.find('.df-ms-opt').each(function () {
                    $(this).toggle($(this).data('text').toLowerCase().indexOf(kw) >= 0);
                });
                $drop.show();
            });

            $drop.off('click', '.df-ms-opt').on('click', '.df-ms-opt', function () {
                var val = String($(this).data('val'));
                var text = String($(this).data('text'));
                if (sel[val] !== undefined) {
                    delete sel[val];
                    $(this).removeClass('selected').find('.chk-icon').removeClass('bi-check-square').addClass('bi-square');
                    $box.find('[data-tag="' + val + '"]').remove();
                } else {
                    sel[val] = text;
                    $(this).addClass('selected').find('.chk-icon').removeClass('bi-square').addClass('bi-check-square');
                    $box.prepend('<span class="df-ms-tag" data-tag="' + esc(val) + '">' + esc(text) + '<span class="rm" data-val="' + esc(val) + '">&times;</span></span>');
                }
                var joined = Object.keys(sel).join(',');
                $hid.val(joined);
                savedValues[fieldKey] = joined;
                //persistLocalSnapshot();
                $inp.val('').focus();
            });

            $box.off('click', '.rm').on('click', '.rm', function (e) {
                e.stopPropagation();
                var val = String($(this).data('val'));
                delete sel[val];
                $(this).closest('.df-ms-tag').remove();
                $drop.find('[data-val="' + val + '"]').removeClass('selected').find('.chk-icon').removeClass('bi-check-square').addClass('bi-square');
                var joined = Object.keys(sel).join(',');
                $hid.val(joined);
                savedValues[fieldKey] = joined;
                //persistLocalSnapshot();
            });

            $(document).off('click.ms-' + fid).on('click.ms-' + fid, function (e) {
                if (!$('#msc-' + fid).is(e.target) && !$('#msc-' + fid).has(e.target).length) {
                    $drop.hide();
                }
            });
        });
    }

    function bindPopupTriggers() {
        $(document).off('click.popup', '.df-popup-trigger').on('click.popup', '.df-popup-trigger', function () {
            var $btn = $(this);
            popupCtx = {
                controller: $btn.data('controller'),
                actionName: $btn.data('action'),
                targetField: $btn.data('field'),
                targetFieldKey: $btn.data('field-key') || $btn.data('field'),
                label: $btn.data('label'),
                page: 1
            };
            $('#df-popup-title').text('Chọn ' + popupCtx.label);
            $('#df-popup-keyword').val('');
            doPopupSearch('');
            new bootstrap.Modal('#df-popup-modal').show();
        });
    }

    function doPopupSearch(keyword) {
        if (!popupCtx) return;
        $.getJSON('/XetTuyenDaiHoc/GetPopupData', {
            controller: popupCtx.controller,
            actionName: popupCtx.actionName,
            keyword: keyword,
            page: popupCtx.page,
            pageSize: 20
        }, renderPopupResult);
    }

    function renderPopupResult(res) {
        var $th = $('#df-popup-thead').empty();
        var $tb = $('#df-popup-tbody').empty();
        var $pg = $('#df-popup-paging').empty();

        if (!res.columns || !res.columns.length || res.error) {
            $tb.html('<tr><td class="text-center text-muted py-3" colspan="99">' + (res.error || 'Không có dữ liệu.') + '</td></tr>');
            return;
        }

        var $htr = $('<tr></tr>');
        $.each(res.columns, function (_, c) { $htr.append('<th class="small">' + esc(c) + '</th>'); });
        $th.append($htr);

        $.each(res.rows, function (_, row) {
            var $tr = $('<tr style="cursor:pointer"></tr>');
            $.each(res.columns, function (_, c) {
                $tr.append('<td class="small">' + esc(String(row[c] == null ? '' : row[c])) + '</td>');
            });
            $tr.on('click', function () {
                var valCol = res.columns[0];
                var textCol = res.columns.length > 1 ? res.columns[1] : valCol;
                var val = row[valCol];
                var text = row[textCol];
                $(jqId(popupCtx.targetField)).val(val);
                $('#pval-text-' + popupCtx.targetField).text(text);
                $('#pval-' + popupCtx.targetField).show();
                savedValues[popupCtx.targetFieldKey || popupCtx.targetField] = { value: val, text: text };
                //persistLocalSnapshot();
                bootstrap.Modal.getInstance(document.getElementById('df-popup-modal')).hide();
            });
            $tb.append($tr);
        });

        var total = res.totalRows || 0;
        var ps = res.pageSize || 20;
        var pages = Math.ceil(total / ps);
        for (var p = 1; p <= pages; p++) {
            (function (pg) {
                $pg.append($('<button class="btn btn-sm ' + (pg === popupCtx.page ? 'btn-primary' : 'btn-outline-secondary') + '">' + pg + '</button>').on('click', function () {
                    popupCtx.page = pg;
                    doPopupSearch($('#df-popup-keyword').val());
                }));
            })(p);
        }
    }

    function bindFilePickers() {
        $(document).off('click.file-zone', '.df-file-zone').on('click.file-zone', '.df-file-zone', function () {
            var target = $(this).data('trigger');
            if (target) $(target).trigger('click');
        });

        $(document).off('click.img-wrap', '.df-img-wrap').on('click.img-wrap', '.df-img-wrap', function () {
            var id = $(this).attr('id').replace('img-wrap-', '');
            $('#file-' + id).trigger('click');
        });

        $(document).off('change.fp', 'input[data-type="file"]').on('change.fp', 'input[data-type="file"]', function () {
            var f = this.files[0];
            if (!f) return;

            var fieldId = $(this).data('field-key') || this.id.replace('file-', '');
            var nameHolder = $(this).data('fname');
            if (nameHolder) $(nameHolder).text(f.name);

            savedValues[fieldId] = { fileName: f.name };
            //persistLocalSnapshot();
        });

        $(document).off('change.ip', 'input[data-type="image"]').on('change.ip', 'input[data-type="image"]', function () {
            var f = this.files[0];
            if (!f) return;

            var fieldId = $(this).data('field-key') || this.id.replace('file-', '');
            var reader = new FileReader();
            var $prev = $($(this).data('preview'));
            var $ph = $($(this).data('ph'));

            reader.onload = function (e) {
                $prev.attr('src', e.target.result).show();
                $ph.hide();
                savedValues[fieldId] = {
                    fileName: f.name,
                    preview: e.target.result
                };
                //persistLocalSnapshot();
            };
            reader.readAsDataURL(f);
        });
    }

    function bindNumericSpinners() {
        $(document).off('click.ns', '.df-numeric-spin button').on('click.ns', '.df-numeric-spin button', function () {
            var $inp = $(jqId($(this).data('target')));
            var v = parseFloat($inp.val()) || 0;
            var max = parseFloat($inp.attr('max')) || Infinity;
            if ($(this).data('dir') === 'up') v = Math.min(v + 1, max);
            else v = v - 1;
            $inp.val(v).trigger('change');
        });
    }

    function bindActionDelete() {
        $(document).off('click.del', '.df-btn-delete').on('click.del', '.df-btn-delete', function () {
            var fid = $(this).data('field');
            var fieldKey = $(this).data('field-key') || fid;
            if (!confirm('Xác nhận xóa dữ liệu của trường "' + fid + '"?')) return;
            $(jqId(fid)).val('').trigger('change');
            $('#pval-' + fid).hide();
            delete savedValues[fieldKey];
            //persistLocalSnapshot();
        });
    }

    function bindFormValueAutoSave() {
        $(document).off('change.autosave', '#df-fields-container :input').on('change.autosave', '#df-fields-container :input', function () {
            var id = this.id;
            var key = $(this).data('field-key') || id;
            if (!id || id.indexOf('file-') === 0) return;
            savedValues[key] = $(this).val();
            //persistLocalSnapshot();
        });

        $(document).off('change.autosave-check', '#df-fields-container input[type="checkbox"], #df-fields-container input[type="radio"]').on('change.autosave-check', '#df-fields-container input[type="checkbox"], #df-fields-container input[type="radio"]', function () {
            var name = $(this).attr('name');
            if (!name) return;
            if ($(this).attr('type') === 'checkbox') {
                savedValues[name] = $('input[name="' + name + '"]:checked').map(function () { return $(this).val(); }).get().join(',');
            } else {
                savedValues[name] = $('input[name="' + name + '"]:checked').val() || '';
            }
            //persistLocalSnapshot();
        });
    }

    function hasMeaningfulValue(f, rawVal) {
        if (rawVal == null) return false;

        if (f.fieldType === 12) {
            if (typeof rawVal === 'object') return !!String(rawVal.value || '').trim();
            return !!String(rawVal).trim();
        }

        if (f.fieldType === 8 || f.fieldType === 9) {
            if (typeof rawVal === 'object') return !!String(rawVal.fileName || '').trim();
            return !!String(rawVal).trim();
        }

        return !!String(rawVal).trim();
    }

    function evalTabCompleted(tab, useDomValue) {
        var requiredFields = $.grep(tab.fields, function (f) {
            return f.isRequired && f.isVisible && !f.isParent;
        });

        if (!tab.isSeen) {
            return false;
        }

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

        //TODO: Test temp
        //$.each(tab.fields, function (_, f) {
        //    if (!f.isRequired || !f.isVisible || f.isParent) return;

        //    var val = getVal(f);
        //    var $err = $('#df-err-' + inputId(f));
        //    if (!val) {
        //        $err.addClass('show');
        //        $(jqId(inputId(f))).addClass('is-invalid');
        //        if (f.fieldType === 14) $('#msb-' + inputId(f)).addClass('is-invalid');
        //        valid = false;
        //    } else {
        //        $err.removeClass('show');
        //        $(jqId(inputId(f))).removeClass('is-invalid');
        //        if (f.fieldType === 14) $('#msb-' + inputId(f)).removeClass('is-invalid');
        //    }
        //});

        return valid;
    }

    function getVal(f) {
        switch (f.fieldType) {
            case 2:
                return $('input[name="' + inputName(f) + '"]:checked').map(function () { return $(this).val(); }).get().join(',');
            case 3:
                return $('input[name="' + inputName(f) + '"]:checked').val() || '';
            case 8:
            case 9:
                var fileInput = document.getElementById('file-' + inputId(f));
                if (fileInput && fileInput.files && fileInput.files.length) {
                    return fileInput.files[0].name;
                }
                var mem = savedValues[f.maDanhMuc];
                return mem && mem.fileName ? mem.fileName : '';
            default:
                return $(jqId(inputId(f))).val() || '';
        }
    }

    function collectTab(idx) {
        var tab = tabs[idx];
        var d = {};
        $.each(tab.fields, function (_, f) {
            if (f.isParent || f.fieldType === 7 || f.fieldType === 11 || f.fieldType === 13) return;
            d[f.maDanhMuc] = getVal(f);
        });
        return d;
    }

    function bindNav() {
        $('#df-btn-back').off('click').on('click', function () {
            if (curTabIdx > 0) {
                renderTab(curTabIdx - 1);
            } else {
                window.history.back();
            }
        });

        $('#df-btn-next').off('click').on('click', function () {
            if (!validateTab(curTabIdx)) {
                var $first = $('.is-invalid').first();
                if ($first.length) {
                    $('html,body').animate({ scrollTop: $first.offset().top - 90 }, 280);
                }
                return;
            }

            var data = collectTab(curTabIdx);
            $.extend(savedValues, data);

            tabs[curTabIdx].isSeen = true;

            //console.log("CHuyển tab: " + tabs[curTabIdx].isSeen);
            tabs[curTabIdx].isCompleted = evalTabCompleted(tabs[curTabIdx], true);
            //persistLocalSnapshot();

            if (curTabIdx < tabs.length - 1) {
                renderTab(curTabIdx + 1);
            } else {
                syncSidebarStep(curTabIdx);
                alert('Đăng ký thành công! Chúc mừngggggg');
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

        $('#df-popup-search-btn').off('click').on('click', function () {
            if (!popupCtx) return;
            popupCtx.page = 1;
            doPopupSearch($('#df-popup-keyword').val());
        });

        $('#df-popup-keyword').off('keypress').on('keypress', function (e) {
            if (e.which === 13) {
                $('#df-popup-search-btn').trigger('click');
            }
        });
    }

    //function loadLocalSnapshot() {
    //    try {
    //        var raw = localStorage.getItem(STORAGE_KEY);
    //        if (!raw) return {};
    //        var snap = JSON.parse(raw);
    //        if (snap && snap.savedValues) {
    //            if (Array.isArray(snap.tabsCompleted)) {
    //                $.each(snap.tabsCompleted, function (_, key) {
    //                    var found = tabs.find(function (t) { return t.tabKey === key; });
    //                    if (found) found.isCompleted = true;
    //                });
    //            }
    //            return snap.savedValues;
    //        }
    //    } catch (e) { }
    //    return {};
    //}

    //function persistLocalSnapshot() {
    //    var completed = tabs.filter(function (t) { return t.isCompleted; }).map(function (t) { return t.tabKey; });
    //    localStorage.setItem(STORAGE_KEY, JSON.stringify({
    //        savedValues: savedValues,
    //        tabsCompleted: completed
    //    }));
    //    syncSidebarStep(curTabIdx);
    //}

    // Hàm test
    //function syncSidebarStep(idx) {
    //    if (typeof window.dfUpdateSidebar === 'function') {
    //        window.dfUpdateSidebar(idx, tabs);
    //    }
    //}

    function syncSidebarStep(idx) {
        $.each(tabs, function (i, t) {
            t.isCompleted = evalTabCompleted(t, i === idx);
        });

        if (typeof window.dfUpdateSidebar === 'function') {
            window.dfUpdateSidebar(idx, tabs, flag_InitLanDau);
            flag_InitLanDau = false;
        }
    }

    function esc(s) {
        return s == null ? '' : String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function lbl(f) {
        return '<label class="df-label" id="' + labelId(f) + '" for="' + inputId(f) + '">' + esc(f.tenDanhMuc) + (f.isRequired ? '<span style="color: red;"> *</span>' : '') + '</label>';
    }

    function inputName(f) { return String(f && f.maDanhMuc ? f.maDanhMuc : ''); }
    function inputId(f) { return inputIdByKey(inputName(f)); }
    function inputIdByKey(key) { return String(key || '').replace(/[^A-Za-z0-9_-]/g, '_'); }
    function idSlug(key) { return String(key || '').replace(/[^A-Za-z0-9]+/g, '').toLowerCase(); }
    function colId(f) { return 'div' + String(inputName(f)).toLowerCase(); }
    function labelId(f) { return 'lbl' + String(inputName(f)).toLowerCase(); }
    function jqId(id) {
        return '#' + String(id).replace(/([ #;?%&,.+*~':"!^$\[\]()=>|\/\\@@])/g, '\\$1');
    }
    function hasActionSource(f) { return !!(f && f.actionName); }
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
            text: text == null ? '' : String(text)
        };
    }

    function ph(f) { return f.placeHolder ? ' placeholder="' + esc(f.placeHolder) + '"' : ''; }
    function ml(f) { return f.maxLength ? ' maxlength="' + f.maxLength + '"' : ''; }
    function ro(f) { return f.readOnly ? ' readonly' : ''; }


});