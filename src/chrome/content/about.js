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

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm", com);
Components.utils.import("resource://rigantestools/service/util.jsm", com);

/**
 * The Class About.
 * 
 * @constructor
 * @this {About}
 */
com.rigantestools.About = {
    _util : undefined
};

/**
 * Initialize About.
 * 
 * @this {About}
 */
com.rigantestools.About.init = function() {
    this._util = new com.rigantestools_Util(window);
    this._util.setAttribute("rigantestools-version", "value", this._util.getBundleString("about.version.label").replace("%VERSION%", com.rigantestools_Constant.VERSION));
};

com.rigantestools.About.openWebSite = function() {
    this._util.openURL('http://rigantes.free.fr/');
};
