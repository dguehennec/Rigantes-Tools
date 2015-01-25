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

Components.utils.import("resource://rigantestools/service/util.jsm");
Components.utils.import("resource://rigantestools/service/logger.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_Exporter" ];

/**
 * Creates an instance of Exporter.
 * 
 * @constructor
 * @this {Exporter}
 */
var rigantestools_Exporter = function(window) {
    /** @private */
    /** The util tool. */
    this._util = new rigantestools_Util(window);
    /** @private */
    /** The DomDocument. */
    this._document = window.document;
}

/**
 * export War in CSV.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
rigantestools_Exporter.prototype.WarInCSV = function(treechildren, informations) {
    // generate header
    var informationContent = "";
    for (var index = 0; index < informations.length; index++) {
        informationContent += informations[index] + "\n";
    }
    var generatedExportInformations = this._util.getBundleString("mainframe.war.csv.title").replace("%INFORMATIONS%", informationContent) + "\n";
    // generate tree
    for (var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        for (var j = 0; j < length; j++) {
            if (j === 1) {
                var palist = item.childNodes[j].getAttribute('label').replace("(", "").replace(")", "").split(" ");
                generatedExportInformations += palist[0] + ";";
                if (palist.length > 1) {
                    generatedExportInformations += palist[1] + ";";
                } else {
                    generatedExportInformations += palist[0] + ";";
                }
            } else {
                generatedExportInformations += item.childNodes[j].getAttribute('label') + ";";
            }
        }
        generatedExportInformations += "\n";
    }
    // save content in file
    this._util.saveContentToFile(this._util.getBundleString("mainframe.war.csv.export.title"), this._util.getBundleString("mainframe.war.csv.export.filename"), generatedExportInformations);
}

/**
 * export War in XLS.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
rigantestools_Exporter.prototype.WarInXLS = function(treechildren, informations) {
    var generatedExportInformations = this._util.getBundleString("mainframe.war.csv.title");
    generatedExportInformations = generatedExportInformations.replace("\n\n", "</br><table><tr><td>");
    generatedExportInformations = generatedExportInformations.replace(/;/g, "</td><td>");
    generatedExportInformations += '</td></tr>';
    // sanitizing informations
    var jsonInformationItem = [ "html:div", {
        id : "header"
    } ];
    for (var index = 0; index < informations.length; index++) {
        jsonInformationItem.push([ "html:div", {}, informations[index] ]);
    }
    generatedExportInformations = generatedExportInformations.replace("%INFORMATIONS%", this._util.JSONToDOM(jsonInformationItem, this._document, {}).outerHTML);
    // generate tree with sanitizing parameters
    var jsonTableItem = [ "html:table", {} ];
    for (var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        var jsonTrItem = [ "html:tr", {} ];
        for (var j = 0; j < length; j++) {
            if (j === 1) {
                var palist = item.childNodes[j].getAttribute('label').replace("(", "").replace(")", "").split(" ");
                jsonTrItem.push([ "html:td", {}, palist[0] ]);
                if (palist.length > 1) {
                    jsonTrItem.push([ "html:td", {}, palist[1] ]);
                } else {
                    jsonTrItem.push([ "html:td", {}, palist[0] ]);
                }
            } else {
                jsonTrItem.push([ "html:td", {}, item.childNodes[j].getAttribute('label') ]);
            }
        }
        jsonTableItem.push(jsonTrItem);
    }
    generatedExportInformations += this._util.JSONToDOM(jsonTableItem, this._document, {}).innerHTML;
    // add footer
    generatedExportInformations += "</table></br><div>" + this._util.formatDateTime(new Date()) + "</div>";
    // save content in file
    this._util.saveContentToXLSFile(this._util.getBundleString("mainframe.war.csv.export.filename"), generatedExportInformations);
}

/**
 * export War in HTML.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
rigantestools_Exporter.prototype.WarInHTML = function(treechildren, informations) {
    var generatedPrintInformations = this._util.getBundleString("mainframe.war.html.header");
    // sanitizing informations
    var jsonInformationItem = [ "html:div", {
        id : "header"
    } ];
    for (var index = 0; index < informations.length; index++) {
        jsonInformationItem.push([ "html:div", {}, informations[index] ]);
    }
    generatedPrintInformations = generatedPrintInformations.replace("%INFORMATIONS%", this._util.JSONToDOM(jsonInformationItem, this._document, {}).outerHTML);
    // generate tree with sanitizing parameters
    var jsonTableItem = [ "html:table", {} ];
    for (var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        var jsonTrItem = [ "html:tr", {
            "class" : "color" + (i % 2)
        } ];
        for (var j = 0; j < length; j++) {
            jsonTrItem.push([ "html:td", {}, item.childNodes[j].getAttribute('label') ]);
        }
        jsonTableItem.push(jsonTrItem);
    }
    generatedPrintInformations += this._util.JSONToDOM(jsonTableItem, this._document, {}).innerHTML;
    // add footer
    generatedPrintInformations += "</table><div id=\"footer\">" + this._util.formatDateTime(new Date()) + "</div></body></html>";
    // print content
    this._util.printContent(generatedPrintInformations);
}

/**
 * export Attack Defense Slow in CSV.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
rigantestools_Exporter.prototype.AttackDefenseSlowInCSV = function(treechildren, informations) {
    // generate header
    var informationContent = "";
    for (var index = 0; index < informations.length; index++) {
        informationContent += informations[index] + "\n";
    }
    var generatedExportInformations = this._util.getBundleString("mainframe.attackDefenseSlow.csv.title").replace("%INFORMATIONS%", informationContent) + "\n";
    // generate tree
    for (var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        for (var j = 0; j < length; j++) {
            generatedExportInformations += item.childNodes[j].getAttribute('label') + ";";
        }
        generatedExportInformations += "\n";
    }
    // save content in file
    this._util.saveContentToFile(this._util.getBundleString("mainframe.attackDefenseSlow.csv.export.title"), this._util.getBundleString("mainframe.attackDefenseSlow.csv.export.filename"),
            generatedExportInformations);
}

/**
 * export Attack Defense Slow in XLS.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
rigantestools_Exporter.prototype.AttackDefenseSlowInXLS = function(treechildren, informations) {
    var generatedExportInformations = this._util.getBundleString("mainframe.attackDefenseSlow.csv.title");
    generatedExportInformations = generatedExportInformations.replace("\n\n", "</br><table><tr><td>");
    generatedExportInformations = generatedExportInformations.replace(/;/g, "</td><td>");
    generatedExportInformations += '</td></tr>';
    // sanitizing informations
    var jsonInformationItem = [ "html:div", {
        id : "header"
    } ];
    for (var index = 0; index < informations.length; index++) {
        jsonInformationItem.push([ "html:div", {}, informations[index] ]);
    }
    generatedExportInformations = generatedExportInformations.replace("%INFORMATIONS%", this._util.JSONToDOM(jsonInformationItem, this._document, {}).outerHTML);
    // generate tree with sanitizing parameters
    var jsonTableItem = [ "html:table", {} ];
    for (var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        var jsonTrItem = [ "html:tr", {} ];
        for (var j = 0; j < length; j++) {
            jsonTrItem.push([ "html:td", {}, item.childNodes[j].getAttribute('label') ]);

        }
        jsonTableItem.push(jsonTrItem);
    }
    generatedExportInformations += this._util.JSONToDOM(jsonTableItem, this._document, {}).innerHTML;
    // add footer
    generatedExportInformations += "</table></br><div>" + this._util.formatDateTime(new Date()) + "</div>";
    // save content in file
    this._util.saveContentToXLSFile(this._util.getBundleString("mainframe.attackDefenseSlow.csv.export.filename"), generatedExportInformations);
}

/**
 * export Attack Defense Slow in HTML.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
rigantestools_Exporter.prototype.AttackDefenseSlowInHTML = function(treechildren, informations) {
    var generatedPrintInformations = this._util.getBundleString("mainframe.attackDefenseSlow.html.header");
    // sanitizing informations
    var jsonInformationItem = [ "html:div", {
        id : "header"
    } ];
    for (var index = 0; index < informations.length; index++) {
        jsonInformationItem.push([ "html:div", {}, informations[index] ]);
    }
    generatedPrintInformations = generatedPrintInformations.replace("%INFORMATIONS%", this._util.JSONToDOM(jsonInformationItem, this._document, {}).outerHTML);
    // generate tree with sanitizing parameters
    var jsonTableItem = [ "html:table", {} ];
    for (var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        var jsonTrItem = [ "html:tr", {
            "class" : "color" + (i % 2)
        } ];
        for (var j = 0; j < length; j++) {
            jsonTrItem.push([ "html:td", {}, item.childNodes[j].getAttribute('label') ]);
        }
        jsonTableItem.push(jsonTrItem);
    }
    generatedPrintInformations += this._util.JSONToDOM(jsonTableItem, this._document, {}).innerHTML;
    // add footer
    generatedPrintInformations += "</table><div id=\"footer\">" + this._util.formatDateTime(new Date()) + "</div></body></html>";
    // print content
    this._util.printContent(generatedPrintInformations);
}

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Exporter);
