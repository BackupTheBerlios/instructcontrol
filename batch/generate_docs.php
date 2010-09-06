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

require 'library/generate_docs.lib.php';

define('PHPDOC_LOCATION','docs/phpdoc');
define('JSDOC_LOCATION','docs/jsdoc');

generateJsDocs(
	array(
		'public/js/InstructionControl.class.js',
		),
	'docs/instructioncontrol/jsdoc');
generatePhpDocs(
	array(
		'config/ichelloworld.defines.php',
		'library/instructioncontrol/InstructionControl.class.php',
		'library/instructioncontrol/InstructionControl_Utils.class.php',
		),
	'docs/instructioncontrol/phpdoc');
generateMarkdownDirectoryDoc(
	array(
		'docs/instructioncontrol/helloworld',
		'docs/instructioncontrol/database',
		'docs/instructioncontrol/download',
		'docs/instructioncontrol/javascript_uml',
		'docs/instructioncontrol/overview'
		)
	);


