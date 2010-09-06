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

header('Content-type: text/html; charset=UTF-8') ;
session_start();
require_once dirname(__FILE__).'/../config/icdemo.defines.php';
require_once INSTRUCTIONCONTROL__LIBRARY_DIR.'/markdown.php';
require_once INSTRUCTIONCONTROL__LIBRARY_DIR.'/instructioncontrol/InstructionControl.class.php';
require_once INSTRUCTIONCONTROL__LIBRARY_DIR.'/instructioncontrol/InstructionControl_Utils.class.php';
require_once INSTRUCTIONCONTROL__LIBRARY_DIR.'/dwoo/dwooAutoload.php';

InstructionControl::setOptions(array(
	'APE_CONFIG_SERVER'=>INSTRUCTIONCONTROL__APE_CONFIG_SERVER,
	'PDO_DATABASE_CONNECTION_STRING'=>INSTRUCTIONCONTROL__PDO_DATABASE_CONNECTION_STRING,
	'PDO_DATABASE_USERNAME'=>INSTRUCTIONCONTROL__PDO_DATABASE_USERNAME,
	'PDO_DATABASE_PASSWORD'=>INSTRUCTIONCONTROL__PDO_DATABASE_PASSWORD,
	));

class InstructionControl_Utils_Controller_Ic extends InstructionControl_Utils_Controller {
	protected function acquireData($params,$userRec) {
		$data = parent::acquireData($params,$userRec);
		$data['config']['google_maps_api_key'] = GOOGLE_MAPS_API_KEY;
		for ($i=1;$i<=7;$i++) {
			$data['help'][] = markdown(file_get_contents('./help_doc_'.$i.'.markdown.text'));
		}
		return $data;
	}
}

$controller = new InstructionControl_Utils_Controller_Ic(
	new InstructionControl_Utils_ViewRenderer_Dwoo(),
	'templ.xhtml'
	);
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
$requestMethodOverride = array_key_exists('_REQUEST_METHOD',$_REQUEST) ? $_REQUEST['_REQUEST_METHOD'] : null;

$router = new InstructionControl_Utils_Router(
	$_SERVER['PATH_INFO'],
	$_SERVER['REQUEST_METHOD'],
	$_REQUEST,
	$requestMethodOverride
	);
foreach ($routerConfig as $requestMethod=>$requestMethodData) {
	foreach ($requestMethodData as $pathInfo=>$callback) {
		$router->addRoute($requestMethod,$pathInfo,$callback);
	}
}
$router->fire();
exit(0);

