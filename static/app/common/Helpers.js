define(function (require) {
    "use strict";

    return class Helper {

        constructor() {
            return;
        };

        static now_timestamp() {
            return moment.now();
        }
        static localToTimestamp(datetime) {
            return moment(datetime).unix() * 1000;
        }
        static utcToLocal(utcTime, format = "HH:mm:ss DD-MM-YYYY") {
            return moment(utcTime).local().format(format);
        }

        /**
         * SO POWERFUL FUNCTION
         * @param {*} datetime 
         * @param {*} options 
         */
        static setDatetime(datetime, options = {}) {
            datetime = datetime ? datetime : new Date();
            if (!options || !options.hasOwnProperty("format") || options.format == null) {
                options.format = "DD-MM-YYYY HH:mm"
            }
            if (options && options.inputFormat) {

            }
            if (moment(datetime).isValid() || ((options && options.inputFormat) ? moment(datetime, options.inputFormat).isValid() : false)) {
                var d = (options && options.inputFormat) ? moment(datetime, options.inputFormat) : moment(datetime);
                if (options && options.hasOwnProperty("years") && options.years != null) {
                    d.years(options.years);
                }
                if (options && options.hasOwnProperty("months") && options.months != null) {
                    d.months(options.months - 1);
                }
                if (options && options.hasOwnProperty("dates") && options.dates != null) {
                    d.dates(options.dates);
                }
                if (options && options.hasOwnProperty("hours") && options.hours != null) {
                    d.hours(options.hours);
                }
                if (options && options.hasOwnProperty("minutes") && options.minutes != null) {
                    d.minutes(options.minutes);
                }
                if (options && options.hasOwnProperty("seconds") && options.seconds != null) {
                    d.seconds(options.seconds);
                }
                if (options && options.hasOwnProperty("milliseconds") && options.milliseconds != null) {
                    d.milliseconds(options.milliseconds);
                }

                return d.format(options.format);
            }

            return "Invalid datetime";
        };

        static localNowString(format = "YYYY-MM-DD HH:mm:ss") {
            return moment(new Date()).local().format(format);
        }

        /**
         * 
         * @param {*} inputTime 
         * @return miliseconds
         */
        static utcToTimestamp(inputTime) {
            let utcMomentTime = this.utcNow();
            if (inputTime) {
                utcMomentTime = moment.utc(inputTime)
            }
            return utcMomentTime.unix() * 1000 + utcMomentTime.millisecond();
        }

        /**
         * milisecond
         */
        static datetimeToTimestamp(inputTime = null) {
            var now = moment(new Date());
            if (inputTime) {
                now = moment(inputTime);
            }
            return now.unix() * 1000 + now.millisecond();
        }

        static datetimeToObject(datetime, isUtc = false) {
            try {
                if (!datetime) {
                    datetime = new Date();
                }
                if (moment.isMoment(datetime)) {
                    if (isUtc) {
                        return datetime.local().toObject();
                    } else {
                        return datetime.utc().toObject();
                    }
                } else {
                    if (isUtc) {
                        return moment(datetime).local().toObject();
                    } else {
                        return moment(datetime).utc().toObject();
                    }
                }
            } catch {
                return null;
            }
        }

        static getWeekDayString(idx) {
            var i = parseInt(idx);
            if (i == null) {
                return "";
            }
            switch (i) {
                case 0:
                    return "Chủ nhật";
                case 1:
                    return "Thứ 2";
                case 2:
                    return "Thứ 3";
                case 3:
                    return "Thứ 4";
                case 4:
                    return "Thứ 5";
                case 5:
                    return "Thứ 6";
                case 6:
                    return "Thứ 7";
            }
        }

        static getStartDayTime(inputTime) {
            var t = moment(inputTime);
            t.set('hour', 0);
            t.set('minute', 0);
            t.set('second', 0);
            t.set('millisecond', 0);
            return t;
        }

        static getEndDayTime(inputTime) {
            var t = moment(inputTime);
            t.set('hour', 23);
            t.set('minute', 59);
            t.set('second', 59);
            t.set('millisecond', 999);
            return t;
        }

        static getStartDayOfWeek(currentDay) {
            var first = null;
            if (currentDay.getDay() === 0) {
                first = currentDay.getDate() - 7 + 1;
            } else {
                first = currentDay.getDate() - currentDay.getDay() + 1; // First day is the day of the month - the day of the week
            }
            var firstday = new Date(currentDay.setDate(first)).toUTCString();
            return firstday;
        }

        static getLastDayOfWeek(currentDay) {
            var first = null;
            if (currentDay.getDay() === 0) {
                first = currentDay.getDate() - 7 + 1;
            } else {
                first = currentDay.getDate() - currentDay.getDay() + 1;
            }
            var last = first + 6; // last day is the first day + 6
            var lastday = new Date(currentDay.setDate(last)).toUTCString();
            return lastday;
        }

        static setDate(y = null, m = null, d = null) {
            var today = new Date();
            if (y == null) {
                y = today.getFullYear();
            }
            if (m == null) {
                m = today.getMonth();
            } else {
                m = m - 1;
            }
            if (d == null) {
                d = today.getDate()
            }
            today.setFullYear(y, m, d);
            return today;
        }


        /**
         * 
         * @param {*} type 
         * @param {*} base 
         * @param {*} uppercase 
         */
        static generateHashKey(type = "mix", base = 32, uppercase = false) {
            var charsets = null;
            if (type == "number") {
                charsets = "1234567890";
            } else if (type == "string") {
                charsets = "abcdefghijklmnopqrstuvwxyz";
            } else {
                charsets = "abcdef-ghijkl-mnopqrs-tuvwxyz-1234567890";
            }

            if (uppercase) {
                charsets = charsets.toUpperCase().split("");
            } else {
                charsets = charsets.split("");
            }
            var hash = "";
            for (var i = 0; i < base; i++) {
                hash += charsets[Math.floor(Math.random() * charsets.length)];
            }
            return hash;
        }

        /**
         * hex milisecond timestamp to unique string
         */
        static toHexTimestamp() {
            var input = this.now_timestamp();
            var alphabet = "0123456789abcdefghijklmnopqrstuvwxyz" + "abcdefghijklmnopqrstuvwxyz".toLocaleUpperCase();
            var hashids = new Hashids(alphabet);
            var id = hashids.encode(input);
            return id;
        }

        /**
         * generate uniqueId base on timestamp by milisecond
         */
        static uniqueId() {
            var input = this.now_timestamp();
            var hash = "",
                alphabet = "0123456789abcdefghijklmnopqrstuvwxyz".toLocaleUpperCase(),
                alphabetLength = alphabet.length;
            do {
                hash = alphabet[input % alphabetLength] + hash;
                input = parseInt(input / alphabetLength, 10);
            } while (input);
            return hash + alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }

        static validatePhone(inputPhone) {
            var phoneno = /(09|08|07|05|03)+[0-9]{8}/g;
            const result = inputPhone.match(phoneno);
            if (result && result == inputPhone) {
                return true;
            } else {
                return false;
            }
        }

        static replaceToAscii(str) {
            var AccentsMap = [
                "aàảãáạăằẳẵắặâầẩẫấậ",
                "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
                "dđ", "DĐ",
                "eèẻẽéẹêềểễếệ",
                "EÈẺẼÉẸÊỀỂỄẾỆ",
                "iìỉĩíị",
                "IÌỈĨÍỊ",
                "oòỏõóọôồổỗốộơờởỡớợ",
                "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
                "uùủũúụưừửữứự",
                "UÙỦŨÚỤƯỪỬỮỨỰ",
                "yỳỷỹýỵ",
                "YỲỶỸÝỴ"
            ];
            for (var i = 0; i < AccentsMap.length; i++) {
                var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
                var char = AccentsMap[i][0];
                str = str.replace(re, char);
            }
            return str;
        }

        static convertToAttribute(attribute) {
            var newValue = this.replaceToAscii(attribute);
            newValue = newValue.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '_');
            newValue = newValue.toLowerCase();

            return newValue;
        }
    }
});