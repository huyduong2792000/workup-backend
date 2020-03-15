define(function (require) {
    "use strict";

    return class FileHelper {

        constructor() {
            return;
        };

        /**
         * FILE EXPORT AS EXCEL
         * @param {*} title 
         * @param {*} dataSource 
         * @param {*} fields 
         */
        static exportToFile(title = null, dataSource, fields) {
            // try {
            const self = this;
            if (!title) {
                title = self.localNowString("YYYY-MM-DD-HH-mm-ss");
            } else {
                title += "-" + self.localNowString("YYYY-MM-DD-HH-mm-ss");
            }

            var report = gonrin.spreadsheet({
                name: title,
                fields: fields,
                dataSource: dataSource,
                excel: {
                    file_name: title + ".xlsx"
                }
            }).save_excel();

            var createFile = function (workbook, options) {
                var zip = new JSZip();
                var files = workbook.generateFiles();
                $.each(files, function (path, content) {
                    path = path.substr(1);
                    if (path.indexOf('.xml') !== -1 || path.indexOf('.rel') !== -1) {
                        zip.file(path, content, {
                            base64: false
                        });
                    } else {
                        zip.file(path, content, {
                            base64: true,
                            binary: true
                        });
                    }
                })
                options = options || {};
                if (!options.type) {
                    options.type = "base64";
                }
                return zip.generate(options);
            };

            var rhref = createFile(report.prepare());

            $("#download").attr({
                href: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + rhref
            });
            // } catch (error) {
            //     $.notify({message: error}, {type: "danger"});
            // }
        }

    }
});