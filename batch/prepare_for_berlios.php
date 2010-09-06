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

exec('php batch/generate_docs.php');

$files = array(
	'docs/instructioncontrol/overview/index.html',
	'docs/instructioncontrol/database/index.html',
	'docs/instructioncontrol/javascript_uml/index.html',
	'docs/instructioncontrol/helloworld/index.html',
	'docs/instructioncontrol/download/index.html',
	'docs/instructioncontrol/phpdoc',
	'docs/instructioncontrol/jsdoc',
	);

$files_escaped = array();
foreach ($files as $f) {
	$files_escaped[] = escapeshellarg($f);
}

passthru('tar -zcf berlios_merge.tgz '.implode(' ',$files_escaped));
