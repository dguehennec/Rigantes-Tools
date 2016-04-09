/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Rigantes Tools.
 *
 * The Initial Developer of the Original Code is
 * David GUEHENNEC.
 * Portions created by the Initial Developer are Copyright (C) 2013
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://rigantestools/service/logger.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_Util" , "rigantestools_UtilPlayer"];

/**
 * Util object.
 * 
 * @constructor
 * @this {Util}
 */
var rigantestools_Util = function(window) {
    /**
     * @private window
     */
    this._window = window;
    /**
     * @private bundle
     */
    this._bundle = null;
};

/**
 * Gets the window of the doc page.
 * 
 * @this {Util}
 * @param {object}
 *            doc document of the Lords And Knights HTML page.
 * @return the window page
 */
rigantestools_Util.prototype.getWindow = function(doc) {
    if (!doc) {
        return null;
    }
    if (typeof (doc.defaultView) === 'undefined') {
        return null;
    }
    return doc.defaultView.wrappedJSObject;
};

/**
 * get bundle.
 * 
 * @this {Util}
 * 
 * @param {string}
 *            param parameter value to get
 * @return {string} value of parameter
 */
rigantestools_Util.prototype.getBundleString = function(param) {
    try {
        if (this._bundle === null) {
            var appLocale = Services.locale.getApplicationLocale();
            this._bundle = Services.strings.createBundle(rigantestools_Constant.STRING_BUNDLE.DEFAULT_URL, appLocale);
        }
        return this._bundle.GetStringFromName(param);
    } catch (e) {
        return '';
    }
};

/**
 * get preference
 * 
 * @this {Util}
 * 
 * @param {string}
 *            pref the preference name
 * @return {string} the preference value
 */
rigantestools_Util.prototype.getPref = function(pref) {
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var value = '';
    if (prefManager.getPrefType(pref) === prefManager.PREF_BOOL) {
        value = prefManager.getBoolPref(pref);
    } else if (prefManager.getPrefType(pref) === prefManager.PREF_INT) {
        value = prefManager.getIntPref(pref);
    } else if (prefManager.getPrefType(pref) === prefManager.PREF_STRING) {
        value = prefManager.getCharPref(pref);
    }
    return value;
};

/**
 * set preference
 * 
 * @this {Util}
 * 
 * @param {string}
 *            pref the preference name
 * @param {string}
 *            value the preference value
 */
rigantestools_Util.prototype.setPref = function(pref, value) {
    try {
        var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        if (typeof value === 'number') {
            prefManager.setIntPref(pref, value);
        } else if (typeof value === 'boolean') {
            prefManager.setBoolPref(pref, value);
        } else {
            prefManager.setCharPref(pref, value);
        }
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * valid the text is numeric.
 * 
 * @this {Util}
 * @param {string}
 *            sText to valid.
 * @param {boolean}
 *            decimals true if is decimal.
 * @param {boolean}
 *            negatives true if is negative.
 * @return {boolean} true if is numeric.
 */
rigantestools_Util.prototype.isNumeric = function(sText, decimals, negatives) {
    var isNumber = true;
    var numDecimals = 0;
    var validChars = "0123456789";
    if (decimals) {
        validChars += ".";
    }
    if (negatives) {
        validChars += "-";
    }
    var thisChar;
    for (var i = 0; i < sText.length && isNumber === true; i++) {
        thisChar = sText.charAt(i);
        if (negatives && thisChar === "-" && i > 0) {
            isNumber = false;
        }
        if (decimals && thisChar === ".") {
            numDecimals = numDecimals + 1;
            if (i === 0 || i === sText.length - 1) {
                isNumber = false;
            }
            if (numDecimals > 1) {
                isNumber = false;
            }
        }
        if (validChars.indexOf(thisChar) === -1) {
            isNumber = false;
        }
    }
    return isNumber;
};

/**
 * valid the link of habitat.
 * 
 * @this {Util}
 * @param {string}
 *            link the habitat link.
 * @return {boolean} true if a good link.
 */
rigantestools_Util.prototype.valideHabitatLink = function(link) {
    /* link=l+k://coordinates?xxxxx,xxxxx&xx */
    var reg = new RegExp("coordinates\\?[0-9]{1,},[0-9]{1,}&[0-9]{1,}", "gi");
    if (!reg.test(link)) {
        return false;
    }
    return true;
};

/**
 * valid the link of player.
 * 
 * @this {Util}
 * @param {string}
 *            link the player link.
 * @return {boolean} true if a good link.
 */
rigantestools_Util.prototype.validePlayerLink = function(link) {
    /* link=l+k://player?xxxxx&xx */
    var reg = new RegExp("player\\?[0-9]{1,}&[0-9]{1,}", "gi");
    if (!reg.test(link)) {
        return false;
    }
    return true;
};

/**
 * valid the link of alliance.
 * 
 * @this {Util}
 * @param {string}
 *            link the alliance link.
 * @return {boolean} true if a good link.
 */
rigantestools_Util.prototype.valideAllianceLink = function(link) {
    /* link=l+k://alliance?xxxx&xx */
    var reg = new RegExp("alliance\\?[0-9]{1,}&[0-9]{1,}", "gi");
    if (!reg.test(link)) {
        return false;
    }
    return true;
};

/**
 * valide the link of report.
 * 
 * @this {Util}
 * @param {string}
 *            link the report link.
 * @return {boolean} true if a good link.
 */
rigantestools_Util.prototype.valideReportLink = function(link) {
    /* link=l+k://report?xxxxxxx&xxxxx&xx */
    var reg = new RegExp("report\\?[0-9]{1,}&[0-9]{1,}&[0-9]{1,}", "gi");
    if (!reg.test(link)) {
        return false;
    }
    return true;
};

/**
 * valid the time in format hh:mm
 * 
 * @this {Util}
 * @param {string}
 *            time time to validate.
 * @return {boolean} true if a good time.
 */
rigantestools_Util.prototype.valideTimeHHMM = function(time, twentyHoursMax) {
    var reg = new RegExp("^[0-9]{2,3}:[0-5][0-9]$", "g");
    if (!reg.test(time)) {
        return false;
    }
    if (twentyHoursMax === true) {
        var hours = Number(time.substring(0, time.indexOf(':')));
        if (hours > 23) {
            return false;
        }
    }
    return true;
};

/**
 * convert time to time string hh:mm:ss
 * 
 * @this {Util}
 * @param {number}
 *            time time in seconds.
 * @param {boolean}
 *            withoutSec true if not show the seconds.
 * @return {string} time in format hh:mm:ss.
 */
rigantestools_Util.prototype.secToTimeStr = function(time, withoutSec) {
    if (time === null) {
        return "";
    }

    var a = parseInt(time / 3600);
    var b = parseInt((time - (a * 3600)) / 60);
    if (withoutSec) {
        return ((a < 10) ? "0" + a : a) + ":" + ((b < 10) ? "0" + b : b);
    }
    var d = time - (a * 3600) - (b * 60);
    return ((a < 10) ? "0" + a : a) + ":" + ((b < 10) ? "0" + b : b) + ":" + ((d < 10) ? "0" + d : d);
};

/**
 * convert seconds to datetime string jj.mm.aaaa hh:mm
 * 
 * @this {Util}
 * @param {date}
 *            date date to convert in seconds.
 * @param {boolean}
 *            withYear true if show the date with year.
 * @return {string} date in format jj.mm hh:mm.
 */
rigantestools_Util.prototype.formatDateTime = function(date, withYear) {
    if (date === null) {
        return "";
    }

    var day = date.getDay() - 1;
    if (day < 0) {
        day = 6;
    }
    var a = this.getBundleString("smallDay." + day);
    var b = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
    var c = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    var d = date.getFullYear();
    var e = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
    var f = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
    if (withYear) {
        return a + " " + b + "." + c + "." + d + " " + e + ":" + f;
    }
    return a + " " + b + "." + c + " " + e + ":" + f;
};


rigantestools_Util.prototype.formatDateForDatePicker = function(date, withYear) {

    if (date === null) {
        return "";
    }

    var b = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
    var c = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    var d = date.getFullYear();

    return d + "-" + c + "-" + b ;
};


/**
 * convert seconds to time string day hh:mm
 * 
 * @this {Util}
 * @param {date}
 *            date date to convert in seconds.
 * @param {boolean}
 *            withoutDayIfPossible true if remove day if not necessary.
 * @return {string} date in format day hh:mm.
 */
rigantestools_Util.prototype.formatDayTime = function(date, withoutDayIfPossible) {
    if (date === null) {
        return "";
    }

    var now = new Date();
    var day = date.getDay() - 1;
    if (day < 0) {
        day = 6;
    }
    var a = this.getBundleString("smallDay." + day);
    var e = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
    var f = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
    if (withoutDayIfPossible && (date.toDateString() === now.toDateString())) {
        return e + ":" + f;
    }
    return a + " " + e + ":" + f;
};


/**
 * convert seconds to time string  hh:mm
 * 
 * @this {Util}
 * @param {date}
 *            date date to convert in seconds.
 * @return {string} date in format hh:mm.
 */
rigantestools_Util.prototype.formatTime = function(date) {
    if (date === null) {
        return "";
    }

    var e = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
    var f = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
    
    return e + ":" + f;
};


/**
 * convert seconds to date string jj.mm.aaaa
 * 
 * @this {Util}
 * @param {date}
 *            date date to convert.
 * @return {string} date in format jj.mm.aaaa.
 */
rigantestools_Util.prototype.formatShortDateTime = function(date) {
    if (date === null) {
        return "";
    }

    var b = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
    var d = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    var c = date.getFullYear();
    return b + d + c;
};





/**
 * return max length string
 * 
 * @this {Util}
 * @param {string}
 *            date date to convert.
 * @return {string} date in format jj.mm.aaaa.
 */
rigantestools_Util.prototype.maxStringLength = function(name, length) {
    if (name === null || (name.length < length)) {
        return name;
    }
    return name.substring(0, length - 3) + "...";
};
/**
 * open url in a new browser tab
 * 
 * @this {Util}
 * @param {UrlToGoTo}
 *            UrlToGoTo url to open.
 * @return {boolean} true of successful.
 */
rigantestools_Util.prototype.openURL = function(UrlToGoTo) {
    try {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var browserEnumerator = wm.getEnumerator("navigator:browser");
        while (browserEnumerator.hasMoreElements()) {
            var browserInstance = browserEnumerator.getNext().getBrowser();
            var numTabs = browserInstance.mPanelContainer.childNodes.length;
            for (var index = 0; index < numTabs; index++) {
                var currentTab = browserInstance.getBrowserAtIndex(index);
                if (currentTab && currentTab.currentURI.spec.indexOf(UrlToGoTo) >= 0) {
                    browserInstance.selectedTab = browserInstance.tabContainer.childNodes[index];
                    try {
                        browserInstance.contentWindow.focus();
                        browserInstance.focus();
                        return true;
                    } catch (e) {
                        //Nothing
                    }
                }
            }
        }
        var recentWindow = wm.getMostRecentWindow("navigator:browser");
        if (recentWindow) {
            recentWindow.delayedOpenTab(UrlToGoTo, null, null, null, null);
        } else {
            this._window.open(UrlToGoTo);
        }
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Copy text to the clipboard
 * 
 * @this {Util}
 * @param {text}
 *            text message to copie.
 * @return {boolean} true of successful.
 */
rigantestools_Util.prototype.copieToClipboard = function(text) {
    var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
    clipboard.copyString(text);
    return true;
};

/**
 * Get the most recent window by it's 'id'
 * 
 * @param {string}
 *            id of window
 * @return {object} the window
 */
rigantestools_Util.prototype.getXULWindow = function(id) {
    var windowManagerInterface = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService().QueryInterface(Components.interfaces.nsIWindowMediator);
    return windowManagerInterface.getMostRecentWindow(id);
};

/**
 * Show notification
 * 
 * @param {string}
 *            title
 * @param {string}
 *            text
 * @param {string}
 *            callbackData
 * @param {function}
 *            callback
 */
rigantestools_Util.prototype.showNotificaton = function(title, text, callbackData, callback) {
    try {
        var alertsService = Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService);
        alertsService.showAlertNotification('chrome://rigantestools/skin/images/rigantestools.png', title, text, false, callbackData, callback, "");
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * save Content To File
 * 
 * @param {string}
 *            title
 * @param {string}
 *            filename
 * @param {string}
 *            data
 * @return {boolean} true if success
 */
rigantestools_Util.prototype.saveContentToFile = function(title, filename, data) {
    try {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(this._window, title, nsIFilePicker.modeSave);
        fp.appendFilter(this.getBundleString("export.type.file") + " CSV", "*.csv");
        fp.defaultString = filename + ".csv";
        fp.defaultExtension = "csv";
        var rv = fp.show();
        if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
            var file = fp.file;
            var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
            stream.init(file, 0x02 | 0x08 | 0x20, 436, 0);
            var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
            converter.charset = "UTF-8";
            var dataFormated = '\u00EF\u00BB\u00BF';
            try {
                dataFormated += converter.ConvertFromUnicode(data);
            } catch (e) {
                dataFormated += data;
            }
            stream.write(dataFormated, dataFormated.length);
            stream.close();
        }
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * save Content To XLS File
 * 
 * @param {string}
 *            data
 * @return {boolean} true if success
 */
rigantestools_Util.prototype.saveContentToXLSFile = function(filename, data) {
    try {
        var uri = 'data:application/vnd.ms-excel;base64,';
        var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Worksheet</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{data}</body></html>';
        var ctx = {
            data : data
        };
        this._window.location.href = uri + this._window.btoa(unescape(encodeURIComponent(template.replace(/{(\w+)}/g, function(m, p) {
            return ctx[p];
        }))));
        return true;
    } catch (e) {
        return false;
    }
};
/**
 * print content in the new window.
 * 
 * @this {Util}
 * @param {string}
 *            data the data to print
 */
rigantestools_Util.prototype.printContent = function(data) {
    try {
        var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
        file.append("print.html");
        var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        stream.init(file, 0x02 | 0x08 | 0x20, 436, 0);
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        var dataFormated = null;
        try {
            dataFormated = converter.ConvertFromUnicode(data);
        } catch (e) {
            dataFormated = data;
        }
        stream.write(dataFormated, dataFormated.length);
        stream.close();
        this.openURL("file:///" + file.path);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * install button.
 * 
 * @this {Util}
 * @param {string}
 *            tollbarId touulbar id
 * @param {string}
 *            id object id
 * @param {string}
 *            afterId indicate after the object Id
 */
rigantestools_Util.prototype.installButton = function(toolbarId, id, afterId) {
    if (this._window && !this._window.document.getElementById(id)) {
        var toolbar = this._window.document.getElementById(toolbarId);

        // If no afterId is given, then append the item to the toolbar
        var before = null;
        if (afterId) {
            var elem = this._window.document.getElementById(afterId);
            if (elem && elem.parentNode === toolbar) {
                before = elem.nextElementSibling;
            }
        }

        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        this._window.document.persist(toolbar.id, "currentset");

        if (toolbarId === "addon-bar") {
            toolbar.collapsed = false;
        }
    }
    ;
};

/**
 * set visibility.
 * 
 * @this {Util}
 * @param {string}
 *            id object id
 * @param {string}
 *            visibility of the object
 */
rigantestools_Util.prototype.setVisibility = function(id, visibility) {
    var element = this._window.document.getElementById(id);
    if (element) {
        element.style.visibility = visibility;
    }
};

/**
 * set attribute.
 * 
 * @this {Util}
 * @param {string}
 *            id object id
 * @param {string}
 *            attribute object attribute to set
 * @param {Object}
 *            value value of the attribute
 * @return {Boolean} true if success
 */
rigantestools_Util.prototype.setAttribute = function(id, attribute, value) {
    try {
        var element = this._window.document.getElementById(id);

        if (element) {
            if (attribute === 'currentIndex') {
                element.currentIndex = value;
            } else if (attribute === 'status' || attribute === 'selected') {
                element.setAttribute(attribute, value);
            } else {
                element[attribute] = value;
            }
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

/**
 * get attribute.
 * 
 * @this {Util}
 * @param {string}
 *            id object id
 * @param {string}
 *            attribute object attribute to set
 * @return {Object} value value of the attribute
 */
rigantestools_Util.prototype.getAttribute = function(id, attribute) {
    var element = this._window.document.getElementById(id);
    if (element) {
        if (attribute === 'currentIndex') {
            return element.currentIndex;
        } else {
            return element[attribute];
        }
    }
    return undefined;
};

/**
 * remove attribute.
 * 
 * @this {Util}
 * @param {string}
 *            id object id
 * @param {string}
 *            attribute object attribute to remove
 */
rigantestools_Util.prototype.removeAttribute = function(id, attribute) {
    var element = this._window.document.getElementById(id);
    if (element) {
        element.removeAttribute(attribute);
    }
};

/**
 * Show message.
 * 
 * @this {Util}
 * @param {string}
 *            title the title
 * @param {string}
 *            message the message
 */
rigantestools_Util.prototype.showMessage = function(title, message) {
    this._window.openDialog('chrome://rigantestools/content/message.xul', "", 'chrome, modal, dialog, centerscreen', title, message);
};

/**
 * Show option.
 * 
 * @this {Util}
 * @param {number}
 *            selectedTab the selected tab on show
 */
rigantestools_Util.prototype.showOption = function(selectedTab) {
    this._window.openDialog('chrome://rigantestools/content/options.xul', "", 'chrome, modal, dialog, centerscreen', selectedTab);
};

/**
 * Show About.
 * 
 * @this {Util}
 */
rigantestools_Util.prototype.showAbout = function() {
    this._window.openDialog('chrome://rigantestools/content/about.xul', this.getBundleString("about.about.label"), 'chrome, modal, dialog, centerscreen');
};

/**
 * Show MainFrame.
 * 
 * @this {Util}
 * @param {object}
 *            main callbackRefresh function
 */
rigantestools_Util.prototype.showMainFrame = function(main) {
    return this._window.openDialog('chrome://rigantestools/content/mainFrame.xul', '', 'chrome,centerscreen,resizable,dialog=no', main);
};

/**
 * addObserver.
 * 
 * @this {Util}
 * @param {Observer}
 *            observer the observer
 * @param {string}
 *            topic the topic
 */
rigantestools_Util.prototype.addObserver = function(observer, topic) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(observer, topic, false);
};

/**
 * removeObserver.
 * 
 * @this {Util}
 * @param {Observer}
 *            observer the observer
 * @param {string}
 *            topic the topic
 */
rigantestools_Util.prototype.removeObserver = function(observer, topic) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(observer, topic);
};

/**
 * notifyObservers.
 * 
 * @this {Util}
 * @param {string}
 *            topic the topic
 * @param {string}
 *            data the data
 */
rigantestools_Util.prototype.notifyObservers = function(topic, data) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.notifyObservers(null, topic, data);
};

/**
 * convert Json to Dom (Default XUL)
 * 
 * @this {Util}
 */
rigantestools_Util.prototype.JSONToDOM = function(xml, doc, nodes) {
    // For more information on this function, see
    // https://developer.mozilla.org/en/XUL_School/DOM_Building_and_HTML_Insertion
    var namespacesList = {
        html : "http://www.w3.org/1999/xhtml",
        xul : "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
    };
    var defaultNamespace = namespacesList.xul;

    function namespace(name) {
        var m = /^(?:(.*):)?(.*)$/.exec(name);
        return [ namespacesList[m[1]], m[2] ];
    }

    function tag(name, attr) {
        if (Array.isArray(name)) {
            var frag = doc.createDocumentFragment();
            Array.forEach(arguments, function(arg) {
                if (!Array.isArray(arg[0])) {
                    frag.appendChild(tag.apply(null, arg));
                } else {
                    arg.forEach(function(arg) {
                        frag.appendChild(tag.apply(null, arg));
                    });
                }
            });
            return frag;
        }

        var args = Array.slice(arguments, 2);
        var vals = namespace(name);
        var elem = doc.createElementNS(vals[0] || defaultNamespace, vals[1]);

        for ( var key in attr) {
            var val = attr[key];
            if (nodes && key == "key") {
                nodes[val] = elem;
            }
            vals = namespace(key);
            if (typeof val == "function") {
                elem.addEventListener(key.replace(/^on/, ""), val, false);
            } else {
                elem.setAttributeNS(vals[0] || "", vals[1], val);
            }
        }
        args.forEach(function(e) {
            elem.appendChild(typeof e == "object" ? tag.apply(null, e) : e instanceof doc.defaultView.Node ? e : doc.createTextNode(e));
        });
        return elem;
    }
    return tag.apply(null, xml);
};

/**
 * Create and launch a timer
 * @warning You must keep a reference of the timer as long as he lives
 *
 * @this {Util}
 *
 * @param {nsITimer}
 *            timer  A previous instance of a timer to reuse, can be null: create a new one
 * @param {Function}
 *            func   The callback to be fired when the timer timeout
 * @param {Number}
 *            delay  The number of ms
 *
 * @return {nsITimer} The created timer
 */
rigantestools_Util.prototype.setTimer = function(timer, func, delay) {
    if (!timer) {
        timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    }
    timer.initWithCallback(func, delay, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    return timer;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Util);

/**
 * UtilPlayer object.
 * 
 * @constructor
 * @this {UtilPlayer}
 */
var rigantestools_UtilPlayer = {
    _dbConn : undefined,
    _players : [],
    _world: undefined
};

/**
 * initialize utilplayer if needed.
 * 
 * @this {UtilPlayer}
 */
rigantestools_UtilPlayer.isInitialized = function() {
    if (!this._dbConn) {
        try {
            var file = FileUtils.getFile("ProfD", [ "rigantesTools.sqlite" ]);
            this._dbConn = Services.storage.openDatabase(file);
            this._dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS players (id INTEGER, world INTEGER, nick TEXT)");
        } catch (e) {
            this._dbConn = undefined;
            return false;
        }
    }
    return true;
};

/**
 * get player.
 * 
 * @this {UtilPlayer}
 * @param {Number}
 *            world the world of the player.
 */
rigantestools_UtilPlayer.getPlayers = function(world) {
    if (!this.isInitialized()) {
        return false;
    }
    if ((this._players.length == 0) || (this._world != world)) {
            var statement = this._dbConn.createStatement("SELECT * FROM players where world = " + world);
            this._players = [];
            while (statement.executeStep()) {
                this._players[statement.row.id] = { id: statement.row.id, nick: decodeURI(statement.row.nick)};
            }
            this._world = world;
            statement.finalize();
    }
    return this._players;
}

/**
 * update the player list.
 * 
 * @this {UtilPlayer}
 * @param {Array}
 *            list the playerArray list.
 * @param {Number}
 *            world the world of the player.
 */
rigantestools_UtilPlayer.updatePlayersList = function(list, world) {
    if (!this.isInitialized()) {
        return false;
    }
    // load players if necessary
    this.getPlayers(world);
    // check players
    for (var index = 0; index < list.length; index++) {
        var id = list[index].id;
        var nick = list[index].nick;
        if(id && nick) {
            if (!this._players[id]) {
                var statement = this._dbConn.createStatement("INSERT INTO players VALUES (" + id + ", " + world + ", \"" + encodeURI(nick) + "\")");
                statement.executeStep();
                statement.finalize();
                this._players[id] = { id: id, nick: nick};
            } else if (this._players[id].nick != nick) {
                var statement = this._dbConn.createStatement("UPDATE players SET nick = \"" + encodeURI(nick) + "\" WHERE id = " + id + " AND world = " + world);
                statement.executeStep();
                statement.finalize();
                this._players[id] = { id: id, nick: nick};
            }
        }
    }
    return true;
};

/**
 * get the player.
 * 
 * @this {UtilPlayer}
 * @param {Number}
 *            id the id of player.
 * @param {Number}
 *            world the world of the player.
 */
rigantestools_UtilPlayer.getPlayer = function(id, world) {
    var player = {
        id : id,
        nick : 'l+k://player?' + id + '&' + world
    };
    // load players if necessary
    this.getPlayers(world);
    // get player
    if(this._players[id]) {
        player = this._players[id]; 
    }
    return player;
};

/**
 * update the player.
 * 
 * @this {UtilPlayer}
 * @param {Object}
 *            player the player to update.
 * @param {Number}
 *            world the world of the player.
 */
rigantestools_UtilPlayer.updatePlayer = function(player, world) {
    if(!player || !player.id || !player.nick) {
        return false;
    }
    
    if (this.isInitialized()) {
        // load players if necessary
        this.getPlayers(world);
        // check player
        if (!this._players[player.id]) {
            var statement = this._dbConn.createStatement("INSERT INTO players VALUES (" + player.id + ", " + world + ", \"" + encodeURI(player.nick) + "\")");
            statement.executeStep();
            statement.finalize();
            this._players[player.id] = { id: player.id, nick: player.nick};
        } else if (player.nick != this._players[player.id].nick) {
            var statement = this._dbConn.createStatement("UPDATE players SET nick = \"" + encodeURI(player.nick) + "\" WHERE id = " + player.id + " AND world = " + world);
            statement.executeStep();
            statement.finalize();
            this._players[player.id] = { id: player.id, nick: player.nick};
        }
        return true;
    }
    return false;
};
