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

header('Content-type: text/html; charset=UTF-8'); // We will be using UTF-8 with the client
session_start(); // Start the session
require_once dirname(__FILE__).'/../config/ichelloworld.defines.php'; // Import InstructionControl classes
require_once INSTRUCTIONCONTROL__LIBRARY_DIR.'/instructioncontrol/InstructionControl.class.php';
require_once INSTRUCTIONCONTROL__LIBRARY_DIR.'/instructioncontrol/InstructionControl_Utils.class.php';

/*
 * Tell InstructionControl how to connect to it's database as well as how to
 * contact the APE server.
 */
InstructionControl::setOptions(array(
	'APE_CONFIG_SERVER'=>INSTRUCTIONCONTROL__APE_CONFIG_SERVER,
	'PDO_DATABASE_CONNECTION_STRING'=>INSTRUCTIONCONTROL__PDO_DATABASE_CONNECTION_STRING,
	'PDO_DATABASE_USERNAME'=>INSTRUCTIONCONTROL__PDO_DATABASE_USERNAME,
	'PDO_DATABASE_PASSWORD'=>INSTRUCTIONCONTROL__PDO_DATABASE_PASSWORD,
	));

/*
 * Create an instance of the InstructionControl Controller, this is not actually
 * required at all because the router is controlled by callbacks, so it's really
 * flexible.
 *
 * You pass an instance of InstructionControl_ViewRenderer into the controller
 * which controls how to render the initial page in InstructionControl. There are
 * currently two versions, Php which just renders a standard PHP page as well as
 * Dwoo which uses the Dwoo template engine.
 */
$controller = new InstructionControl_Utils_Controller(
	new InstructionControl_Utils_ViewRenderer_Php(),
	INSTRUCTIONCONTROL__WEBROOT.'/helloworld.php'
	);

/*
 * Sometimes proxies and other wierdness can get in the way of the DELETE and 
 * PUT request methods methods so we have a concept of a request method override
 * which overrides that actual request method with a request variable.
 */
$requestMethodOverride = array_key_exists('_REQUEST_METHOD',$_REQUEST) ? $_REQUEST['_REQUEST_METHOD'] : null;
/*
 * Crate an instance of the InstructionControl_Router, it requires the PATH_INFO
 * and REQUEST_METHOD Apache server variables for calculation of the REST
 * routing information.  
 */ 
$router = new InstructionControl_Utils_Router(
	$_SERVER['PATH_INFO'],
	$_SERVER['REQUEST_METHOD'],
	$_REQUEST,
	$requestMethodOverride
	);

/*
 * This will configure the Router to call methods from the Controller on certain
 * patterns of $_SERVER['PATH_INFO']
 */ 
$routerConfig = array(
	'GET'=>array(
		'/:channelset'=>array($controller,'restGetChannelset'),
		'/:channelset/user'=>array($controller,'restGetChannelsetUser'),
		'/:channelset/user/:communication_key'=>array($controller,'restGetChannelsetUserCommunicationkey'),
		'/:channelset/:channel/:instruction'=>array($controller,'restGetChannelsetChannelInstruction'),
		'/:channelset/:channel'=>array($controller,'restGetChannelsetChannel'),
		'/'=>array($controller,'restRedirect'),
		''=>array($controller,'restRedirect'),
		),
	'POST'=>array(
		'/:channelset/:channel'=>array($controller,'restPostChannelsetChannel'),
		),
	'PUT'=>array(
		'/:channelset/user/me'=>array($controller,'restPutChannelsetUserMe'),
		),
	);
foreach ($routerConfig as $requestMethod=>$requestMethodData) {
	foreach ($requestMethodData as $pathInfo=>$callback) {
		$router->addRoute($requestMethod,$pathInfo,$callback);
	}
}
/*
 * Lastly fire the router
 */
$router->fire();
