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
Components.utils.import("resource://rigantestools/service/fightPreview.jsm");

var EXPORTED_SYMBOLS = [ "rigantestools_CurrentSlowDefenseCalculate" ];

/**
 * Creates an instance of SlowAttackDefenseCalculate.
 * 
 * @constructor
 * @this {CurrentSlowDefenseCalculate}
 * @param {Player}
 *            player the player
 */
var rigantestools_CurrentSlowDefenseCalculate = function( habitat, battleDate ) 
{
    this._logger = new rigantestools_Logger("CurrentSlowDefenseCalculate");
    this._logger.trace("init");

	var listud = [] ;
 
	this.defense_list = [] ;


	var unitList ;

	// Get units in castle */
	for( var ii=0 ; ii<2; ii=ii+1 )
	{
     			
		if( ii==0 )
 		{
			unitList = habitat.getHabitatUnits(rigantestools_Constant.BATTLETYPE.OWN_HABITAT);
		}
		else
 		{
			unitList = habitat.getHabitatUnits(rigantestools_Constant.BATTLETYPE.EXTERNAL_UNITS_TO_DEFENSE);
		}

		for( var key in unitList ) 
		{
			var nbud = 0 ;
			if( 1 ) 
			{
                  
                nbud = this.addUnits(  unitList[key], 0, listud ) ; 
                    				
				var item = {'castle':unitList[key].sourceHabitatName,'player':unitList[key].sourceHabitatPlayerName,'date':null,'nbud':nbud};
   				
				this.defense_list.push( item ) ;
    		}
          	   					
		}
	}	
	

	// Get incoming units
	unitList = habitat.getHabitatTransits(rigantestools_Constant.TRANSITTYPE.DEFENSE,true);
  	
    
	for(var key in unitList) 
	{
		var nbud = 0 ;
 		if (unitList.hasOwnProperty(key)) 
		{             		
                           
          	nbud = this.addUnits(  unitList[key], unitList[key].date.getTime(), listud ) ; 

			var item = {'castle':unitList[key].sourceHabitatName,'player':unitList[key].sourceHabitatPlayerName,'date':unitList[key].date,'nbud':nbud};

			this.defense_list.push( item ) ;
          	   					
		}
    }
		
	this.fightPreview = new rigantestools_FightPreview( habitat, listud, battleDate  ) ;
	this.maxDefenseTime = this.fightPreview.fightpreview_dltime/1000 ;
	this.maxDefenseDate = this.fightPreview.fightpreview_trou;
	this.trou = this.fightPreview.fightpreview_trou ;
 
};

rigantestools_CurrentSlowDefenseCalculate.prototype.addUnits = function( habitat, time, listud )
{
    var index, unit;
    var nb = 0;
    for (index = 0; index < habitat._units.length; index++) {
        unit = habitat._units[index];
        if(  unit.getCount() > 0 )
        {
        	nb += unit.getCount() ;
 			var item = {'nb':unit.getCount(),'type':unit.getType(),'time':time};
			listud.push(item);
		}
    }
	return nb ;
};

/**
 * Freeze the interface
 */
Object.freeze(rigantestools_CurrentSlowDefenseCalculate);


































