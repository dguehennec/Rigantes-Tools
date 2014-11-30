#Rigantes Tools is a Firefox addon for the game LordsAndKnights (http://lordsandknights.com/)

## Description

Rigantes Tools is a Firefox addon for the game LordsAndKnights (http://lordsandknights.com/)

This tool allows you to:
- View information of all its castles by geographical area defined option
- Quickly prepare an attack,
- Quickly prepare a slow defense,
- Send help to a player in danger,
- Simulating an attack to see if you have a chance to win
- See ongoing attacks
- Have system notifications for the events in the game
- And many other things ...

For more information see http://rigantes.free.fr

### Important:

This tool respect the terms of use of the game
No interaction with the game is accomplish through this tool and no user data is stored or transferred.

## Usage

	# Maven is used to generate Firefox extension (xpi) of Rigantes Tools sources.
	# There are 2 profiles (Dev en Prod)
	
	# In Dev mode, just sources is packaging, use the next command line
	mvn clean install -PDev
	
	# In Prod mode, jsDoc is generated and Sonar is executed
	# (it is necessary to have Sonar installed on localhost), use the next command line
	mvn clean install -PProd
