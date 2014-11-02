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
 * Creates an instance of debugger.
 * 
 * @constructor
 * @this {Debugger}
 * 
 */
com.rigantestools.service.Debugger = function(parent) {
    /** @private */
    /** The logger. */
    this._logger = new com.rigantestools.service.Logger("Debugger");
    /** @private */
    /** the parent */
    this._parent = parent;
    /** @private */
    /** the debugger */
    this._jsd = undefined;
    /** @private */
    /** if found Castle Link Breakpoint */
    this.foundCastleLinkBreakpoint = false;
    /** @private */
    /** if found Player Breakpoint */
    this.foundPlayerBreakpoint = false;
};

/**
 * initialize.
 * 
 * @this {Debugger}
 * @return {Boolean} true, if correctly initialized
 */
com.rigantestools.service.Debugger.prototype.initialize = function(contentWinWrapper) {
	if(Components.classes["@mozilla.org/js/jsd/debugger-service;1"]) {
        this._jsd = Components.classes["@mozilla.org/js/jsd/debugger-service;1"].getService(Components.interfaces.jsdIDebuggerService);
        this._logger.trace("JSD running: " + this._jsd.isOn);
        // starting debugging
        if (this._jsd.isOn) {
            this.onDebuggerActivated();
        } else if ("asyncOn" in this._jsd) {
            this._jsd.asyncOn(this);
        } else {
            this._jsd.on();
            this.onDebuggerActivated();
        }
        this._logger.trace("initialize ok");
    }
	else {
        this._logger.trace("Debugger not supported yet");
	}
}


/**
 * release debugger
 * 
 * @this {Debugger}
 */
com.rigantestools.service.Debugger.prototype.reset = function() {
    this._logger.trace("reset");
    
    this.foundCastleLinkBreakpoint = false;
    this.foundPlayerBreakpoint = false;
    
    if(this._jsd) {
        this._jsd.clearAllBreakpoints();
    }
};

/**
 * release debugger
 * 
 * @this {Debugger}
 */
com.rigantestools.service.Debugger.prototype.release = function() {
    this._logger.trace("release");

    this.reset();
    
    if(this._jsd) {
	    this._jsd.functionHook = null;
	    this._jsd.breakpointHook = null;
	    this._jsd.debuggerHook = null;
	    this._jsd.debugHook = null;
	    this._jsd.errorHook = null;
	    this._jsd.scriptHook = null;
	    this._jsd.interruptHook = null;
	    this._jsd.throwHook = null;
	    this._jsd.GC();
	    if (this._jsd.isOn) {
	        this._jsd.off();
	    }
    }
};

/**
 * on debugger activated
 * 
 * @this {Debugger}
 */
com.rigantestools.service.Debugger.prototype.onDebuggerActivated = function() {
    this._logger.trace("onDebuggerActivated");
    if(this._jsd) {
        this._jsd.scriptHook = this;
        this._jsd.breakpointHook = this;
        this._jsd.debuggerHook = this;
        this._jsd.debugHook = this;

        this._jsd.functionHook = null;
        this._jsd.errorHook = null;
        this._jsd.interruptHook = null;
        this._jsd.throwHook = null;
    }
};

/**
 * on script created
 * 
 * @this {Debugger}
 * @param {Object}
 *            script
 */
com.rigantestools.service.Debugger.prototype.onScriptCreated = function(script) {
    if (script.fileName.indexOf("landk.js") !== -1) {
        try {
            if (!this.foundCastleLinkBreakpoint && script.functionSource.indexOf('e==="copyCastleLink"') > 0) {
                script.setBreakpoint(0);
                this.foundCastleLinkBreakpoint = true;
            } else if (!this.foundPlayerBreakpoint && script.functionSource.indexOf("function (){this.stats={units:{own:this.getOwnUnits()") === 0) {
                script.setBreakpoint(0);
                this.foundPlayerBreakpoint = true;
            }
        } catch (e) {
            // do nothing
        }
    }
};

/**
 * on script destroyed
 * 
 * @this {Debugger}
 * @param {Object}
 *            script
 */
com.rigantestools.service.Debugger.prototype.onScriptDestroyed = function(script) {

};

/**
 * on breakpoint execute
 * 
 * @this {Debugger}
 * @param {Object}
 *            frame
 * @param {Object}
 *            type
 * @param {Object}
 *            val
 * @return {Number} result of execution
 * 
 */
com.rigantestools.service.Debugger.prototype.onExecute = function(frame, type, val) {
    try {
        var mplayer = frame.thisValue.getWrappedValue();
        if ((this._parent._mplayer === null) && (mplayer.lastReadForumDate || mplayer.lastReadReportDate)) {
        	this._logger.trace("Found player");
            this._parent._mplayer = mplayer;
            frame.script.clearBreakpoint(0);
        } else {
            var p = {};
            frame.scope.getProperties(p, {});
            p = p.value;
            var t = null;
            var e = null;
            for ( var i = 0; i < p.length; ++i) {
                if (p[i].name.stringValue === 't') {
                    t = p[i].value.getWrappedValue();
                } else if (p[i].name.stringValue === 'e') {
                    e = p[i].value.getWrappedValue();
                }
            }
            if ((t !== null) && (e !== null) && (e === "copyCastleLink")) {
                this._parent.refreshLinks(t.mapX, t.mapY);
            }
        }
    } catch (e) {
        this._logger.error("onExecute: " + frame.script.fileName + ", type: " + type + " error:" + e);
    }
    return Components.interfaces.jsdIExecutionHook.RETURN_CONTINUE;
};