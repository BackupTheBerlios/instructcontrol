<?php

/*
Copyright (C) 2010 Matthew Forrester.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

define('GOOGLE_MAPS_API_KEY','YOUR GOOGLE MAPS API KEY HERE');

/**
 * The server name
 */
define('INSTRUCTIONCONTROL__SERVER_NAME',$_SERVER['HTTP_HOST']);
/**
 * The URL that InstructionControl will use for communication, relative to the document root, must include a "/" at the start
 */
define('INSTRUCTIONCONTROL__PHP_URL',$_SERVER['SCRIPT_NAME']);
/**
 * The documument root for the web server, used as a relative path for finding libraries etc.
 */
define('INSTRUCTIONCONTROL__WEBROOT',dirname($_SERVER['SCRIPT_FILENAME']));

/**
 * The URL that is the document root
 */
define('INSTRUCTIONCONTROL__BASEURL','http://'.INSTRUCTIONCONTROL__SERVER_NAME);
/**
 * Controls whether to communicate with other clients through APE.
 */
define('INSTRUCTIONCONTROL__NOTIFY_OTHER_CLIENTS','JUSTME');
/**
 * Where the InstructionControl libraries are stored.
 */
define('INSTRUCTIONCONTROL__LIBRARY_DIR',realpath(INSTRUCTIONCONTROL__WEBROOT.'/../library'));
/**
 * The root of where the APE JSF files are stored relative to the document root.
 */
define('INSTRUCTIONCONTROL__APE_JSF_ROOT','/ape-jsf');
/**
 * The APE JSF client to load. 
 */
define('INSTRUCTIONCONTROL__APE_CLIENTJS','./'.INSTRUCTIONCONTROL__APE_JSF_ROOT.'/Build/uncompressed/apeClientJS.js');
/**
 * The base URL for APE JSF.
 */
define('INSTRUCTIONCONTROL__APE_CONFIG_BASEURL','http://'.INSTRUCTIONCONTROL__SERVER_NAME.INSTRUCTIONCONTROL__APE_JSF_ROOT);
/**
 * The domain for APE.
 */
define('INSTRUCTIONCONTROL__APE_CONFIG_DOMAIN','auto');
/**
 * The name and port of the APE server in the form [SERVER_NAME]:[PORT].
 */
define('INSTRUCTIONCONTROL__APE_CONFIG_SERVER','ape.'.INSTRUCTIONCONTROL__SERVER_NAME.':6969');
/**
 * Connection string to the InstructionControl database.
 */
define('INSTRUCTIONCONTROL__PDO_DATABASE_CONNECTION_STRING','mysql:host=localhost;dbname=icdemo');
/**
 * Username to the InstructionControl database.
 */
define('INSTRUCTIONCONTROL__PDO_DATABASE_USERNAME','icdemo');
/**
 * Password to the InstructionControl database.
 */
define('INSTRUCTIONCONTROL__PDO_DATABASE_PASSWORD','icdemo');
/**
 * Where Dwoo templates will be compiled to.
 */
define('INSTRUCTIONCONTROL__CONFIG_DWOO_COMPILEDIR','/tmp/instructioncontrol-dwoo-compiledir');
