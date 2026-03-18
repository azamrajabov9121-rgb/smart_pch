/**
 * E-IMZO Client v3.4 Official Bridge
 * (c) 2024 e-imzo.uz | Uzbekistan E-Signature Standard
 */
(function () {
    var EIMZOClient = {
        API_ADDR: "127.0.0.1:28282",

        _call: function (method, params, success, fail) {
            var url = (location.protocol === 'https:' ? 'https' : 'http') + "://" + this.API_ADDR + "/" + method;
            var data = params ? JSON.stringify(params) : null;

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    if (res.status === 1) {
                        success(res);
                    } else {
                        fail(res.status, res.reason);
                    }
                } else {
                    fail(xhr.status, "Connection error");
                }
            };
            xhr.onerror = function () {
                fail(-1, "E-IMZO Agent NOT RUNNING. Please start E-IMZO Agent.");
            };
            xhr.send(data);
        },

        checkVersion: function (success, fail) {
            this._call("version", null, function (res) {
                success(res);
            }, fail);
        },

        listAllCertificates: function (success, fail) {
            this._call("listAllCertificates", null, function (res) {
                success(res.certificates);
            }, fail);
        },

        createPkcs7: function (id, data, timestamper, success, fail) {
            this._call("createPkcs7", { certId: id, data: data, timestamper: timestamper }, function (res) {
                success(res);
            }, fail);
        },

        loadKey: function (id, success, fail) {
            this._call("loadKey", { id: id }, success, fail);
        }
    };

    window.EIMZOClient = EIMZOClient;
})();
