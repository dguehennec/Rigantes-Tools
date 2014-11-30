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
Components.utils.import("resource://rigantestools/service/impl/debuggerV1Impl.jsm");
Components.utils.import("resource://rigantestools/service/impl/debuggerV2Impl.jsm");
Components.utils.import("resource://rigantestools/constant/constants.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_Debugger" ];

/**
 * Creates an instance of debugger.
 * 
 * @constructor
 * @this {Debugger}
 * 
 */
var rigantestools_Debugger = function(parent) {
    /** @private */
    /** The logger. */
    this._logger = new rigantestools_Logger("Debugger");
    /** @private */
    /** the parent */
    this._parent = parent;
    /** @private */
    /** the debuggers */
    this._jsd = new rigantestools_DebuggerV1(parent);
    this._dbg = new rigantestools_DebuggerV2(parent);
    /** the current debugger */
    this._currentdebugger = null;

};

/**
 * initialize.
 * 
 * @this {Debugger}
 * @param {Object}
 *            the window
 * @return {Boolean} true, if correctly initialized
 */
rigantestools_Debugger.prototype.initialize = function(contentWinWrapper) {
    this._logger.trace("initialize");

    if (this._currentdebugger) {
        this._currentdebugger.release();
        this._currentdebugger = null;
    }

    if (this._dbg.initialize(contentWinWrapper)) {
        this._currentdebugger = this._dbg;
        return true;
    } else if (this._jsd.initialize(contentWinWrapper)) {
        this._currentdebugger = this._jsd;
        return true;
    }
    this._logger.trace("no debugger found");
    return false;
}

/**
 * reset debugger
 * 
 * @this {Debugger}
 */
rigantestools_Debugger.prototype.reset = function() {
    this._logger.trace("reset");
    if (this._currentdebugger) {
        this._currentdebugger.reset();
    }
};

/**
 * release debugger
 * 
 * @this {Debugger}
 */
rigantestools_Debugger.prototype.release = function() {
    this._logger.trace("release");
    if (this._currentdebugger) {
        this._currentdebugger.release();
    }
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_Debugger);
