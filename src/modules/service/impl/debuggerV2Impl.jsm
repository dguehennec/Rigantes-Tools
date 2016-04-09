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

try {
    Components.utils.import("resource://gre/modules/jsdebugger.jsm");
    addDebuggerToGlobal(this);
} catch (e) {
}

var EXPORTED_SYMBOLS = [ "rigantestools_DebuggerV2" ];

/**
 * Creates an instance of debuggerV2.
 * 
 * @constructor
 * @this {DebuggerV2}
 * 
 */
var rigantestools_DebuggerV2 = function(parent) {
    /** @private */
    /** The logger. */
    this._logger = new rigantestools_Logger("DebuggerV2");
    /** @private */
    /** the parent */
    this._parent = parent;
    /** @private */
    /** the debugger */
    this._dbg = undefined;
    /** if found Castle Link Breakpoint */
    this.foundCastleLinkBreakpoint = false;
    /** @private */
    /** if found Player Breakpoint */
    this.foundPlayerBreakpoint = false;
    /** @private */
    /** if found Player profil Breakpoint */
    this.foundPlayerProfilBreakpoint = false;
};

/**
 * initialize.
 * 
 * @this {DebuggerV2}
 * @param {Object}
 *            the window
 * @return {Boolean} true, if correctly initialized
 */
rigantestools_DebuggerV2.prototype.initialize = function(contentWinWrapper) {
    this._logger.trace("initialize");
    try {
        if (!Debugger) {
            return false;
        }
        this._dbg = new Debugger();
        this._dbg.addDebuggee(contentWinWrapper);

        // add breakpoints
        var scripts = this._dbg.findScripts();
        for ( var key in scripts) {
            var script = scripts[key];
            if (!script || !script.url) {
                continue;
            }
            if (script.url.length > 0 && script.url.indexOf("landk.js") !== -1) {
                if (script.sourceLength < 1500) {
                    var functionSource = script.source.text.substring(script.sourceStart, script.sourceStart + script.sourceLength);
                    if (!this.foundCastleLinkBreakpoint && functionSource.indexOf('="copyCastleLink"') > 0) {
                        script.setBreakpoint(0, this);
                        this._logger.trace("foundCastleLinkBreakpoint");
                        this.foundCastleLinkBreakpoint = true;
                    } else if (!this.foundPlayerBreakpoint && functionSource.indexOf("(){if(t.unreadDiscussionCount>0){") === 0) {
                        script.setBreakpoint(0, this);
                        this._logger.trace("foundPlayerBreakpoint");
                        this.foundPlayerBreakpoint = true;
                    } else if (!this.foundPlayerProfilBreakpoint && functionSource.indexOf("(t){this.dataUpdate(null,{Player") === 0) {
                        script.setBreakpoint(0, this);
                        this._logger.trace("foundPlayerProfilBreakpoint");
                        this.foundPlayerProfilBreakpoint = true;
                    }
                }
            }
            if (this.foundCastleLinkBreakpoint && this.foundPlayerBreakpoint && this.foundPlayerProfilBreakpoint) {
                break;
            }
        }
    } catch (e) {
        this._logger.trace("initialize jsDebugger error: " + e);
        return false;
    }
    return this.foundPlayerBreakpoint;
}

/**
 * reset debuggerV2
 * 
 * @this {DebuggerV2}
 */
rigantestools_DebuggerV2.prototype.reset = function() {
    this._logger.trace("reset");

    this.foundCastleLinkBreakpoint = false;
    this.foundPlayerBreakpoint = false;
    this.foundPlayerProfilBreakpoint = false;

    if (this._dbg) {
        this._dbg.clearAllBreakpoints();
    }
};

/**
 * release debuggerV2
 * 
 * @this {DebuggerV2}
 */
rigantestools_DebuggerV2.prototype.release = function() {
    this._logger.trace("release");

    this.reset();

    if (this._dbg) {
        this._dbg.onDebuggerStatement = undefined;
        this._dbg.onEnterFrame = undefined;
        this._dbg.onError = undefined;
        this._dbg.onExceptionUnwind = undefined;
        this._dbg.onNewScript = undefined;
        this._dbg.onThrow = undefined;
    }
};

/**
 * hit debuggerV2
 * 
 * @this {DebuggerV2}
 * @param {Object}
 *            the frame
 */
rigantestools_DebuggerV2.prototype.hit = function(frame) {
    try {
        var args = frame["arguments"];
        if (args.length > 1) {
            var e = args[1];
            if (e && (e === "copyCastleLink")) {
                this._parent.refreshLinks(frame.eval("t.mapX")["return"], frame.eval("t.mapY")["return"]);
            }
        } else if (args.length === 1) {
            var object = args[0];
            if (typeof (object) == "object") {
                object = XPCNativeWrapper.unwrap(object.unsafeDereference());
            }
            if (object && object.nick) {
                this._parent.refreshPlayerProfile(object);
            }
        } else if (this._parent._mplayer === null) {
            var object = frame.eval("t")["return"];
            if (typeof (object) == "object") {
                object = XPCNativeWrapper.unwrap(object.unsafeDereference());
            }
            if (object && (object.lastReadForumDate || object.lastReadReportDate)) {
                this._logger.trace("Found player");
                this._parent._mplayer = object;
                frame.script.clearBreakpoint(this);
            }
        }
    } catch (e) {
        this._logger.error("onExecute", e);
    }
}

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_DebuggerV2);
