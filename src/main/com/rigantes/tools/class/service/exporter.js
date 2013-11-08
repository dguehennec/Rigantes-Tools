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

if (!com) {
    var com = {};
}
if (!com.rigantestools) {
    com.rigantestools = {};
}
if (!com.rigantestools.service) {
    com.rigantestools.service = {};
}

/**
 * Creates an instance of Exporter.
 * 
 * @constructor
 * @this {Exporter}
 */
com.rigantestools.service.Exporter = function() {
	/** @private */
    /** The util tool. */
    this._util = new com.rigantestools.service.Util();
}

/**
 * export War in CSV.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
com.rigantestools.service.Exporter.prototype.WarInCSV = function(treechildren) {
	var generatedExportInformations = this._util.getBundleString("mainframe.war.csv.title").replace("%TARGETLINK%", com.rigantestools.MainFrame.currentTargetLink) + "\n"; 
    for ( var i = 0; i < treechildren.childNodes.length; i++) { 
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length; 
        for ( var j = 0; j < length; j++) {
            if(j===1) {
                var palist = item.childNodes[j].getAttribute('label').replace("(","").replace(")","").split(" "); 
                generatedExportInformations += palist[0] + ";";
                if(palist.length>1) {
                    generatedExportInformations += palist[1] + ";";
                }
                else {
                    generatedExportInformations += palist[0] + ";";
                }
            }
            else {
                generatedExportInformations += item.childNodes[j].getAttribute('label') + ";";
            }
        }
        generatedExportInformations += "\n"; 
    }
    this._util.saveContentToFile(this._util.getBundleString("mainframe.war.csv.export.title"), this._util.getBundleString("mainframe.war.csv.export.filename"), generatedExportInformations);
}


/**
 * export War in XLS.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
com.rigantestools.service.Exporter.prototype.WarInXLS = function(treechildren) {
	var generatedExportInformations =  this._util.getBundleString("mainframe.war.csv.title").replace("%TARGETLINK%", com.rigantestools.MainFrame.currentTargetLink);
	generatedExportInformations = generatedExportInformations.replace("\n\n","</br><table><tr><td>");
	generatedExportInformations = generatedExportInformations.replace(/;/g,"</td><td>");
	generatedExportInformations += '</td></tr>';
	
	for ( var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        var jsonTreeItem = ["html:tr", {}];
        for ( var j = 0; j < length; j++) {
            if(j===1) {
                var palist = item.childNodes[j].getAttribute('label').replace("(","").replace(")","").split(" "); 
                jsonTreeItem.push([ "html:td", {}, palist[0]]);
                if(palist.length>1) {
                    jsonTreeItem.push([ "html:td", {},  palist[1]]);
                }
                else {
                    jsonTreeItem.push([ "html:td", {}, palist[0]]);
                }
            }
            else {
                jsonTreeItem.push([ "html:td", {}, item.childNodes[j].getAttribute('label')]);
            }
        }
        generatedExportInformations += this._util.JSONToDOM(jsonTreeItem, document, {}).outerHTML;
    }
	generatedExportInformations += "</table></br><div>" + this._util.formatDateTime(new Date()) + "</div>";
    this._util.saveContentToXLSFile(this._util.getBundleString("mainframe.war.csv.export.filename"), generatedExportInformations);
}

/**
 * export War in HTML.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
com.rigantestools.service.Exporter.prototype.WarInHTML = function(treechildren) {
	var reg = new RegExp("(##)", "g");
	var printHeader = com.rigantestools.MainFrame._generatedWarInformations;
	printHeader = printHeader.substring(0, printHeader.lastIndexOf("##"));
	printHeader = printHeader.substring(0, printHeader.lastIndexOf("##"));
	printHeader = printHeader.replace(reg, "</br>");
	var generatedPrintInformations = this._util.getBundleString("mainframe.war.html.header").replace("%TARGETLINK%", printHeader);
	for ( var i = 0; i < treechildren.childNodes.length; i++) {
		var item = treechildren.childNodes[i].childNodes[0];
		var length = item.childNodes.length;
		var jsonTreeItem = ["html:tr", {class : "color" + (i % 2)}];
		for ( var j = 0; j < length; j++) {
			jsonTreeItem.push([ "html:td", {},  item.childNodes[j].getAttribute('label')]);
		}
		generatedPrintInformations += this._util.JSONToDOM(jsonTreeItem, document, {}).outerHTML;
	}
	generatedPrintInformations += "</table><div id=\"footer\">" + this._util.formatDateTime(new Date()) + "</div></body></html>";
	this._util.printContent(generatedPrintInformations);
}

/**
 * export Attack Defense Slow in CSV.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
com.rigantestools.service.Exporter.prototype.AttackDefenseSlowInCSV = function(treechildren) {
	var generatedExportInformations = this._util.getBundleString("mainframe.attackDefenseSlow.csv.title").replace("%TARGETLINK%", this._util.getAttribute('rigantestools-attackDefenseSlowInfoTarget', 'value')) + "\n";
 	for ( var i = 0; i < treechildren.childNodes.length; i++) {
 		var item = treechildren.childNodes[i].childNodes[0];
 		var length = item.childNodes.length;
 		for ( var j = 0; j < length; j++) {
 			generatedExportInformations += item.childNodes[j].getAttribute('label') + ";";
 		}
 		generatedExportInformations += "\n";
 	}
 	this._util.saveContentToFile(this._util.getBundleString("mainframe.attackDefenseSlow.csv.export.title"), this._util.getBundleString("mainframe.attackDefenseSlow.csv.export.filename"), generatedExportInformations);
}

/**
 * export Attack Defense Slow in XLS.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
com.rigantestools.service.Exporter.prototype.AttackDefenseSlowInXLS = function(treechildren) {
	var generatedExportInformations =  this._util.getBundleString("mainframe.attackDefenseSlow.csv.title").replace("%TARGETLINK%", this._util.getAttribute('rigantestools-attackDefenseSlowInfoTarget', 'value'));
    generatedExportInformations = generatedExportInformations.replace("\n\n","</br><table><tr><td>");
    generatedExportInformations = generatedExportInformations.replace(/;/g,"</td><td>");
    generatedExportInformations += '</td></tr>';
    for ( var i = 0; i < treechildren.childNodes.length; i++) {
        var item = treechildren.childNodes[i].childNodes[0];
        var length = item.childNodes.length;
        var jsonTreeItem = ["html:tr", {}];
        for ( var j = 0; j < length; j++) {
            jsonTreeItem.push([ "html:td", {},  item.childNodes[j].getAttribute('label')]);

        }
        generatedExportInformations += this._util.JSONToDOM(jsonTreeItem, document, {}).outerHTML;
    }
    generatedExportInformations += "</table></br><div>" + this._util.formatDateTime(new Date()) + "</div>";
    this._util.saveContentToXLSFile(this._util.getBundleString("mainframe.attackDefenseSlow.csv.export.filename"), generatedExportInformations);
}

/**
 * export Attack Defense Slow in HTML.
 * 
 * @this {Exporter}
 * @param {treechildren}
 */
com.rigantestools.service.Exporter.prototype.AttackDefenseSlowInHTML = function(treechildren) {
	var generatedPrintInformations = this._util.getBundleString("mainframe.attackDefenseSlow.html.header").replace("%TARGETLINK%", this._util.getAttribute('rigantestools-attackDefenseSlowInfoTarget', 'value'));
	for ( var i = 0; i < treechildren.childNodes.length; i++) {
		var item = treechildren.childNodes[i].childNodes[0];
		var length = item.childNodes.length;
		var jsonTreeItem = ["html:tr", {class : "color" + (i % 2)}];
		for ( var j = 0; j < length; j++) {
			jsonTreeItem.push([ "html:td", {},  item.childNodes[j].getAttribute('label')]);
		}
		generatedPrintInformations += this._util.JSONToDOM(jsonTreeItem, document, {}).outerHTML;
	}
	generatedPrintInformations += "</table><div id=\"footer\">" + this._util.formatDateTime(new Date()) + "</div></body></html>";
	this._util.printContent(generatedPrintInformations);
}